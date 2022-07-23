import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ClassesService } from 'src/app/Services/classes.service';
import { ControlUIService } from 'src/app/Services/control-ui.service';
import { ScoresService } from 'src/app/Services/scores.service';
import { Color } from '../drawing/utils';

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

  test(v:number){
    console.log('here')
    return 'rgb(255,0,0)'
  }


  colorScore(score:number | undefined){
    if(score==undefined){
      return ''
    }

    let percent = score > 0? score*100 : 0;
    let h=359
    let s=75
    let l=0;

    if(percent < 25){
      l = percent+12
    }
    else if(percent <50){
      h=25
      l = percent+25

    }
    else{
      h=percent
      l = Math.min(percent, 50)
    }
    let rgb = Color.getRGBfromHSL([h, s, l])
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`

  }
}
