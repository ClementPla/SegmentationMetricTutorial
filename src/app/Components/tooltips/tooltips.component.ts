import { Component, Input, OnInit } from '@angular/core';
import { ControlUIService } from 'src/app/Services/control-ui.service';

@Component({
  selector: 'app-tooltips',
  templateUrl: './tooltips.component.html',
  styleUrls: ['./tooltips.component.scss']
})
export class TooltipsComponent implements OnInit {

  @Input() type:string
  precision='$$ \\text{precision} = \\frac{TP}{TP+FP} $$'

  accuracy='$$ \\text{precision} = \\frac{TP}{TP+FP} $$'
  /* precision='$$ \\text{precision} = \\frac{TP}{TP+FP} $$'
  precision='$$ \\text{precision} = \\frac{TP}{TP+FP} $$'
  precision='$$ \\text{precision} = \\frac{TP}{TP+FP} $$'
  precision='$$ \\text{precision} = \\frac{TP}{TP+FP} $$'
  precision='$$ \\text{precision} = \\frac{TP}{TP+FP} $$'*/
  constructor(public controlUIService:ControlUIService) { }

  ngOnInit(): void {
  }


}
