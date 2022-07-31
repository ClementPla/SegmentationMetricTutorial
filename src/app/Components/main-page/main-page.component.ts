import { Component, OnInit, ViewChild } from '@angular/core';
import { ControlUIService } from 'src/app/Services/control-ui.service';
import { ScoresService } from 'src/app/Services/scores.service';
import { DrawingComponent } from '../drawing/drawing.component';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {
  @ViewChild(DrawingComponent) child:DrawingComponent;
  overlayOpacity:number = 80;
  constructor(public scoresService:ScoresService, public UICtrlService:ControlUIService){}

  changeActiveClass(value:number){
    this.child.changeActiveClass(value)
  }

  toggleVisibilityScore(index:number){
    this.scoresService.visibleScores[index] = !this.scoresService.visibleScores[index]
  }
  
  changeOpacity(value:number|null){
    if(value){
      this.overlayOpacity = value;
    }
  }
  ngOnInit(): void {}
}
