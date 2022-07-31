import { Injectable } from '@angular/core';
import { Point2D } from '../utils';

@Injectable({
  providedIn: 'root',
})
export class ControlUIService {
  tooltipsActivated = true;
  showTooltip: boolean = false;
  tooltipType: string;

  showConfMat: boolean = true;

  showMetrics: boolean = true;

  performanceMode: boolean = false;
  showPerClassMetrics: boolean = false;

  showReference: boolean = true;
  showOverlayReference: boolean = true;

  showBoundaryMetric:boolean = false;
  ignoreFirstClassMetric:boolean = true

  currentPreset:number=0;
  currentSubPreset?:number=0;
  boundarySize:number=5;

  isBusy=false;

  pos: Point2D = {x:-500, y:-500};

  private updateInference:() => void
  constructor() {}

  activate(event: MouseEvent, type: string) {
    this.pos = { x: event.clientX-475-event.offsetX, y: event.clientY-event.offsetY};
    this.showTooltip = true && this.tooltipsActivated;
    this.tooltipType = type;
  }
  deactivate() {
    this.showTooltip = false;
  }

  setInferenceFunction(fn: () => void){
    this.updateInference = fn

  }


  toggleCM() {
    this.showConfMat = !this.showConfMat;
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
  toggleBoundaryMetric(){
    this.showBoundaryMetric = !this.showBoundaryMetric
    this.updateInference()
  }
  toggleIgnoreFirstClassMetric(){
    this.ignoreFirstClassMetric = !this.ignoreFirstClassMetric
    this.updateInference()
  }

  changeCurrentPreset(preset:number){
    this.currentPreset = preset
    this.currentSubPreset = undefined
  }
  changeCurrentSubPreset(SubPreset:number){
    this.currentSubPreset = SubPreset
  }
}
