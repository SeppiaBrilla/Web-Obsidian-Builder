const katex = require('katex')

function GetElements(starts: Array<number>, finishes: Array<number>): Array<MarkdownElement>{
        if(starts.length != finishes.length)
            throw new Error("starts and finishes must have the same length");

        let res: Array<MarkdownElement> = [];

        for(let i = 0; i < starts.length; i ++){
            res.push(new MarkdownElement(starts[i], finishes[i]));
        }

        return res;
}

class MathElement{
    public Value: string;
    public Id: string;

    constructor(value: string, id: string, display:boolean){
        this.Value = katex.renderToString(
            value, 
            {
                "displayMode":display,
                "output":"htmlAndMathml",
            });
        this.Id = id;
    }

}

class MarkdownElement{
    public Start: number;
    public Finish: number;

    constructor(start:number, finish:number){
        this.Start = start;
        this.Finish = finish;
    };
}

function FindIndiced(originString:string, subString:string): Array<number>{
    let step: number = subString.length;
    let match: Array<number> = [];
    for(let i = 0; i < originString.length - step; i++){
        let sub:string = originString.substring(i, i+step);
        if(sub === subString){
            match.push(i)
        }
    }

    return match;
}

export { FindIndiced, MarkdownElement, MathElement, GetElements };
