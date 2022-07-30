import { Point2D } from './utils';
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
}
