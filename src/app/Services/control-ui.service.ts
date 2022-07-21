import { Injectable } from '@angular/core';
import { Point2D } from '../Components/drawing/utils';
@Injectable({
  providedIn: 'root'
})
export class ControlUIService {

  tooltipsActivated = false
  showTooltip:boolean = false
  tooltipType:string

  pos:Point2D
  constructor() { }

  activate(event:MouseEvent, type:string){

    this.pos = {x:event.clientX, y:event.clientY}
    this.showTooltip=true && this.tooltipsActivated;
    this.tooltipType=type
  }
  deactivate(){
    this.showTooltip=false
  }

}
