import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-tooltips',
  templateUrl: './tooltips.component.html',
  styleUrls: ['./tooltips.component.scss']
})
export class TooltipsComponent implements OnInit {

  @Input() typeTooltip:string
  @Input() visible:boolean

  constructor() { }

  ngOnInit(): void {
  }


}
