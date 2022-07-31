import { Component, OnInit, Output, EventEmitter} from '@angular/core';
import { ClassesService } from 'src/app/Services/classes.service';
import { ControlUIService } from 'src/app/Services/control-ui.service';
import { ScoresService } from 'src/app/Services/scores.service';

@Component({
  selector: 'app-conf-mat',
  templateUrl: './conf-mat.component.html',
  styleUrls: ['./conf-mat.component.scss']
})
export class ConfMatComponent implements OnInit {

  @Output() changeActiveClass = new EventEmitter<number>();

  constructor(public scoresService:ScoresService, public classService:ClassesService, public UICtrlService:ControlUIService) { }

  ngOnInit(): void {
  }
}
