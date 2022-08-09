import { Component, Input, OnInit } from '@angular/core';
import { ElementRef, ViewChild } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { fromEvent, merge } from 'rxjs';
import { Point2D, ArrayTool, doubleDownsample } from '../../utils';
import { SharpBrush } from './drawtools';
import { switchMap, takeUntil, pairwise } from 'rxjs/operators';
import { ScoresService } from 'src/app/Services/scores.service';
import { ClassesService } from 'src/app/Services/classes.service';
import { ControlUIService } from 'src/app/Services/control-ui.service';
import { PresetDraw } from './presetdrawing';
import { DrawService } from 'src/app/Services/draw.service';

@Component({
  selector: 'app-drawing',
  templateUrl: './drawing.component.html',
  styleUrls: ['./drawing.component.scss'],
})
export class DrawingComponent implements OnInit {
  @Input() showTooltip: boolean;
  @Input() overlayOpacity: number = 65;

  @ViewChild('canvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement>;

  @ViewChild('canvasGroundtruth', { static: true })
  canvasBG: ElementRef<HTMLCanvasElement>;

  @ViewChild('canvasVisu', { static: true })
  canvasVisu: ElementRef<HTMLCanvasElement>;

  private ctx: CanvasRenderingContext2D;
  private ctxBg: CanvasRenderingContext2D;
  private ctxVisu: CanvasRenderingContext2D;
  private backgroundImage: Uint8ClampedArray;

  canvasScreenSize = 512;
  width = 256;
  height = this.width;
  upscaleFactor = this.canvasScreenSize / this.width;

  initialRadius = 10;

  currentRadius = this.initialRadius;
  cursorPosition: Point2D = { x: 0, y: 0 };
  cursorPositionGT: Point2D = { x: 0, y: 0 };
  sharpBrush: SharpBrush;
  drawTool = 'draw';
  imgSrc = '';

  constructor(
    private drawService: DrawService,
    private scoreService: ScoresService,
    public classService: ClassesService,
    public UICtrlService: ControlUIService
  ) {}

  ngOnInit(): void {
    this.UICtrlService.setInferenceFunction(this.slowInference.bind(this));
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    const canvasBackground: HTMLCanvasElement = this.canvasBG.nativeElement;
    const canvasVisu: HTMLCanvasElement = this.canvasVisu.nativeElement;

    this.ctx = canvasEl.getContext('2d')!;
    this.ctx.canvas.width = this.width;
    this.ctx.canvas.height = this.height;

    this.sharpBrush = new SharpBrush();

    this.ctxBg = canvasBackground.getContext('2d')!;
    this.ctxBg.canvas.width = this.width;
    this.ctxBg.canvas.height = this.height;

    this.ctxVisu = canvasVisu.getContext('2d')!;
    this.ctxVisu.canvas.width = this.width;
    this.ctxVisu.canvas.height = this.height;

    this.ctxBg.imageSmoothingEnabled = false;
    this.ctx.imageSmoothingEnabled = false;
    this.ctxVisu.imageSmoothingEnabled = false;

    this.buildGroundtruth(this.UICtrlService.currentPreset);
    this.captureEvents(canvasEl, this.cursorPosition);
    this.captureEvents(canvasVisu, this.cursorPositionGT, true);
  }
  private initBackgroundConstruction() {
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctxBg.fillRect(0, 0, this.width, this.height);
  }

  setDragMode() {
    this.ctx.globalCompositeOperation = 'destination-atop';
  }
  setDrawMode() {
    this.ctx.globalCompositeOperation = 'source-over';
  }
  clearDrawing() {
    var activeTool = this.drawTool;
    var activeClass = this.classService.currentClass;

    this.changeTool('draw');
    this.changeActiveClass(0);
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.changeActiveClass(activeClass);
    this.changeTool(activeTool);
  }
  resetPreset() {
    var activeTool = this.drawTool;
    var activeClass = this.classService.currentClass;
    this.changeTool('draw');
    this.changeActiveClass(0);
    this.clearDrawing();
    this.buildGroundtruth(this.UICtrlService.currentPreset);
    this.slowInference();
    this.changeActiveClass(activeClass);
    this.changeTool(activeTool);
  }

  clearCanvas(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, this.width, this.height);
  }
  setupPresetExample(presetExample: string) {
    this.UICtrlService.isBusy = true;
    this.clearDrawing();
    var ps = new Array<Promise<void | ImageBitmap | HTMLImageElement>>();
    switch (presetExample) {
      case 'perfect': {
        PresetDraw.drawImage(
          this.ctx,
          this.backgroundImage,
          this.width,
          this.height
        );
        break;
      }
      case 'perfectBoundaries': {
        let kernel = this.drawService.getKernel(
          this.UICtrlService.boundarySize
        );
        let boundary = this.drawService.convertImgToBoundaryRegion(
          this.backgroundImage,
          kernel,
          this.width,
          this.height
        );
        PresetDraw.drawImage(this.ctx, boundary, this.width, this.height);
        break;
      }
      case 'badBoundaries': {
        ps.push(
          new Promise(() => {
            let kernel = this.drawService.getKernel(
              this.UICtrlService.boundarySize
            );
            let boundary = this.drawService.convertImgToBoundaryRegion(
              this.backgroundImage,
              kernel,
              this.width,
              this.height
            );
            let opposite_boundary = new Uint8ClampedArray(
              this.backgroundImage.length
            );
            for (let i = 0; i < opposite_boundary.length; i += 4) {
              if (
                !(
                  this.backgroundImage[i] == boundary[i] &&
                  this.backgroundImage[i + 1] == boundary[i + 1] &&
                  this.backgroundImage[i + 2] == boundary[i + 2]
                )
              ) {
                opposite_boundary[i] = this.backgroundImage[i];
                opposite_boundary[i + 1] = this.backgroundImage[i + 1];
                opposite_boundary[i + 2] = this.backgroundImage[i + 2];
              }
              opposite_boundary[i + 3] = 255;
            }

            PresetDraw.drawImage(
              this.ctx,
              opposite_boundary,
              this.width,
              this.height
            );
            this.updateGTCanvas()
          })
        );
        break;
      }
      case 'swapLabels': {
        let swappedLabels = this.drawService.shuffleLabels(
          this.backgroundImage
        );
        PresetDraw.drawImage(this.ctx, swappedLabels, this.width, this.height);
        break;
      }
      case 'halfSensitivity': {
        PresetDraw.drawHalfClass(
          this.ctx,
          this.backgroundImage,
          this.width,
          this.height,
          this.classService
        );
        break;
      }
      case 'overSegment': {

        let f = ()=>{
          let kernel = this.drawService.getKernel(5);
            let overSegment = this.drawService.dilate(
              this.backgroundImage,
              kernel,
              this.width,
              this.height
            );
            PresetDraw.drawImage(
              this.ctx,
              overSegment,
              this.width,
              this.height
            );
            return;
        }
        let p = new Promise<void|ImageBitmap>(()=>
        {
          f()
          this.updateGTCanvas()
        })
        ps.push(p)
        break;
      }
      case 'lowImbalance': {
        let swapLabels = this.drawService.swapLabels(
          this.backgroundImage,
          [0, 0, 2, 3, 4]
        );
        PresetDraw.drawImage(this.ctx, swapLabels, this.width, this.height);
        break;
      }
      case 'highImbalance': {
        let swapLabels = this.drawService.swapLabels(
          this.backgroundImage,
          [0, 1, 2, 3, 0]
        );
        PresetDraw.drawImage(this.ctx, swapLabels, this.width, this.height);
        break;
      }
      case 'worstKappa': {
        let swapLabels = this.drawService.swapLabels(
          this.backgroundImage,
          [4, 0, 0, 0, 0]
        );
        PresetDraw.drawImage(this.ctx, swapLabels, this.width, this.height);
        break;
      }
    }
    this.changeActiveClass(1);
    Promise.all(ps).then(() => {
      this.updateGTCanvas();
    });
  }
  buildGroundtruth(index: number) {
    this.UICtrlService.isBusy = true;
    this.UICtrlService.currentPreset = index;
    var promises = new Array<Promise<void | ImageBitmap | HTMLImageElement>>();
    this.classService.setClasses([0, 1]);
    this.imgSrc = '';

    this.initBackgroundConstruction();
    switch (index) {
      case 0:
        promises = this.drawService.setCustomScenario(
          0,
          this.upscaleFactor,
          this.ctxBg
        );
        break;
      case 1:
        promises = this.drawService.setCustomScenario(
          1,
          this.upscaleFactor,
          this.ctxBg
        );
        break;
      case 2:
        var imageGT = new Image();
        imageGT.src = 'assets/images/patient1_raw0073_gt.png';
        this.imgSrc = 'assets/images/patient1_raw0073.png';
        promises.push(
          new Promise((resolve) => {
            imageGT.onload = (ev) => {
              resolve(imageGT);
              this.drawCustomImage(this.ctxBg, imageGT);
              this.classService.setClasses([
                'BG',
                'ILM',
                'IPL',
                'RPE',
                'BM',
                'IRF',
                'SRF',
                'PED',
              ]);
            };
          })
        );
        break;
      case 3:
        var imageGT = new Image();
        imageGT.src = 'assets/images/fundus_gt.png';
        this.imgSrc = 'assets/images/fundus.jpeg';
        promises.push(
          new Promise((resolve) => {
            imageGT.onload = (ev) => {
              resolve(imageGT);
              this.drawCustomImage(this.ctxBg, imageGT);
              this.classService.setClasses([
                'BG',
                'MAC',
                'OD',
                'EX',
                'HEM',
                'MA',
              ]);
            };
          })
        );
        break;
      case 4: {
        this.imgSrc = '';
        this.ctxBg.fillStyle = 'black';
        this.ctx.fillStyle = 'black';
        this.ctxBg.fillRect(0, 0, this.width, this.height);
        this.ctx.fillRect(0, 0, this.width, this.height);
      }
    }
    this.changeActiveClass(1);
    this.scoreService.initConfMat();
    this.refreshBrush();
    Promise.all(promises).then(() => {
      this.updateGTCanvas();
    });
  }
  updateGTCanvas() {
    this.backgroundImage = this.ctxBg.getImageData(
      0,
      0,
      this.width,
      this.height
    ).data;
    this.changeActiveClass(1);
    this.slowInference();
    this.ctxVisu.drawImage(this.canvasBG.nativeElement, 0, 0);
  }

