import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ClassesService } from 'src/app/Services/classes.service';
import { ControlUIService } from 'src/app/Services/control-ui.service';
import { ScoresService } from 'src/app/Services/scores.service';
import { Score } from 'src/app/statistic';
import { colorScore } from '../../utils';

@Component({
  selector: 'app-metrics',
  templateUrl: './metrics.component.html',
  styleUrls: ['./metrics.component.scss'],
})
export class MetricsComponent implements OnInit {

  boldMacro = -1;

  constructor(
    public scoresService: ScoresService,
    public classService: ClassesService,
    public UICtrlService: ControlUIService
  ) {}

  ngOnInit(): void {}

  changeActiveClass(index:number){
    this.classService.setCurrentClass(index);
    this.scoresService.updateStateMatrix()
  }

  formatScore(score: number, percentage = true, digits = 1) {
    if (score == undefined) {
      return
    } else {
      if (percentage) return (score * 100).toFixed(digits);
      else return score.toFixed(digits);
    }
  }

  toggleScoreSetup(event:MouseEvent, score: Score, description:string) {
    event.preventDefault();

    let structure = {score:score, description:description}
    let indexOf = -1
    this.scoresService.selectedScores.forEach((el, index)=>{
      let isSelected = ((el.score.name==score.name) && (el.description==description))
      if(isSelected) {
        indexOf = index
      }
    })
    if(indexOf>=0){
      this.scoresService.selectedScores.splice(indexOf, 1)
    }
    else{
      this.scoresService.selectedScores.push(structure)
    }

  }
  isSelectedMetric(scoreName:string, description:string){
    let isSelected = false;
    this.scoresService.selectedScores.forEach((el)=>{
      isSelected = ((el.score.name==scoreName) && (el.description==description)) || isSelected
    })
    return isSelected

  }

}
