import { Point2D } from "./utils"

export class SharpBrush{
  currentBrush:ImageBitmap

  constructor(){
  }
  static createBrush(imageData:ImageData, color:Uint8ClampedArray){
    let w = imageData.width
    let h = imageData.height
    let r = Math.min(w, h) / 2
    for(let i=0; i<h; i++){
      for(let j=0; j<w; j++){
        let coord = Math.pow(i-h/2, 2) + Math.pow(j-w/2, 2)
        let pos = (i*w*4) + j*4
        if (coord < r*r){
          imageData.data[pos] = color[0]
          imageData.data[pos+1] = color[1]
          imageData.data[pos+2] = color[2]
          imageData.data[pos+3] = 255
      }
      }
    }
  }

  drawLine(ctx:CanvasRenderingContext2D, point1:Point2D, point2:Point2D){
    const dist = this.distanceBetween(point1, point2)
    const angle = this.angleBetween(point1, point2)
    let halfSizeOfBrush = this.currentBrush.width/2
    if(dist==0){
      const x = point1.x - halfSizeOfBrush
      const y = point1.y - halfSizeOfBrush
      ctx.drawImage(this.currentBrush, Math.round(x), Math.round(y))
    }

    for (let i = 0; i < dist; i += 5) {
      const x = point1.x + (Math.sin(angle) * i) - halfSizeOfBrush
      const y = point1.y + (Math.cos(angle) * i) - halfSizeOfBrush
      ctx.drawImage(this.currentBrush, Math.round(x), Math.round(y))
    }

  }

  static drawCircle(ctx:CanvasRenderingContext2D, x:number, y:number, r:number, color:Uint8ClampedArray):Promise<void | ImageBitmap>{
    let img = ctx.createImageData(r*2, r*2)
    SharpBrush.createBrush(img, color)
    return createImageBitmap(img).then((img) => {
      ctx.drawImage(img, x-r, y-r);
    })
  }

  private distanceBetween(point1:Point2D, point2:Point2D):number{
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2))
  }

  private angleBetween(point1:Point2D, point2:Point2D):number{
    return Math.atan2(point2.x - point1.x, point2.y - point1.y)
  }

  setBrush(ctx:CanvasRenderingContext2D, radius:number, color:Uint8ClampedArray){
    let imgData = ctx.createImageData(radius*2, radius*2)
    SharpBrush.createBrush(imgData, color)
    createImageBitmap(imgData).then((imageBitmapData)=>{
      this.currentBrush = imageBitmapData
    })
  }

}
