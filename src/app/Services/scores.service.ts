import { Injectable } from '@angular/core';
import { Score, Stats } from '../statistic';
import { ClassesService } from './classes.service';

@Injectable({
  providedIn: 'root',
})
export class ScoresService {
  scores: Array<Score>;
  visibleScores: Array<boolean>;
  confusionMatrix: Array<Array<number>>;
  stateCMatrix: Array<Array<string>>;

  constructor(private classService: ClassesService) {}

  getScores() {
    return this.scores;
  }

  setScores(scores: Array<Score>) {
    this.scores = scores;
    this.visibleScores = new Array<boolean>(this.scores.length).fill(true);
  }
  updateScore() {
    let statsComputer = new Stats(this.confusionMatrix);
    this.setScores(statsComputer.updateScore());
  }
  initConfMat() {
    this.confusionMatrix = new Array(this.classService.classes.length).fill(0);
    for (var i = 0; i < this.confusionMatrix.length; i++) {
      this.confusionMatrix[i] = new Array(
        this.classService.classes.length
      ).fill(0);
    }
    this.updateStateMatrix();
  }

  updateStateMatrix() {
    this.stateCMatrix = new Array<Array<string>>();

    for (let i = 0; i < this.classService.classes.length; i++) {
      let row = new Array<string>();
      for (let j = 0; j < this.classService.classes.length; j++) {
        let val = 'TN';
        if (i == this.classService.currentClass) {
          val = 'FP';
        }
        if (j == this.classService.currentClass) {
          val = 'FN';
        }
        if (
          j == this.classService.currentClass &&
          i == this.classService.currentClass
        ) {
          val = 'TP';
        }
        row.push(val);
      }
      this.stateCMatrix.push(row);
    }
  }
  updateConfusionMatrix(img1: Uint8ClampedArray, img2: Uint8ClampedArray) {
    this.initConfMat();
    this.computeConfMat(img1, img2, this.confusionMatrix);

    this.updateScore();
  }

  computeConfMat(
    img1: Uint8ClampedArray,
    img2: Uint8ClampedArray,
    confMat: Array<Array<number>>
  ) {
    for (let i = 0; i < img1.length; i += 4) {
      if (
        img2[i] > 0 ||
        img2[i + 1] > 0 ||
        img2[i + 2] > 0 ||
        img1[i] > 0 ||
        img1[i + 1] > 0 ||
        img1[i + 2] > 0
      ) {
        let rgb_bg = img1.slice(i, i + 3);
        let rgb = img2.slice(i, i + 3);
        let gt_class = this.classService.getClassFromRGB(rgb_bg);
        let pred_class = this.classService.getClassFromRGB(rgb);
        if (pred_class >= 0 && gt_class >= 0) {
          confMat[pred_class][gt_class] += 1;
        } else {
          confMat[0][0] += 1;
        }
      } else {
        confMat[0][0] += 1;
      }
    }
  }

  computeBoundaryIoU(
    img1: Uint8ClampedArray,
    img2: Uint8ClampedArray,
    width: number,
    height: number,
    boundary: number = 3
  ) {
    let n_classes = this.classService.classes.length;
    let confMat = new Array(n_classes);
    for (let i = 0; i < n_classes; i++) {
      confMat[i] = new Array(n_classes).fill(0);
    }

    let kernel = this.getKernel(boundary);
    let boundary1 = this.convertImgToBoundaryRegion(
      img1,
      kernel,
      width,
      height
    );
    let boundary2 = this.convertImgToBoundaryRegion(
      img2,
      kernel,
      width,
      height
    );
    this.computeConfMat(boundary1, boundary2, confMat);
    let stat = new Stats(confMat);
    let scores = stat.updateScore();
    scores.forEach((element) => {
      console.log(element);
      if (element.name == 'Dice' || element.name == 'IoU') {
        element.name = 'Boundary ' + element.name;
        this.scores.push(element);
      }
    });
    this.setScores(this.scores);
  }

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
}
