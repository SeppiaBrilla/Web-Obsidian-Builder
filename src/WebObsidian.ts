import { ObsidianlinkArray } from './links';
import {  Graph } from './graph';
import { MarkdownElement, MathElement, Element, LinkElement, Token, MermaidElement} from './types';
import { Tokenize, BuildElements } from './Parser';
import { randomUUID } from "crypto";
import { marked } from 'marked';


class WebObsidian{
    
    Links:ObsidianlinkArray;
    LinksDict: {[id:string]: string};
    AdiacentMatrix:number[][];
    NoteNames:Array<string>;

    private Elements: Array<Element> = [];

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
        
        noteText = this.RemoveElementAndConvert(noteText, elements, from);
        return this.Rebuild(noteText);
    }

    Convert(noteText:string){
        const tokens = Tokenize(noteText);
        const elements = BuildElements(tokens, noteText);
        
        noteText = this.RemoveElementAndConvert(noteText, elements);
        return this.Rebuild(noteText);
    }

    GetGraph(){
        return new Graph(this.NoteNames, this.AdiacentMatrix);       
    }

    private RemoveElementAndConvert(noteText:string, elements:Array<MarkdownElement>, noteIndex:number|undefined = undefined){
        const convertOnly: boolean = noteIndex === undefined;
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
                    if(convertOnly){
                        noteText = this.ConvertLinksElement(element, noteText);
                        break;
                    }
                    noteText = this.BuildGraphAndConvert(element, noteText, (<number>noteIndex));
                break;
                case Token[Token['```mermaid']]:
                    noteText = this.ConvertMermaidElement(element,noteText);
                break;
            }
        }
        return marked.parse(noteText);
    }

    private Rebuild(noteText:string): string{
        for(let elem of this.Elements){
            noteText = noteText.replace(elem.Id,elem.Value);
        }
        return noteText;
    }

    private ConvertDisplayMathElement(element:MarkdownElement, mdString:string): string{
        const id: string = randomUUID();
        const currentMath:string = element.Value;
        this.Elements.push(new MathElement(currentMath, id, true));
        return mdString.replace(`$$${currentMath}$$`, id);
    }

    private ConvertInlineMathElement(element:MarkdownElement, mdString:string): string{
        const id: string = randomUUID();
        const currentMath:string = element.Value;
        this.Elements.push(new MathElement(currentMath, id, true));
        return mdString.replace(`$${currentMath}$`, id);
    }

    private ConvertLinksElement(element:MarkdownElement, mdString:string):string {
        const id: string = randomUUID();
        const currentLink:string = element.Value;
        this.Elements.push(new LinkElement(currentLink, id, this.LinksDict[currentLink] + ".html"));
        return mdString.replace(`[[${currentLink}]]`, id); 
    }

    private ConvertMermaidElement(element:MarkdownElement, mdString:string):string{
        const id:string = randomUUID();
        const currentMermaid:string = element.Value;
        this.Elements.push(new MermaidElement(currentMermaid, id));
        return mdString.replace(`\`\`\`mermaid${currentMermaid}\`\`\``,id);
    }

    private BuildGraphAndConvert = (element:MarkdownElement, mdString:string, from:number) => {
        const currentLink:string = element.Value;
        const to = this.NoteNames.indexOf(currentLink);
        this.AdiacentMatrix[from][to] = 1;
        return this.ConvertLinksElement(element, mdString);
    }
}


export { WebObsidian };

