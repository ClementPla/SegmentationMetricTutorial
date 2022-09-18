export interface Phase{
  start: number;
  width:number;
  label:number;
  next:Phase | null;
  previous:Phase | null;
  exists:boolean;
}
