import { Component, Input, OnInit } from '@angular/core';
import { ElementRef, ViewChild } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { fromEvent, merge, Observable } from 'rxjs';
import { Point2D, ArrayTool } from './utils';
import { SharpBrush } from './drawtools';
import { switchMap, takeUntil, pairwise } from 'rxjs/operators';
import { ScoresService } from 'src/app/Services/scores.service';
import { ClassesService } from 'src/app/Services/classes.service';
import { ControlUIService } from 'src/app/Services/control-ui.service';

@Component({
  selector: 'app-drawing',
  templateUrl: './drawing.component.html',
  styleUrls: ['./drawing.component.scss'],
})
export class DrawingComponent implements OnInit {
  @Input() showTooltip: boolean;

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

  initialRadius = 5;

  currentRadius = this.initialRadius;
  cursorPosition: Point2D = { x: 0, y: 0 };
  cursorPositionGT: Point2D = { x: 0, y: 0 };
  sharpBrush: SharpBrush;
  drawTool = 'draw';
  drawNotDrag: boolean = true;

  imgSrc = '';

  constructor(
    private scoreService: ScoresService,
    public classService: ClassesService,
    public UICtrlService: ControlUIService
  ) {}

  ngOnInit(): void {
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

    this.buildGroundtruth(2);
    this.captureEvents(canvasEl, this.cursorPosition);
    this.captureEvents(canvasVisu, this.cursorPositionGT, true);
  }
  private initBackgroundConstruction() {
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctxBg.fillRect(0, 0, this.width, this.height);
  }

  setDragMode() {
    this.ctx.globalCompositeOperation = 'destination-atop';
    this.drawNotDrag = false;
  }
  setDrawMode() {
    this.ctx.globalCompositeOperation = 'source-over';
    this.drawNotDrag = true;
  }
  clearDrawing() {
    this.changeActiveClass(0);
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  buildGroundtruth(index: number) {
    let promises = [];
    this.initBackgroundConstruction();
    switch (index) {
      case 0:
        this.classService.setClasses([0, 1]);
        this.imgSrc = '';
        promises.push(
          SharpBrush.drawCircle(
            this.ctxBg,
            256 / this.upscaleFactor,
            256 / this.upscaleFactor,
            50 / this.upscaleFactor,
            this.classService.RGBFromClass(1)
          )
        );
        break;
      case 1:
        this.classService.setClasses([0, 1, 2, 3, 4]);
        this.imgSrc = '';
        promises.push(
          SharpBrush.drawCircle(
            this.ctxBg,
            32 / this.upscaleFactor,
            32 / this.upscaleFactor,
            32 / this.upscaleFactor,
            this.classService.RGBFromClass(1)
          )
        );
        promises.push(
          SharpBrush.drawCircle(
            this.ctxBg,
            125 / this.upscaleFactor,
            125 / this.upscaleFactor,
            100 / this.upscaleFactor,
            this.classService.RGBFromClass(2)
          )
        );
        promises.push(
          SharpBrush.drawCircle(
            this.ctxBg,
            400 / this.upscaleFactor,
            400 / this.upscaleFactor,
            280 / this.upscaleFactor,
            this.classService.RGBFromClass(4)
          )
        );
        break;
      case 2:
        this.classService.setClasses(['0', '1']);
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
              this.scoreService.initConfMat();
            };
          })
        );
        break;
    }
    this.changeActiveClass(1);
    this.scoreService.initConfMat();
    this.refreshBrush();
    Promise.all(promises).then(() => {
      this.backgroundImage = this.ctxBg.getImageData(
        0,
        0,
        this.width,
        this.height
      ).data;
      this.changeActiveClass(1);
      this.slowInference();
      this.ctxVisu.drawImage(this.canvasBG.nativeElement, 0, 0);
    });
  }

  private drawCustomImage(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement
  ) {
    ctx.drawImage(image, 0, 0);
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
    // this will capture all mousedown events from the canvas element

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

    moveEvents.subscribe({
      next: (event: MouseEvent | TouchEvent) => {
        const rect = canvas.getBoundingClientRect();
        var pos = this.getClientPosition(event);
        cursorPoint.x = pos.clientX - rect.left;
        cursorPoint.y = pos.clientY - rect.top;
      },
    });
    startEvents
      .pipe(
        switchMap((e) => {
          e.preventDefault();
          const rect = canvas.getBoundingClientRect();
          const pos = this.getCoord(e, rect);

          if (isGT && this.drawTool == 'draw') {
            this.drawOnGTCanvas(pos, pos);
          } else if (this.drawTool == 'draw')
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
          const rect = canvas.getBoundingClientRect();
          var next = this.getClientPosition(res[1]);

          const prevPos = this.getCoord(res[0], rect);
          const currentPos = this.getCoord(res[1], rect);
          if (isGT) {
            this.drawOnGTCanvas(prevPos, currentPos);
          } else this.drawOnCanvas(this.ctx, prevPos, currentPos);

          if (!this.UICtrlService.performanceMode) this.inference();
        },
      });

    endEvents.subscribe((e) => {
      this.slowInference();
    });
  }
  getCoord(event: MouseEvent | TouchEvent, rect: DOMRect) {
    var pt = this.getClientPosition(event);
    return {
      x: (pt.clientX - rect.left) / this.upscaleFactor,
      y: (pt.clientY - rect.top) / this.upscaleFactor,
    };
  }

  resizeBrush(event: MatSliderChange) {
    this.currentRadius = event.value || 2;
    this.refreshBrush();
  }

  fillOnCanvas(pos: Point2D) {
    if (!this.ctx) {
      return;
    }
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
    this.ctx.putImageData(imageData, 0, 0);
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
    this.drawTool = tool;
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
    this.scoreService.computeConfusionMatrix(this.backgroundImage, imgData);
  }
  slowInference() {
    this.inference();
  }
}
