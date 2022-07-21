import { Component } from '@angular/core';
import { ControlUIService } from './Services/control-ui.service';
import { ScoresService } from './Services/scores.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent{
  constructor(public scoresService:ScoresService, public UICtrlService:ControlUIService){}


}