  private drawCustomImage(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement
  ) {
    ctx.drawImage(image, 0, 0, this.width, this.height);
    var rawData = ctx.getImageData(0, 0, this.width, this.height);
    var uniqueValue: Array<number> = ArrayTool.unique(rawData.data);
    this.classService.setClasses(uniqueValue.filter((v) => v < 255).sort());

    for (let i = 0; i < rawData.data.length; i += 4) {
      let l = rawData.data[i];
      let rgb = this.classService.getClassColor(l);
      rawData.data[i] = rgb[0];
      rawData.data[i + 1] = rgb[1];
      rawData.data[i + 2] = rgb[2];
    }

    ctx.putImageData(rawData, 0, 0);
  }

  private captureEvents(
    canvas: HTMLCanvasElement,
    cursorPoint: Point2D,
    isGT: boolean = false
  ) {
    const touchStartEvents = fromEvent<TouchEvent>(canvas, 'touchstart');
    const mouseStartEvents = fromEvent<MouseEvent>(canvas, 'mousedown');
    const mouseMoveEvents = fromEvent<MouseEvent>(canvas, 'mousemove');

    const startEvents = merge(touchStartEvents, mouseStartEvents);
    const touchMoveEvents = fromEvent<TouchEvent>(canvas, 'touchmove');
    const moveEvents = merge(touchMoveEvents, mouseMoveEvents);
    const touchEndEvents = fromEvent<TouchEvent>(canvas, 'touchend');
    const mouseUpEvents = fromEvent<MouseEvent>(canvas, 'mouseup');
    const mouseLeaveEvents = fromEvent<MouseEvent>(canvas, 'mouseleave');

    const endEvents = merge(touchEndEvents, mouseLeaveEvents, mouseUpEvents);
    let hasChanged = false;
    moveEvents.subscribe({
      next: (event: MouseEvent | TouchEvent) => {
        const rect = canvas.getBoundingClientRect();
        var pos = this.getClientPosition(event)
        cursorPoint.x = pos.clientX - rect.left
        cursorPoint.y = pos.clientY - rect.top
      },
    });
    startEvents
      .pipe(
        switchMap((e) => {
          const rect = canvas.getBoundingClientRect();
          const pos = this.getCoord(e, rect);
          hasChanged = true;

          if (isGT && (this.drawTool == 'draw' || this.drawTool == 'drag')) {
            this.drawOnGTCanvas(pos, pos);
          } else if (this.drawTool == 'draw' || this.drawTool == 'drag')
            this.drawOnCanvas(this.ctx, pos, pos);
          else if (this.drawTool == 'fill' && !isGT) {
            this.fillOnCanvas(pos);
          }
          this.inference();
          return moveEvents.pipe(takeUntil(endEvents), pairwise());
        })
      )
      .subscribe({
        next: (res: [MouseEvent | TouchEvent, MouseEvent | TouchEvent]) => {
          if (this.drawTool != 'fill' || isGT) {
            const rect = canvas.getBoundingClientRect();
            var next = this.getClientPosition(res[1]);

            const prevPos = this.getCoord(res[0], rect);
            const currentPos = this.getCoord(res[1], rect);
            if (isGT) {
              this.drawOnGTCanvas(prevPos, currentPos);
            } else this.drawOnCanvas(this.ctx, prevPos, currentPos);

            if (!this.UICtrlService.performanceMode) this.inference();
          }
        },
      });

    endEvents.subscribe((e) => {
      if (hasChanged) this.slowInference();
      hasChanged = false;
    });
  }

