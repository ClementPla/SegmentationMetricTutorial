import { Component, OnInit, Output, EventEmitter, ViewEncapsulation} from '@angular/core';
import { ControlUIService } from 'src/app/Services/control-ui.service';


@Component({
  selector: 'app-presets',
  templateUrl: './presets.component.html',
  styleUrls: ['./presets.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PresetsComponent implements OnInit {
  @Output() setExampleByID = new EventEmitter<string>();

  constructor(public UICtrlService:ControlUIService) { }

  ngOnInit(): void {
  }

  getPreset(value:string){
    this.setExampleByID.emit(value)
  }

}
