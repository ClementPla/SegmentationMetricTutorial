import { Injectable } from '@angular/core';
import { Color } from '../Components/drawing/utils';

@Injectable({
  providedIn: 'root'
})
export class ClassesService {

  classes:Array<string | number>;
  classToRGB: Array<Uint8ClampedArray>;
  currentClass:number
  constructor() { }

  getClassColor(index:number):Uint8ClampedArray{
    if(index==0){
      var hsl = [0, 0, 0]
    }
    else{
      var h = (index+1) * 360/(this.classes.length);
      let s = 95;
      let l = 50;
      var hsl = [h, s, l]
    }
    return Color.getRGBfromHSL(hsl)
  }

  getRGBStyleFromClass(index:number):string{
    let color = this.RGBFromClass(index)
    return `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1.0)`
  }

  RGBFromClass(index:number):Uint8ClampedArray{
    return this.classToRGB[index]
  }
  getClassFromRGB(rgb:Uint8ClampedArray):number{

    for(let i=0; i<this.classToRGB.length; i++){
      let isEqual = rgb.every((val, index) => val === this.classToRGB[i][index]);
      if (isEqual){
        return i
      }
    }
    return -1
  }

  setClasses(classes:Array<string | number>){
    this.classes=classes;
    this.classToRGB = this.classes.map((v, i) => this.getClassColor(i));
  }
}
