import { Injectable } from '@angular/core';
import { Score, Stats } from '../statistic';
import { ClassesService } from './classes.service';
import { ControlUIService } from './control-ui.service';
import { DrawService } from './draw.service';

@Injectable({
  providedIn: 'root',
})
export class ScoresService {
  scores: Array<Score>;
  visibleScores: Array<boolean>;
  confusionMatrix: Array<Array<number>>;
  stateCMatrix: Array<Array<string>>;

  constructor(private classService: ClassesService,
    private UICtrlService:ControlUIService,
    private drawService:DrawService) {}

  getScores() {
    return this.scores;
  }

  setScores(scores: Array<Score>) {
    this.scores = scores;
    this.visibleScores = new Array<boolean>(this.scores.length).fill(true);
  }

  updateScore() {
    let statsComputer = new Stats(this.confusionMatrix, this.UICtrlService.ignoreFirstClassMetric);
    this.setScores(statsComputer.updateScore());
  }

  initConfMat() {
    this.confusionMatrix = new Array(this.classService.classes.length).fill(0);
    for (var i = 0; i < this.confusionMatrix.length; i++) {
      this.confusionMatrix[i] = new Array(
        this.classService.classes.length
      ).fill(0);
    }
    this.updateStateMatrix();
  }

  updateStateMatrix() {
    this.stateCMatrix = new Array<Array<string>>();

    for (let i = 0; i < this.classService.classes.length; i++) {
      let row = new Array<string>();
      for (let j = 0; j < this.classService.classes.length; j++) {
        let val = 'TN';
        if (i == this.classService.currentClass) {
          val = 'FP';
        }
        if (j == this.classService.currentClass) {
          val = 'FN';
        }
        if (
          j == this.classService.currentClass &&
          i == this.classService.currentClass
        ) {
          val = 'TP';
        }
        row.push(val);
      }
      this.stateCMatrix.push(row);
    }
  }
  updateConfusionMatrix(img1: Uint8ClampedArray, img2: Uint8ClampedArray) {
    this.initConfMat();
    this.computeConfMat(img1, img2, this.confusionMatrix);

    this.updateScore();
  }

  computeConfMat(
    img1: Uint8ClampedArray,
    img2: Uint8ClampedArray,
    confMat: Array<Array<number>>
  ) {
    for (let i = 0; i < img1.length; i += 4) {
      if (
        img2[i] > 0 ||
        img2[i + 1] > 0 ||
        img2[i + 2] > 0 ||
        img1[i] > 0 ||
        img1[i + 1] > 0 ||
        img1[i + 2] > 0
      ) {
        let rgb_bg = img1.slice(i, i + 3);
        let rgb = img2.slice(i, i + 3);
        let gt_class = this.classService.getClassFromRGB(rgb_bg);
        let pred_class = this.classService.getClassFromRGB(rgb);
        if (pred_class >= 0 && gt_class >= 0) {
          confMat[pred_class][gt_class] += 1;
        } else {
          confMat[0][0] += 1;
        }
      } else {
        confMat[0][0] += 1;
      }
    }
  }

  computeBoundaryIoU(
    img1: Uint8ClampedArray,
    img2: Uint8ClampedArray,
    width: number,
    height: number,
    boundary: number = 3
  ) {
    let n_classes = this.classService.classes.length;
    let confMat = new Array(n_classes);
    for (let i = 0; i < n_classes; i++) {
      confMat[i] = new Array(n_classes).fill(0);
    }

    let kernel = this.drawService.getKernel(boundary);
    let boundary1 = this.drawService.convertImgToBoundaryRegion(
      img1,
      kernel,
      width,
      height
    );
    let boundary2 = this.drawService.convertImgToBoundaryRegion(
      img2,
      kernel,
      width,
      height
    );
    this.computeConfMat(boundary1, boundary2, confMat);
    let stat = new Stats(confMat);
    let scores = stat.updateScore();
    scores.forEach((element) => {
      if (element.name == 'Dice' || element.name == 'IoU') {
        element.name = 'Boundary ' + element.name;
        this.scores.push(element);
      }
    });
    this.setScores(this.scores);
  }


}
