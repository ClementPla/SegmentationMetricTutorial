import { Component, OnInit } from '@angular/core';
import {SelectedScore, ScoresService } from 'src/app/Services/scores.service';

@Component({
  selector: 'app-bar-plot',
  templateUrl: './bar-plot.component.html',
  styleUrls: ['./bar-plot.component.scss']
})
export class BarPlotComponent implements OnInit {
selectScore(selectedScore: SelectedScore):number {
  if(selectedScore.description=='micro'){
    return selectedScore.score.microAverage
  }

  else if(selectedScore.description=='macro'){
    return selectedScore.score.macroAverage
  }

  else if(selectedScore.description==''){
    if(selectedScore.score.name=='Kappa')
      return selectedScore.score.score
      else
      return selectedScore.score.score
  }

  else{
    let index = Number(selectedScore.description)
    return selectedScore.score.perClassScore[index]
  }

}
getHeight(selectedScore:SelectedScore):number{
  let height = this.selectScore(selectedScore);
  if(selectedScore.score.name=='Kappa'){
    height += 1
    height /= 2
    height *= 100
  }
  else{
    height *= 100
  }
  return height

}
  constructor(public scoresService:ScoresService) { }

  ngOnInit(): void {
  }

}
