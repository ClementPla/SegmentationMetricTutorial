import { Point2D } from './utils';
import { SharpBrush } from './drawtools';
import { CssSelector } from '@angular/compiler';

export class PresetDraw {

  static drawPreset(
    ctx:CanvasRenderingContext2D,
    exampleId:number,
    options?:{xs:Array<number>, ys:Array<number>, rs:Array<number>, cs:Array<Uint8ClampedArray>}
  ){
    switch(exampleId){
      case 0:{
        if(options)
          SharpBrush.drawCircle(ctx, options?.xs[0], options?.ys[0], options?.rs[0], options?.cs[0])
        break;
      }
    }

  }
}
