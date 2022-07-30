import { Component, Input, OnInit } from '@angular/core';
import { ControlUIService } from 'src/app/Services/control-ui.service';

@Component({
  selector: 'app-tooltips',
  templateUrl: './tooltips.component.html',
  styleUrls: ['./tooltips.component.scss']
})
export class TooltipsComponent implements OnInit {

  @Input() type: string
  precision = '$$ \\text{precision} = \\frac{TP}{TP+FP} $$'
  accuracy = '$$ \\text{accuracy} = \\frac{TP + TN}{TP + TN + FP + FN} $$'
  specificity = '$$ \\text{specificity} = \\frac{TN}{TN+FP} $$'
  sensitivity = '$$ \\text{sensitivity} = \\frac{TP}{TP+FN} $$'

  iou = '\\begin{align*} \\text{IoU} &= \\frac{|P \\cap G| }{ |P \\cup G|} \\\\ \\text{IoU} &= \\frac{TP}{TP + FP + TN} \\end{align*}'
  dice = '\\begin{align*} \\text{dice} &= \\frac{2 \\cdot TP}{2 \\cdot TP + FP + FN} \\\\ \\text{dice} &= \\frac{2 \\cdot |P \\cap G|}{|P| + |G|} \\end{align*}'
  kappa = '$$ \\kappa = \\frac{p_{agree} - p_{chance}}{1 - p_{chance}}$$'

  boundaryIoU = '$$ \\text{boundary IoU} = \\frac{|(P_d \\cap P) \\cap (G_d \\cap G)|}{|(P_d \\cap P) \\cup (G_d \\cap G)|}$$'
  boundaryDice = '$$ \\text{dice}= \\frac{2 \\cdot |(P_d \\cap P) \\cap (G_d \\cap G)|}{|(P_d \\cap P))| + |(G_d \\cap G))|} $$'

  constructor(public controlUIService: ControlUIService) { }

  ngOnInit(): void {
  }


}
