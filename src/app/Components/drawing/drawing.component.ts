import { Component, OnInit } from '@angular/core';
import { ElementRef, ViewChild } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { fromEvent, merge } from 'rxjs';
import { Point2D, Color, ArrayTool } from './utils';
import { SharpBrush } from './drawtools';
import { Stats, Score } from 'src/app/statistic';
import { switchMap, takeUntil, pairwise } from 'rxjs/operators'
import { DomSanitizer } from '@angular/platform-browser';
import { i18nMetaToJSDoc } from '@angular/compiler/src/render3/view/i18n/meta';

@Component({
  selector: 'app-drawing',
  templateUrl: './drawing.component.html',
  styleUrls: ['./drawing.component.scss']
})
export class DrawingComponent implements OnInit {

  @ViewChild('canvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement>;


  @ViewChild('canvasGroundtruth', { static: true })
  canvasBG: ElementRef<HTMLCanvasElement>;

  @ViewChild('canvasEvent', { static: true })
  canvasEvent: ElementRef<HTMLCanvasElement>;

  @ViewChild('canvasVisu', { static: true })
  canvasVisu: ElementRef<HTMLCanvasElement>;

  private ctx: CanvasRenderingContext2D;
  private ctxBg: CanvasRenderingContext2D;
  private ctxVisu: CanvasRenderingContext2D;
  private backgroundImage:Uint8ClampedArray;


  pos = { x: 0, y: 0 };
  canvasScreenSize = 512
  width = 256
  height = this.width
  upscaleFactor = this.canvasScreenSize/this.width

  classes:Array<number | string>;
  scores:Array<Score>

  currentClass = 1
  currentRadius = 5
  cursorPosition: Point2D = {x:0,y:0}
  confusionMatrix: Array<Array<number>>;

  stateCMatrix: Array<Array<string>>

  classToRGB: Array<Uint8ClampedArray>;
  sharpBrush:SharpBrush

  boldMacro=-1

  drawTool = 'draw'

  ngOnInit(): void {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    const canvasBackground: HTMLCanvasElement = this.canvasBG.nativeElement;
    const canvasEvent: HTMLCanvasElement = this.canvasEvent.nativeElement;
    const canvasVisu: HTMLCanvasElement = this.canvasVisu.nativeElement;

    this.ctx = canvasEl.getContext('2d')!;
    this.ctx.canvas.width = this.width
    this.ctx.canvas.height = this.height

    this.sharpBrush = new SharpBrush();


    this.ctxBg = canvasBackground.getContext('2d')!;
    this.ctxBg.canvas.width = this.width
    this.ctxBg.canvas.height = this.height


    this.ctxVisu = canvasVisu.getContext('2d')!;
    this.ctxVisu.canvas.width = this.width
    this.ctxVisu.canvas.height = this.height

    this.ctxBg.imageSmoothingEnabled = false
    this.ctx.imageSmoothingEnabled = false
    this.ctxVisu.imageSmoothingEnabled = false
    this.buildGroundtruth(2)
    this.captureEvents(canvasEvent);

  }

  private initBackgroundConstruction(){
    this.ctx.fillRect(0, 0, this.width, this.height)
    this.ctxBg.fillRect(0, 0, this.width, this.height)
  }


  buildGroundtruth(index:number){
    let promises = []
    this.initBackgroundConstruction()
    switch(index){
      case 0:
        this.classes = [0, 1]
        this.classToRGB = this.classes.map((v, i) => this.getClassColor(i));
        promises.push(SharpBrush.drawCircle(this.ctxBg, 256/this.upscaleFactor,
        256/this.upscaleFactor,50/this.upscaleFactor,this.RGBFromClass(1)))
        break;
      case 1:
        this.classes = [0, 1, 2, 3, 4]
        this.classToRGB = this.classes.map((v, i) => this.getClassColor(i));
        promises.push(SharpBrush.drawCircle(this.ctxBg,
        32/this.upscaleFactor,
        32/this.upscaleFactor,
        32/this.upscaleFactor,
        this.RGBFromClass(1)))
        promises.push(SharpBrush.drawCircle(this.ctxBg,
          125/this.upscaleFactor,
          125/this.upscaleFactor,
          100/this.upscaleFactor,
          this.RGBFromClass(2)))
        promises.push(SharpBrush.drawCircle(this.ctxBg,
          400/this.upscaleFactor,
          400/this.upscaleFactor,
          280/this.upscaleFactor,
          this.RGBFromClass(4)))
        break;
        case 2:
          this.classes = [0, 1]
          this.classToRGB = this.classes.map((v, i) => this.getClassColor(i));
          var imageGT = new Image();
          imageGT.src = "assets/images/patient1_raw0073_gt.png"
          promises.push(new Promise(resolve =>{
            imageGT.onload = (ev) =>{
              resolve(imageGT)
              this.drawCustomImage(this.ctxBg, imageGT)
              this.initConfusionMatrix()
            }
          }))
        break;
    }
    this.changeActiveClass(1)
    this.initConfusionMatrix()
    this.refreshBrush()
    Promise.all(promises).then(()=>{
      this.backgroundImage = this.ctxBg.getImageData(0,0, this.width, this.height).data;
      this.inference()
      this.ctxVisu.drawImage(this.canvasBG.nativeElement, 0, 0)

      }
    )
  }
  private drawCustomImage(ctx:CanvasRenderingContext2D, image:HTMLImageElement){
    console.log(image.width, image.height)
    ctx.drawImage(image, 0, 0)
    var rawData = ctx.getImageData(0, 0, this.width, this.height)
    var uniqueValue:Array<number> = ArrayTool.unique(rawData.data)
    this.classes = uniqueValue.filter(v=>v<255).sort()
    this.classToRGB = this.classes.map((v, i) => this.getClassColor(i));

    for(let i=0;i<rawData.data.length;i+=4){
      let l = rawData.data[i]
      let rgb = this.getClassColor(l)
      rawData.data[i] = rgb[0]
      rawData.data[i+1] = rgb[1]
      rawData.data[i+2] = rgb[2]
    }
    ctx.putImageData(rawData, 0, 0)
  }

  private getClassColor(index:number):Uint8ClampedArray{
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

  private RGBFromClass(index:number):Uint8ClampedArray{
    return this.classToRGB[index]
  }
  private getClassFromRGB(rgb:Uint8ClampedArray):number{

    for(let i=0; i<this.classToRGB.length; i++){
      let isEqual = rgb.every((val, index) => val === this.classToRGB[i][index]);
      if (isEqual){
        return i
      }
    }
    return -1
  }

  private captureEvents(canvas: HTMLCanvasElement) {
    // this will capture all mousedown events from the canvas element

    const touchStartEvents = fromEvent<TouchEvent>(canvas, 'touchstart')
    const mouseStartEvents = fromEvent<MouseEvent>(canvas, 'mousedown')
    const mouseMoveEvents = fromEvent<MouseEvent>(canvas, 'mousemove')

    const startEvents = merge(touchStartEvents, mouseStartEvents)
    const touchMoveEvents = fromEvent<TouchEvent>(canvas, 'touchmove');
    const moveEvents = merge(touchMoveEvents, mouseMoveEvents)
    const touchEndEvents  = fromEvent<TouchEvent>(canvas, 'touchend');
    const mouseUpEvents = fromEvent<MouseEvent>(canvas, 'mouseup')
    const mouseLeaveEvents = fromEvent<MouseEvent>(canvas, 'mouseleave')

    const endEvents = merge(touchEndEvents, mouseLeaveEvents, mouseUpEvents)

    moveEvents.subscribe({
      next:(event:MouseEvent|TouchEvent)=>{
        const rect = canvas.getBoundingClientRect();
        var pos = this.getClientPosition(event)
        this.cursorPosition.x = pos.clientX - rect.left
        this.cursorPosition.y = pos.clientY - rect.top
      }

    })
    startEvents
      .pipe(
        switchMap((e) => {
            e.preventDefault()
            const rect = canvas.getBoundingClientRect();
            const pos = this.getCoord(e, rect)
            if(this.drawTool=='draw')
              this.drawOnCanvas(pos, pos)
            else if(this.drawTool=='fill'){
              this.fillOnCanvas(pos)
            }
            this.inference()
            return moveEvents
              .pipe(
                takeUntil(endEvents),
                pairwise()
              )

        })
      )
      .subscribe({next:(res: [MouseEvent | TouchEvent, MouseEvent | TouchEvent]) => {
        const rect = canvas.getBoundingClientRect();
        var next = this.getClientPosition(res[1]);

        const prevPos = this.getCoord(res[0], rect)
        const currentPos = this.getCoord(res[1], rect)

        this.drawOnCanvas(prevPos, currentPos);
        this.inference();

      }});
  }
  getCoord(event:MouseEvent|TouchEvent, rect:DOMRect){
    var pt = this.getClientPosition(event)
    return {x:(pt.clientX - rect.left)/this.upscaleFactor,
            y:(pt.clientY - rect.top)/this.upscaleFactor}
  }

  resizeBrush(event:MatSliderChange){
    this.currentRadius = event.value || 2
    this.refreshBrush()
  }

  fillOnCanvas(pos:Point2D){
    if(!this.ctx){
      return
    }
    let imageData = this.ctx.getImageData(0, 0, this.width, this.height)
    let index = Math.round(pos.y)*this.width*4 + Math.round(pos.x)*4;
    console.log(index)
    let r = this.backgroundImage[index]
    let g = this.backgroundImage[index+1]
    let b = this.backgroundImage[index+2]
    let col = this.getClassColor(this.currentClass)

    for(let i=0;i<imageData.height;i++){
      for(let j=0;j<imageData.width;j++){
        let index = i*imageData.width*4 + j*4;

        if(this.backgroundImage[index]==r && this.backgroundImage[index+1]==g && this.backgroundImage[index+2]==b){
          imageData.data[index] = col[0]
          imageData.data[index+1] = col[1]
          imageData.data[index+2] = col[2]
        }
      }
    }
    this.ctx.putImageData(imageData, 0, 0)

  }
  changeActiveClass(class_index:number){
    this.currentClass = class_index
    this.updateStateMatrix()
    this.refreshBrush()
  }
  private updateStateMatrix(){
    this.stateCMatrix = new Array<Array<string>>()

    for(let i=0;i<this.classes.length;i++){
      let row = new Array<string>()
      for(let j=0;j<this.classes.length;j++){
        let val = 'TN'
        if(i==this.currentClass){
          val =  'FP'
        }
        if(j==this.currentClass){
          val =  'FN'
        }
        if(j==this.currentClass && i == this.currentClass){
          val =  'TP'
        }
        row.push(val)
      }
      this.stateCMatrix.push(row)
    }

  }

  private refreshBrush(){
    this.sharpBrush.setBrush(this.ctx, this.currentRadius, this.RGBFromClass(this.currentClass))
  }

  changeTool(tool:string){
    this.drawTool = tool;
  }

  getClientPosition(event:TouchEvent|MouseEvent){
    event.preventDefault()
    if('touches' in event){
      return {clientX:event.touches[0].clientX, clientY:event.touches[0].clientY}

    }
    else{
      return {clientX:event.clientX, clientY:event.clientY}
    }
  }
  private drawOnCanvas(
    prevPos: Point2D,
    currentPos: Point2D) {
    if (!this.ctx) { return; }
    if (prevPos) {
      this.sharpBrush.drawLine(this.ctx, prevPos, currentPos)
    }
    else{
      this.sharpBrush.drawLine(this.ctx, currentPos, currentPos)
    }
  }
  private initConfusionMatrix(){
    this.confusionMatrix = new Array(this.classes.length).fill(0)
    for (var i=0; i< this.confusionMatrix.length; i++){
      this.confusionMatrix[i] = new Array(this.classes.length).fill(0)
    }
    this.updateStateMatrix()
  }

  inference(){
    this.initConfusionMatrix()
    const imgData = this.ctx.getImageData(0,0,this.width, this.height).data;
    for (let i=0; i<imgData.length; i+= 4){
      if(imgData[i] > 0 ||
        imgData[i+1] > 0 ||
        imgData[i+2] > 0 ||
        this.backgroundImage[i] > 0 ||
        this.backgroundImage[i+1] > 0 ||
        this.backgroundImage[i+2] > 0){
          let rgb_bg = this.backgroundImage.slice(i, i+3)
          let rgb = imgData.slice(i, i+3)
          let gt_class = this.getClassFromRGB(rgb_bg)
          let pred_class = this.getClassFromRGB(rgb)
          if (pred_class >= 0 && gt_class >= 0){
            this.confusionMatrix[pred_class][gt_class] += 1
          }
          else{
            this.confusionMatrix[0][0] += 1
          }
        }
      else{
        this.confusionMatrix[0][0] += 1
      }
    }
  this.updateMetrics()
}

formatScore(score:number, percentage=true, digits=1):string{
  if(score==undefined){
    return ''
  }
  else{
    if(percentage) return (score*100).toFixed(digits)
    else return (score).toFixed(digits)
  }
}

private updateMetrics(){
  let statsComputer = new Stats(this.confusionMatrix)
  this.scores = statsComputer.updateScore()

}
}
