import { Injectable } from '@angular/core';
import { ClassesService } from './classes.service';
import { shuffle } from '../utils';
import { SharpBrush } from '../Components/drawing/drawtools';
@Injectable({
  providedIn: 'root',
})
export class DrawService {
  constructor(private classService: ClassesService) {}

  convertImgToBoundaryRegion(
    img: Uint8ClampedArray,
    kernel: Array<Array<number>>,
    width: number,
    height: number
  ): Uint8ClampedArray {
    let ksize = kernel[0].length;
    let sz = (ksize - 1) / 2;
    let output = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let index = (y * width + x) * 4;
        output[index + 3] = 255;
        if (img[index] > 0 && img[index + 1] > 0 && img[index + 2] > 0) {
          output[index] = img[index];
          output[index + 1] = img[index + 1];
          output[index + 2] = img[index + 2];
          output[index + 3] = img[index + 3];

          if (!this.isOnBoundary(x, y, width, height, sz)) {
            let set = new Array<number>();
            for (let i = 0; i < ksize; i++) {
              for (let j = 0; j < ksize; j++) {
                if (kernel[i][j] == 1) {
                  let m = ((y + j - sz) * width + (i + x - sz)) * 4;
                  let l = this.classService.getClassFromRGB(
                    img.slice(m, m + 3)
                  );
                  if (!set.includes(l)) {
                    set.push(l);
                  }
                  if (set.length > 1) {
                    break;
                  }
                }
              }
              if (set.length > 1) {
                break;
              }
            }
            if (set.length == 1) {
              const l = set[0];
              if (l > 0) {
                output[index] = 0;
                output[index + 1] = 0;
                output[index + 2] = 0;
              }
            }
          }
        }
      }
    }
    return output;
  }

  dilate(
    img: Uint8ClampedArray,
    kernel: Array<Array<number>>,
    width: number,
    height: number
  ): Uint8ClampedArray {
    let ksize = kernel[0].length;
    let sz = (ksize - 1) / 2;
    let output = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let index = (y * width + x) * 4;
        output[index + 3] = 255;

        if (!this.isOnBoundary(x, y, width, height, sz)) {
          let l = 0;
          for (let i = 0; i < ksize; i++) {
            for (let j = 0; j < ksize; j++) {
              if (kernel[i][j] == 1) {
                let m = ((y + j - sz) * width + (i + x - sz)) * 4;
                let c = this.classService.getClassFromRGB(img.slice(m, m + 3));
                l = c > l ? c : l;
              }
              if (l > 0) break;
            }
            if (l > 0) break;
          }
          if (l > 0) {
            let rgb = this.classService.classToRGB[l];
            output[index] = rgb[0];
            output[index + 1] = rgb[1];
            output[index + 2] = rgb[2];
          }
        }
      }
    }
    return output;
  }

  private isOnBoundary(
    x: number,
    y: number,
    width: number,
    height: number,
    sz: number
  ): boolean {
    return !(x - sz > 0 && x + sz < width && y - sz > 0 && y + sz < height);
  }

  getKernel(r: number): Array<Array<number>> {
    let kernel = new Array<Array<number>>();

    for (let i = 0; i < r * 2 + 1; i++) {
      let row = new Array<number>();
      for (let j = 0; j < r * 2 + 1; j++) {
        if (Math.pow(i - r, 2) + Math.pow(j - r, 2) < Math.pow(r, 2)) {
          row.push(1);
        } else {
          row.push(0);
        }
      }
      kernel.push(row);
    }
    return kernel;
  }
  shuffleLabels(img: Uint8ClampedArray): Uint8ClampedArray {
    let newClasses = shuffle<number>([
      ...Array<number>(this.classService.classes.length).keys(),
    ]);
    return this.swapLabels(img, newClasses)
  }
  swapLabels(img:Uint8ClampedArray, newLabels:Array<number>){

    let output = new Uint8ClampedArray(img.length);

    for (let i = 0; i < img.length; i += 4) {
      let c = this.classService.getClassFromRGB(img.slice(i, i + 3));
      let newC = newLabels[c];
      let rgb = this.classService.RGBFromClass(newC);
      output[i] = rgb[0];
      output[i + 1] = rgb[1];
      output[i + 2] = rgb[2];
      output[i + 3] = 255;
    }

    return output;


  }
  setCustomScenario(index:number, upscaleFactor:number, ctx:CanvasRenderingContext2D){
    let promises = new Array<Promise<void | ImageBitmap>>();
    switch (index){
      case 0:
        promises.push(
          SharpBrush.drawCircle(
            ctx,
            256 / upscaleFactor,
            256 / upscaleFactor,
            50 / upscaleFactor,
            this.classService.RGBFromClass(1)
          )
        );
        break
      case 1:
        this.classService.setClasses([0, 1, 2, 3, 4]);
        promises.push(
          SharpBrush.drawCircle(
            ctx,
            32 / upscaleFactor,
            32 / upscaleFactor,
            32 / upscaleFactor,
            this.classService.RGBFromClass(1)
          )
        );
        promises.push(
          SharpBrush.drawCircle(
            ctx,
            125 / upscaleFactor,
            125 / upscaleFactor,
            100 / upscaleFactor,
            this.classService.RGBFromClass(2)
          )
        );
        promises.push(
          SharpBrush.drawCircle(
            ctx,
            400 / upscaleFactor,
            400 / upscaleFactor,
            280 / upscaleFactor,
            this.classService.RGBFromClass(4)
          )
        );
    }
    return promises
  }
}
