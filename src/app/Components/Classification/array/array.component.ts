import { Component, OnInit } from '@angular/core';
import { ClassesService } from 'src/app/Services/classes.service';
import { ControlUIService } from 'src/app/Services/control-ui.service';
import { ScoresService } from 'src/app/Services/scores.service';

@Component({
  selector: 'app-array',
  templateUrl: './array.component.html',
  styleUrls: ['./array.component.scss'],
})
export class ArrayComponent implements OnInit {
  predString: string = '';
  gtString: string = '';
  predArray: Array<number>;
  gtArray: Array<number>;
  maxClass: number = 12;

  constructor(
    private scoreService: ScoresService,
    public classService: ClassesService,
    public UICtrlService: ControlUIService
  ) {
    classService.setClasses([0, 1]);
    this.scoreService.initConfMat();
  }

  ngOnInit(): void {}

  onChangeArray() {
    this.predString = this.predString
      .replace(/ /, ', ')
      .replace(/[^0-9- ,]+/, '').replace(/,,/g, ', ')
      .replace(/\s\s+/g, ' ');
    this.gtString = this.gtString
      .replace(/ /, ', ')
      .replace(/[^0-9-,]+/, '').replace(/,,/g, ', ')
      .replace(/\s\s+/g, ' ');
    let max_value = 0;
    this.gtArray = this.gtString
      .trim()
      .split(',')
      .map((value) => {
        let v = parseInt(value);
        if (v > this.maxClass) {
          this.gtString = this.gtString.replace(
            value,
            this.maxClass.toString()
          );
          v = this.maxClass;
        }
        if (v > max_value) {
          max_value = v;
        }
        return v;
      });
    this.predArray = this.predString
      .trim()
      .split(',')
      .map((value) => {
        let v = parseInt(value);

        if (v > this.maxClass) {
          this.predString = this.predString.replace(
            value,
            this.maxClass.toString()
          );
          v = this.maxClass;
        }
        if (v > max_value) {
          max_value = v;
        }
        return v;
      });
    if (max_value == 0) {
      max_value += 1;
    }
    this.predArray = this.predArray.filter((value) => {
      return !Number.isNaN(value);
    });
    this.gtArray = this.gtArray.filter((value) => {
      return !Number.isNaN(value);
    });
    this.classService.setClasses([...Array(max_value + 1).keys()]);
    this.scoreService.initConfMat();

    if (this.predArray.length > 0 && this.gtArray.length > 0) {
      this.scoreService.updateConfusionMatrixFromArray(
        this.predArray,
        this.gtArray
      );
    }
  }
}