  getClientPosition(event: TouchEvent | MouseEvent) {
    event.preventDefault();
    if ('touches' in event) {
      return {
        clientX: event.touches[0].clientX,
        clientY: event.touches[0].clientY,
      };
    } else {
      return { clientX: event.clientX, clientY: event.clientY };
    }
  }

  getCoord(event: MouseEvent | TouchEvent, rect: DOMRect) {
    var pt = this.getClientPosition(event);
    return {
      x: (pt.clientX - rect.left) * (this.width/rect.width),
      y: (pt.clientY - rect.top) * (this.width/rect.width),
    };
  }

  resizeBrush(event: MatSliderChange) {
    this.currentRadius = event.value || 2;
    this.refreshBrush();
  }

  addClass() {
    this.classService.addClass();
    this.scoreService.initConfMat();
  }

  fillOnCanvas(pos: Point2D) {
    if (!this.ctx) {
      return;
    }
    this.ctx.globalCompositeOperation = 'source-over';
    let imageData = this.ctx.getImageData(0, 0, this.width, this.height);
    let index = Math.round(pos.y) * this.width * 4 + Math.round(pos.x) * 4;
    let r = this.backgroundImage[index];
    let g = this.backgroundImage[index + 1];
    let b = this.backgroundImage[index + 2];
    let col = this.classService.getClassColor(this.classService.currentClass);
    for (let i = 0; i < imageData.height; i++) {
      for (let j = 0; j < imageData.width; j++) {
        let index = i * imageData.width * 4 + j * 4;
        if (
          this.backgroundImage[index] == r &&
          this.backgroundImage[index + 1] == g &&
          this.backgroundImage[index + 2] == b
        ) {
          imageData.data[index] = col[0];
          imageData.data[index + 1] = col[1];
          imageData.data[index + 2] = col[2];
        }
      }
    }
    createImageBitmap(imageData).then((data) => {
      this.ctx.drawImage(data, 0, 0, this.width, this.height);
    });
  }

