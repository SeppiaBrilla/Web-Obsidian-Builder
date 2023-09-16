const katex = require('katex')
import { marked } from 'marked';
import { randomUUID } from "crypto";
class Parser{

    private MathElements: Array<MathElement> = [];


    public Convert(mdString:string): string {
        let mathless = this.GetMath(mdString);

        let htmlMd = marked.parse(mathless);
        console.log(this.MathElements.length);
        let rebuilt = this.Rebuild(htmlMd);
        return rebuilt;
    }

    private Rebuild(str: string): string {
        let finalStr = str;
        for(let mathElem of this.MathElements){
            finalStr = finalStr.replace(mathElem.Id, mathElem.Value)
        }
        return finalStr;
    }

    private GetMath(mdString: string): string {
        let mathless: string = mdString;
        let mathDisplayIndeces: Array<number> = FindIndiced(mdString, '$$');
        let startDisplayIndices: Array<number> = mathDisplayIndeces.filter((_, i) => {return i%2 == 0});
        let finishDisplayIndices: Array<number> = mathDisplayIndeces.filter((_, i) => {return i%2 == 1});
        let displayElements: Array<MarkdownElement> = this.GetElements(startDisplayIndices, finishDisplayIndices);
        let mathElements: Array<MathElement> = []
        for(let elem of displayElements){
            let id: string = randomUUID();
            let currentMath:string = mdString.substring(elem.Start + 2, elem.Finish);
            mathless = mathless.replace('$$' + currentMath + '$$', id);
            mathElements.push(new MathElement(currentMath, id, true));
        }
        let mathInlineIndeces: Array<number> = FindIndiced(mathless, '$');
        let startInlineIndices: Array<number> = mathInlineIndeces.filter((_, i) => {return i%2 == 0});
        let finishInlineIndices: Array<number> = mathInlineIndeces.filter((_, i) => {return i%2 == 1});
        let InlineElements: Array<MarkdownElement> = this.GetElements(startInlineIndices, finishInlineIndices);
        for(let elem of InlineElements){
            let id: string = randomUUID();
            let currentMath:string = mdString.substring(elem.Start + 1, elem.Finish);
            mathless = mathless.replace('$' + currentMath + '$', id);
            mathElements.push(new MathElement(currentMath, id, false));
        }

        this.MathElements = mathElements;
        return mathless;
    } 

    private GetElements(starts: Array<number>, finishes: Array<number>): Array<MarkdownElement>{
        if(starts.length != finishes.length)
            throw new Error("starts and finishes must have the same length");

        let res: Array<MarkdownElement> = [];

        for(let i = 0; i < starts.length; i ++){
            res.push(new MarkdownElement(starts[i], finishes[i]));
        }

        return res;
    }
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



export { Parser };
