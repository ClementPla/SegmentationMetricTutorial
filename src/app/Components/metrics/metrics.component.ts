import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ClassesService } from 'src/app/Services/classes.service';
import { ControlUIService } from 'src/app/Services/control-ui.service';
import { ScoresService } from 'src/app/Services/scores.service';

@Component({
  selector: 'app-metrics',
  templateUrl: './metrics.component.html',
  styleUrls: ['./metrics.component.scss']
})

export class MetricsComponent implements OnInit {
  boldMacro=-1

  @Output() changeActiveClass = new EventEmitter<number>();

  constructor(public scoresService:ScoresService, public classService:ClassesService, public UICtrlService:ControlUIService) { }

  ngOnInit(): void {
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

}
