import { Component, OnInit, ViewChild } from '@angular/core';
import { ControlUIService } from 'src/app/Services/control-ui.service';
import { ScoresService } from 'src/app/Services/scores.service';
import { DrawingComponent } from '../Segmentation/drawing.component';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {
  constructor(public scoresService:ScoresService, public UICtrlService:ControlUIService){}


  toggleVisibilityScore(index:number){
    this.scoresService.visibleScores[index] = !this.scoresService.visibleScores[index]
  }

  changeOpacity(value:number|null){
    if(value){
      this.UICtrlService.overlayOpacity = value;
    }
  }
  ngOnInit(): void {}
}
