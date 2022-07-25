import { Component, ViewChild } from '@angular/core';
import { DrawingComponent } from './Components/drawing/drawing.component';
import { ControlUIService } from './Services/control-ui.service';
import { ScoresService } from './Services/scores.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent{
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

}
