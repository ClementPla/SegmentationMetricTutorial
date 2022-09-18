import { ClassesService } from 'src/app/Services/classes.service';
import { SharpBrush } from './drawtools';

export class PresetDraw {
  static drawCircles(
    ctx: CanvasRenderingContext2D,
    options?: {
      xs: Array<number>;
      ys: Array<number>;
      rs: Array<number>;
      cs: Array<Uint8ClampedArray>;
    }
  ) {
    var ps = new Array<Promise<void|ImageBitmap>>()
    if (options){
      for(let i=0;i<options?.xs.length; i++)
        ps.push(SharpBrush.drawCircle(
          ctx,
          options?.xs[i],
          options?.ys[i],
          options?.rs[i],
          options?.cs[i]
        ));
    }
    return ps
  }
  static drawImage(ctx: CanvasRenderingContext2D,
    ref: Uint8ClampedArray,
    width:number,
    height:number){
    ctx.putImageData(new ImageData(ref, width, height), 0, 0)
  }
  static drawHalfClass(ctx:CanvasRenderingContext2D,
    ref:Uint8ClampedArray,
    width:number,
    height:number,
    classService:ClassesService){

    let classDistribution = new Array<number>(classService.classes.length).fill(0)

    for(let i=0; i<ref.length; i+=4){
      let rgb = ref.slice(i, i+3);
      let label = classService.getClassFromRGB(rgb);
      classDistribution[label] += 1
    }

    let img = new Uint8ClampedArray(ref.length)
    let newClassDistribution = new Array<number>(classService.classes.length).fill(0)

    for(let i=0; i<ref.length; i+=4){
      let rgb = ref.slice(i, i+3);
      let label = classService.getClassFromRGB(rgb);
      newClassDistribution[label] += 1
      if(newClassDistribution[label]<=classDistribution[label]/2){
        img[i] = ref[i]
        img[i+1] = ref[i+1]
        img[i+2] = ref[i+2]
        img[i+3] = ref[i+3]
      }
      else{
        img[i] = 0
        img[i+1] = 0
        img[i+2] = 0
        img[i+3] = 255
      }
    }
    PresetDraw.drawImage(ctx, img, width, height)
  }
}
