import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ClassesService } from 'src/app/Services/classes.service';
import { ControlUIService } from 'src/app/Services/control-ui.service';
import { ScoresService } from 'src/app/Services/scores.service';
import { Phase } from './phase';

@Component({
  selector: 'app-temporal',
  templateUrl: './temporal.component.html',
  styleUrls: ['./temporal.component.scss'],
})
export class TemporalComponent implements OnInit {


  isDragging: boolean = false;
  listPhasePrediction: Array<Phase>;
  listPhaseGt: Array<Phase>;
  activePhase?: Phase;
  startPosition: number;
  nFrames: number = 20000;
  framerate = 24;
  tool: string = 'grab';
  currentTime:number = 0;
  localUrl: any[]
  @ViewChild("videoPlayer", { static: false }) videoplayer: ElementRef;
  videoPlayerCtx:HTMLVideoElement

  constructor(
    private scoreService: ScoresService,
    public classService: ClassesService,
    public UICtrlService: ControlUIService
  ) {}
  ngOnInit(): void {
    this.buildDefaultSetup()

    this.UICtrlService.isSegmentation = false;

  }
  buildDefaultSetup(){
    this.listPhasePrediction = new Array<Phase>(5);
    this.listPhaseGt = new Array<Phase>(5);

    let n_samples = 5;
    let width = 100 / n_samples;
    let previous = null;
    for (let i = 0; i < 5; i++) {
      previous = {
        start: i * width,
        width: width,
        label: i,
        next: null,
        previous: previous,
        exists: true,
      };
      this.listPhasePrediction[i] = previous;
      if (i > 0) {
        this.listPhasePrediction[i - 1].next = previous;
      }
    }
    previous = null;
    for (let i = 0; i < 5; i++) {
      previous = {
        start: i * width,
        width: width,
        label: i,
        next: null,
        previous: previous,
        exists: true,
      };
      this.listPhaseGt[i] = previous;
      if (i > 0) {
        this.listPhaseGt[i - 1].next = previous;
      }
    }
    this.classService.setClasses([0, 1, 2, 3, 4]);
    this.classService.setCurrentClass(0);

    this.scoreService.initConfMat();
    this.updateScore();

  }

  addClass() {
    this.classService.addClass();
    this.updateScore();
  }
  changeActiveClass(classIndex: number) {
    this.classService.currentClass = classIndex;
    this.scoreService.updateStateMatrix();
  }
  changeTool(tool: string) {
    this.tool = tool;
  }

