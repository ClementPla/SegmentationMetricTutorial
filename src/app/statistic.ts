

export class Stats{
  cm: Array<Array<number>>;
  n_classes: number;
  sumRows:Array<number>;
  sumCols:Array<number>;
  union:Array<number>;
  diagValues:Array<number>
  S:number;
  constructor(confMat:Array<Array<number>>){
    this.cm = confMat
    this.n_classes = confMat.length

    this.diagValues = new Array<number>(this.n_classes)
    this.union = new Array<number>(this.n_classes)

    this.sumCols = this.cm.map(r => r.reduce((a, b) => a + b));
    this.sumRows = this.cm.reduce((a,b) => a.map((x, i) => x + b[i]))
    this.S = this.sumRows.reduce((a, b) => a+b)


    for(let i=0; i<this.n_classes; i++){
      this.diagValues[i] = this.cm[i][i]
      this.union[i] = this.sumCols[i] + this.sumRows[i] - this.diagValues[i]
    }

  }

  static getStats(P:number, N:number, TP:number, TN:number, FP:number):Map<string, number>{
    var statistics = new Map<string, number>()
    statistics.set('Accuracy', (TP+TN) / (P+N+0.001))
    statistics.set('Precision', TP / (TP+FP+0.001))
    statistics.set('Sensitivity',  TP/(P+0.001))
    statistics.set('Specificity', TN/(N+0.001))
    statistics.set('Dice', (2*TP)/(2*TP+FP+(P-TP)+0.001))
    return statistics
  }

  getBinaryClassStats():Map<string, number>{
    let N = this.sumRows[0]
    let P = this.sumRows[1]
    let TP = this.cm[1][1]
    let TN = this.cm[0][0]
    let FP = N - TN
    var statistics = Stats.getStats(P, N, TP, TN, FP)
    statistics.set("Kappa", this.cohenKappa())
    statistics.set("IoU", (TP)/(P+FP))
    return statistics
  }

  getMultiClassStats():Map<string, Array<number>>{
    var statistics = new Map()
    statistics.set('IoU', new Array<number>())
    statistics.set('TP', new Array<number>())
    statistics.set('TN', new Array<number>())
    statistics.set('P', new Array<number>())
    statistics.set('N', new Array<number>())
    statistics.set('FP', new Array<number>())

    for(let i=0; i<this.n_classes; i++){
      let P = this.sumRows[i]
      let N = this.S - P

      let TP = this.diagValues[i]
      let TN = this.S - this.union[i]
      let FP = this.sumCols[i] - this.diagValues[i]
      let stats = Stats.getStats(P, N, TP, TN, FP)
      for(const  [key, value] of stats){
        if(!statistics.has(key)) statistics.set(key, new Array<number>())
        statistics.get(key).push(value)
      }
      statistics.get('IoU').push(TP/(this.union[i]+1))
      statistics.get('TP').push(TP)
      statistics.get('TN').push(TN)
      statistics.get('P').push(P)
      statistics.get('N').push(N)
      statistics.get('FP').push(FP)
    }
    return statistics
  }
  
  updateScore():Array<Score>{
    let scores = new Array<Score>()
    if(this.n_classes==2){
      let stats = this.getBinaryClassStats()
      for (const [key, value] of stats){
        scores.push(new Score({name:key, score:value}))
      }
    }
    else{
      let stats = this.getMultiClassStats();

      let microStats = Stats.getMicroAverageScore(stats);

      let keys = Array.from(microStats.keys())
      for (const [key, value] of stats)
      {
        if(keys.includes(key)){
          let args = {name:key, perClassScore:value, microAverage:microStats.get(key), macroAverage:Stats.getMacroAverage(value)}
          scores.push(new Score(args))
        }
        if(key=='IoU'){
          let arg = {name:key, perClassScore:value, macroAverage:Stats.getMacroAverage(value)}
          let s = new Score(arg)
          scores.push(s)
        }
      }
      scores.push(new Score({name:'Kappa', score:this.cohenKappa()}))
    }
    return scores
  }

  static getMicroAverageScore(samples:Map<string, Array<number>>):Map<string, number>{
    let TP = samples.get('TP')?.reduce((a,b)=>a+b) || 0
    let FP = samples.get('FP')?.reduce((a,b)=>a+b) || 0
    let TN = samples.get('TN')?.reduce((a,b)=>a+b) || 0
    let P = samples.get('P')?.reduce((a,b)=>a+b) || 0
    let N = samples.get('N')?.reduce((a,b)=>a+b) || 0
    return Stats.getStats(P, N, TP, TN, FP)

  }

  static getMacroAverage(array:Array<number>){
    return array.reduce((a, b)=>a+b)/array.length
  }

  cohenKappa(quadratic:boolean=false):number{

    let probAgree:number = this.diagValues.reduce((a, b)=>a+b) / this.S
    let probsRandAgree = new Array<number>(this.n_classes)
    for(let i=0; i<this.n_classes; i++){
      probsRandAgree[i] = (this.sumRows[i]*this.sumCols[i])/(this.S*this.S)
    }
    let probRandom = probsRandAgree.reduce((a, b)=>a+b)
    return (probAgree-probRandom)/(1-probRandom)
  }

}

export class Score{
  score:number
  name:string
  perClassScore:Array<number>
  macroAverage:number
  microAverage:number
  constructor(setting:{name:string, score?:number, perClassScore?:Array<number>, macroAverage?:number, microAverage?:number}){
    this.name = setting.name
    if(setting.score !=undefined) this.score = setting.score
    if(setting.perClassScore) this.perClassScore = setting.perClassScore;
    if(setting.macroAverage!=undefined) this.macroAverage = setting.macroAverage
    if(setting.microAverage!=undefined) this.microAverage = setting.microAverage

  }
}
