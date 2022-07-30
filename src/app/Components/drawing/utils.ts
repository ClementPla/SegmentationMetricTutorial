export interface Point2D{
  x:number
  y:number
}

export class Color{
  static getRGBfromHSL(hsl:Array<number>):Uint8ClampedArray{
    var r, g, b;
    var h = hsl[0]/360
    var s = hsl[1]/100
    var l = hsl[2]/100
    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p:number, q:number, t:number){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    let rgb = [Math.floor(r * 255), (g * 255), (b * 255)]
    return new Uint8ClampedArray(rgb);
  }
}

export class ArrayTool{
  static unique<T>(array:Array<T> | Uint8ClampedArray){
    if(array instanceof Uint8ClampedArray){
      return Array.from(new Set(Array.from(array)))
    }
    return Array.from(new Set(array))
  }

}

export function doubleDownsample(img1:Uint8ClampedArray, img2:Uint8ClampedArray, downsampling:number,
  width:number, height:number):Array<Uint8ClampedArray>{

  let output1 = new Uint8ClampedArray(img1.length/(downsampling*downsampling))
  let output2 = new Uint8ClampedArray(img1.length/(downsampling*downsampling))
  let newWidth = width/downsampling

  for(let i=0; i<output1.length; i += 4){

    let row = i/newWidth>>0;
    let col = i%newWidth;

    let j= ((row*downsampling)*width+col*downsampling)*4

    output1[i] = img1[j*downsampling]
    output1[i+1] = img1[j*downsampling+1]
    output1[i+2] = img1[j*downsampling+2]
    output1[i+3] = img1[j*downsampling+3]

    output2[i] = img2[j*downsampling]
    output2[i+1] = img2[j*downsampling+1]
    output2[i+2] = img2[j*downsampling+2]
    output2[i+3] = img2[j*downsampling+3]

  }
  return [output1, output2]
}
