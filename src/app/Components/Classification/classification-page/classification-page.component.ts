import { Component, OnInit } from '@angular/core';
import { ControlUIService } from 'src/app/Services/control-ui.service';

@Component({
  selector: 'app-classification-page',
  templateUrl: './classification-page.component.html',
  styleUrls: ['./classification-page.component.scss']
})
export class ClassificationPageComponent implements OnInit {

  constructor(public UICtrlService:ControlUIService) {
    UICtrlService.ignoreFirstClassMetric = false
    this.UICtrlService.isSegmentation = false;

  }

  ngOnInit(): void {
  }

}
