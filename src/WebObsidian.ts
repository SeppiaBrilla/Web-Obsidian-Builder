import { ObsidianlinkArray } from './links';
import {  Graph } from './graph';
import { MarkdownElement, MathElement, Token} from './types';
import { Tokenize, BuildElements } from './Parser';
import { randomUUID } from "crypto";
import { type } from 'os';
import { defaultMaxListeners } from 'events';



class WebObsidian{
    
    Links:ObsidianlinkArray;
    LinksDict: {[id:string]: string};
    AdiacentMatrix:number[][];
    NoteNames:Array<string>;

    private MathElements: Array<MathElement> = [];

    constructor(links:ObsidianlinkArray){
        this.Links = links;
        this.LinksDict = links.toDict();
        this.AdiacentMatrix = [];
        const len = this.Links.length;
        for(let i: number = 0; i < len; i++) {
            this.AdiacentMatrix[i] = [];
            for(let j: number = 0; j< len; j++) {
                this.AdiacentMatrix[i][j] = 0;
            }
        }
        this.NoteNames = links.GetNames();
    }

    AddAndConvert(noteName:string, noteText:string){
        const from = this.NoteNames.indexOf(noteName);
        const tokens = Tokenize(noteText);
        const elements = BuildElements(tokens, noteText);

        const buildGraphAndConvert = (element:MarkdownElement, mdString:string) => {
            const currentLink:string = noteText.substring(element.Start + 2, element.Finish);
            const to = this.NoteNames.indexOf(currentLink);
            this.AdiacentMatrix[from][to] = 1;
            return this.ConvertLinksElements(element, mdString);
        }
        for(let element of elements){
            if(element.Type === Token.u){
                throw new Error("undefined element found");
            }
            switch(Token[element.Type]){
                case Token[Token.$$]:
                    noteText = this.ConvertDisplayMathElement(element, noteText);
                break;
                case Token[Token.$]:
                    noteText = this.ConvertInlineMathElement(element, noteText);
                break;
                case Token[Token['[[']]:
                    noteText = buildGraphAndConvert(element, noteText);
                break;
                
            }
        }
        return noteText;
    }

    Convert(noteText:string, elements:Array<MarkdownElement>, functions: {[id:string] : Function}){
        for(let element of elements){
            if(element.Type === Token.u){
                throw new Error("undefined element found");
            }
            noteText = functions[Token[element.Type]](element, noteText)
        }
        return noteText;
    }

    GetGraph(){
        return new Graph(this.NoteNames, this.AdiacentMatrix);       
    }

    private ConvertDisplayMathElement(element:MarkdownElement, mdString:string): string{
        const id: string = randomUUID();
        const currentMath:string = element.Value;
        this.MathElements.push(new MathElement(currentMath, id, true));
        return mdString.replace(`$$${currentMath}$$`, id);
    }

    private ConvertInlineMathElement(element:MarkdownElement, mdString:string): string{
        const id: string = randomUUID();
        const currentMath:string = element.Value;
        this.MathElements.push(new MathElement(currentMath, id, true));
        return mdString.replace(`$${currentMath}$`, id);
    }

    private ConvertLinksElements(element:MarkdownElement, mdString:string):string {
            const currentLink:string = element.Value;
            return mdString.replace(`[[${currentLink}]]`, `[${currentLink}](${this.LinksDict[currentLink]})`); 
    }
}


export { WebObsidian };