  changeActiveClass(class_index: number) {
    this.classService.currentClass = class_index;
    this.scoreService.updateStateMatrix();
    this.refreshBrush();
  }

  private refreshBrush() {
    this.sharpBrush.setBrush(
      this.ctx,
      this.currentRadius,
      this.classService.RGBFromClass(this.classService.currentClass)
    );
  }

  changeTool(tool: string) {
    if (tool == 'drag') {
      this.setDragMode();
    } else {
      this.setDrawMode();
    }
    this.drawTool = tool;
  }

  private drawOnGTCanvas(prevPos: Point2D, currentPos: Point2D) {
    this.drawOnCanvas(this.ctxBg, prevPos, currentPos);
    this.drawOnCanvas(this.ctxVisu, prevPos, currentPos);
    this.backgroundImage = this.ctxBg.getImageData(
      0,
      0,
      this.width,
      this.height
    ).data;
  }

  private drawOnCanvas(
    ctx: CanvasRenderingContext2D,
    prevPos: Point2D,
    currentPos: Point2D
  ) {
    if (!this.ctx) {
      return;
    }
    if (prevPos) {
      this.sharpBrush.drawLine(ctx, prevPos, currentPos);
    }
  }

  inference() {
    const imgData = this.ctx.getImageData(0, 0, this.width, this.height).data;
    this.scoreService.updateConfusionMatrix(this.backgroundImage, imgData);
  }
  slowInference() {
    this.UICtrlService.isBusy = true;
    this.inference();
    if (this.UICtrlService.showBoundaryMetric) {
      const imgData = this.ctx.getImageData(0, 0, this.width, this.height).data;
      this.scoreService.computeBoundaryIoU(
        this.backgroundImage,
        imgData,
        this.width,
        this.height,
        this.UICtrlService.boundarySize
      );
    }
    this.UICtrlService.isBusy = false;
  }

  getCursorTransform(): number {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    let scaleFactor = (rect.width/this.width)*this.currentRadius*2
    return scaleFactor
  }

  changePreset(preset: number) {

    this.UICtrlService.changeCurrentPreset(preset);
    this.buildGroundtruth(preset);
  }
}
