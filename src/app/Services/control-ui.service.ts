import { Injectable } from '@angular/core';
import { Point2D } from '../Components/drawing/utils';
@Injectable({
  providedIn: 'root',
})
export class ControlUIService {
  tooltipsActivated = true;
  showTooltip: boolean = false;
  tooltipType: string;

  showConfMat: boolean = false;
  showConfMatLabel: boolean = true;

  showMetrics: boolean = true;

  performanceMode: boolean = true;
  showPerClassMetrics: boolean = false;

  showReference: boolean = true;
  showOverlayReference: boolean = true;

  currentPreset:number=0;

  pos: Point2D = {x:-500, y:-500};
  constructor() {}

  activate(event: MouseEvent, type: string) {
    this.pos = { x: event.clientX-475-event.offsetX, y: event.clientY-event.offsetY};
    this.showTooltip = true && this.tooltipsActivated;
    this.tooltipType = type;
  }
  deactivate() {
    this.showTooltip = false;
  }

  toggleCM() {
    this.showConfMat = !this.showConfMat;
  }
  toggleCMLabel() {
    this.showConfMatLabel = !this.showConfMatLabel;
  }
  toggleMetrics() {
    this.showMetrics = !this.showMetrics;
  }
  togglePerformanceMode() {
    this.performanceMode = !this.performanceMode;
  }
  togglePerClassMetrics() {
    this.showPerClassMetrics = !this.showPerClassMetrics;
  }
  toggleReferenceDisplay() {
    this.showReference = !this.showReference;
  }
  toggleOverlayReference() {
    this.showOverlayReference = !this.showOverlayReference;
  }
  toggleTooltipVisibility(){
    this.tooltipsActivated = !this.tooltipsActivated
  }

  changeCurrentPreset(preset:number){
    this.currentPreset = preset
  }
}
