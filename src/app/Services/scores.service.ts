import { Injectable } from '@angular/core';
import { Score, Stats } from '../statistic';
import { ClassesService } from './classes.service';

@Injectable({
  providedIn: 'root'
})
export class ScoresService {
  scores:Array<Score>;
  confusionMatrix:Array<Array<number>>;
  stateCMatrix: Array<Array<string>>


  constructor(private classService:ClassesService) { }

  getScores(){
    return this.scores
  }

  setScores(scores:Array<Score>){
    this.scores = scores
  }
  updateScore(){
    let statsComputer = new Stats(this.confusionMatrix)
    this.scores = statsComputer.updateScore()

  }
  initConfMat(){
    this.confusionMatrix = new Array(this.classService.classes.length).fill(0)
    for (var i=0; i< this.confusionMatrix.length; i++){
      this.confusionMatrix[i] = new Array(this.classService.classes.length).fill(0)
    }
    this.updateStateMatrix()
  }


  updateStateMatrix(){
    this.stateCMatrix = new Array<Array<string>>()

    for(let i=0;i<this.classService.classes.length;i++){
      let row = new Array<string>()
      for(let j=0;j<this.classService.classes.length;j++){
        let val = 'TN'
        if(i==this.classService.currentClass){
          val =  'FP'
        }
        if(j==this.classService.currentClass){
          val =  'FN'
        }
        if(j==this.classService.currentClass && i == this.classService.currentClass){
          val =  'TP'
        }
        row.push(val)
      }
      this.stateCMatrix.push(row)
    }

  }
  computeConfusionMatrix(img1:Uint8ClampedArray, img2:Uint8ClampedArray){
    this.initConfMat()
    for (let i=0; i<img1.length; i+= 4){
      if(img2[i] > 0 ||
        img2[i+1] > 0 ||
        img2[i+2] > 0 ||
        img1[i] > 0 ||
        img1[i+1] > 0 ||
        img1[i+2] > 0){
          let rgb_bg = img1.slice(i, i+3)
          let rgb = img2.slice(i, i+3)
          let gt_class = this.classService.getClassFromRGB(rgb_bg)
          let pred_class = this.classService.getClassFromRGB(rgb)
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
    this.updateScore()
  }
}