  loadSelectedFile(event: any) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.onload = (event: any) => {
          this.localUrl = event.target.result;
      }
      reader.readAsDataURL(event.target.files[0]);
  }
    }

  phaseAction(event: MouseEvent | TouchEvent, activePhase: Phase, gt: boolean = false) {
    const container = document.getElementById('timephase');
    if (container && !this.isDragging) {
      if (this.tool == 'cut') {
        let width = container.clientWidth;
        let rect = container.getBoundingClientRect();
        if('touches' in event){
          var offset = (100 * (event.touches[0].clientX - rect.left)) / width;
        }
        else{
          var offset = (100 * (event.clientX - rect.left)) / width;
        }
        let newWidth = offset - activePhase.start;

        let newPhase: Phase = {
          start: offset,
          width: activePhase.width - newWidth,
          label: this.classService.currentClass,
          previous: activePhase,
          next: activePhase.next,
          exists: true,
        };
        activePhase.width = newWidth;
        activePhase.next = newPhase;
        if (gt) {
          let index = this.listPhaseGt.indexOf(activePhase);
          this.listPhaseGt.splice(index + 1, 0, newPhase);
        } else {
          let index = this.listPhasePrediction.indexOf(activePhase);
          this.listPhasePrediction.splice(index + 1, 0, newPhase);
        }
      } else if (this.tool == 'fill') {
        activePhase.label = this.classService.currentClass;
      } else if (this.tool == 'delete') {
        if (activePhase.next) {
          activePhase.next.start = activePhase.start;
          activePhase.next.width += activePhase.width;
          this.deletePhase(activePhase);
        } else if (activePhase.previous) {
          activePhase.previous.width += activePhase.width;
          this.deletePhase(activePhase);
        }
      }
    }

    this.updateScore();
  }

  dragPhase(event: MouseEvent | TouchEvent) {
    if (this.isDragging && this.activePhase) {
      const container = document.getElementById('timephase');

      event.preventDefault();

      if (this.activePhase.next && container) {
        let width = container.clientWidth;
        if('touches' in event){
          let new_x = event.touches[0].pageX
          var offset = (100 * (new_x - this.startPosition )) / width
          this.startPosition = new_x
        }
        else{
          var offset = (100 * event.movementX) / width;
        }

        if (
          this.activePhase.width + offset > 0 &&
          this.activePhase.next.width - offset > 0
        ) {
          this.activePhase.width += offset;
          this.activePhase.next.start += offset;
          this.activePhase.next.width -= offset;
        }
      }
      this.updateScore();
    }
  }
  startDragging(event: MouseEvent | TouchEvent, phase: Phase) {
    this.isDragging = true;
    this.activePhase = phase;
  }
  stopDragging() {
    this.isDragging = false;
    let n_phases = this.listPhasePrediction.length;
    for (let i = 0; i < n_phases; i++) {
      let current_phase = this.listPhasePrediction[i];
      if (!(current_phase.width > 0)) {
        this.deletePhase(current_phase);
      }
    }

    this.updateScore();
  }

  updateListPhase() {
    this.listPhasePrediction = this.listPhasePrediction.filter((element) => {
      return element.exists;
    });
    this.listPhaseGt = this.listPhaseGt.filter((element) => {
      return element.exists;
    });
  }
  deletePhase(phase: Phase) {
    if (phase.previous) {
      phase.previous.next = phase.next;
    }
    if (phase.next) {
      phase.next.previous = phase.previous;
    }
    phase.exists = false;
  }

  updateScore() {
    if (this.classService.classes) {
      this.updateListPhase();

      var predicted = new Array<number>(this.nFrames);
      var groundtruth = new Array<number>(this.nFrames);

      var phasePredicted = this.listPhasePrediction[0];
      var phaseGt = this.listPhaseGt[0];

      for (let i = 0; i < this.nFrames; i++) {
        let step = (100 * i) / this.nFrames;
        predicted[i] = phasePredicted.label;
        groundtruth[i] = phaseGt.label;
        if (phasePredicted.next) {
          if (phasePredicted.start + phasePredicted.width < step) {
            phasePredicted = phasePredicted.next;
          }
        }
        if (phaseGt.next) {
          if (phaseGt.start + phaseGt.width < step) {
            phaseGt = phaseGt.next;
          }
        }
      }
      this.scoreService.updateConfusionMatrixFromArray(predicted, groundtruth);
    }
  }
  numberOnly(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
  videoLoaded() {
    this.videoPlayerCtx = this.videoplayer.nativeElement
    this.nFrames = Math.round(this.videoPlayerCtx.duration * this.framerate)
    this.updateScore()

  }
  setCurrentVideoFrame(){
    if(this.videoPlayerCtx)
      this.currentTime = this.videoPlayerCtx.currentTime
    else{
      this.currentTime = 0
    }
  }

  setCurrentTime(data:Event){
    this.currentTime = 100*this.videoPlayerCtx.currentTime / this.videoPlayerCtx.duration

  }
  onFileSelected() {
    const inputNode: any = document.querySelector('#file');
    if (typeof (FileReader) !== 'undefined') {
      const reader = new FileReader();

      reader.onload = (e: any) => {

        this.localUrl = e.target.result;
      };

      reader.readAsArrayBuffer(inputNode.files[0]);
    }
  }
  updateFramerate(){
    this.nFrames = Math.round(this.videoPlayerCtx.duration * this.framerate)
    this.updateScore()
  }
}
