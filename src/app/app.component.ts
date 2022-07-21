import { Component, ElementRef, ViewChild } from '@angular/core';
import { from, fromEvent, Observable, merge } from 'rxjs';

import { switchMap, takeUntil, pairwise } from 'rxjs/operators'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent{

}
