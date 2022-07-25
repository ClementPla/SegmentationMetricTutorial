import { Injectable } from '@angular/core';
import { Point2D } from '../Components/drawing/utils';
@Injectable({
  providedIn: 'root',
})
export class ControlUIService {
  tooltipsActivated = false;
  showTooltip: boolean = true;
  tooltipType: string;

  showConfMat: boolean = true;
  showConfMatLabel: boolean = true;

  showMetrics: boolean = true;

  performanceMode: boolean = false;
  showPerClassMetrics: boolean = false;

  showReference: boolean = true;
  showOverlayReference: boolean = true;

  pos: Point2D = {x:-500, y:-500};
  constructor() {}

  activate(event: MouseEvent, type: string) {
    this.pos = { x: event.clientX-400-event.offsetX, y: event.clientY-event.offsetY};
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
}
