import { ObsidianlinkArray } from './Links';
import {  Graph } from './Graph';
import { MarkdownElement, MathElement, Element, LinkElement, MermaidElement, VisualLinkElement, MathClass} from './ObsidianElements';
import { Token } from './Tokens';
import { Tokenize, BuildElements } from './Parser';
import { randomUUID } from "crypto";
import { marked } from 'marked';


class WebObsidianBuilder{
    
    private Links:ObsidianlinkArray;
    private LinksDict: {[id:string]: string};
    private NotInGraphLinksDict: {[id:string]: string};
    private AdiacentMatrix:number[][];
    private NoteNames:Array<string>;

    private Mathcss: boolean = false;

    private Elements: Array<Element> = [];

    constructor(links:ObsidianlinkArray, notInGraphLinks:ObsidianlinkArray| undefined = undefined){
        this.Links = links;
        this.LinksDict = links.toDict();
        this.NotInGraphLinksDict = notInGraphLinks !== undefined ? notInGraphLinks.toDict(): {};
        this.AdiacentMatrix = [];
        const len = this.Links.length;
        for(let i: number = 0; i < len; i++) {
            this.AdiacentMatrix[i] = [];
            for(let j: number = 0; j< len; j++) 
                this.AdiacentMatrix[i][j] = 0;
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

    GetCss():string{
        let css = "";
        if(this.Mathcss){
            css += `.${MathClass}{
    display: none;
}`;
        }
        return css;
    }

    private RemoveElementAndConvert(noteText:string, elements:Array<MarkdownElement>, noteIndex:number|undefined = undefined){
        const convertOnly: boolean = noteIndex === undefined;
        for(const element of elements){
            if(element.Type === Token.u)
                throw new Error("undefined element found");
            switch(Token[element.Type]){
                case Token[Token.$$]:
                    noteText = this.ConvertDisplayMathElement(element, noteText);
                    this.Mathcss = true;
                break;
                case Token[Token.$]:
                    noteText = this.ConvertInlineMathElement(element, noteText);
                    this.Mathcss = true;
                break;
                case Token[Token['![[']]:
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
        for(const elem of this.Elements)
            noteText = noteText.replace(elem.Id,elem.Value);
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
        this.Elements.push(new MathElement(currentMath, id, false));
        return mdString.replace(`$${currentMath}$`, id);
    }

    private ConvertLinksElement(element:MarkdownElement, mdString:string):string {
        const id: string = randomUUID();
        let currentLink:string = element.Value;
        let reference: string = element.Value;
        const split = element.Value.split("|");
        if(split.length > 1){
            currentLink = split[1]
            reference = split[0]
        }
        let link = this.LinksDict[reference];
        if(link === undefined){
            link = this.NotInGraphLinksDict[reference];
            if(link === undefined)
                link = reference;
        }
        if(element.Type === Token['[[']){
            this.Elements.push(new LinkElement(currentLink, id, link));
            return mdString.replace(`[[${element.Value}]]`, id); 
        }
        this.Elements.push(new VisualLinkElement(currentLink, id, link));
        return mdString.replace(`![[${element.Value}]]`, id); 
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
        if(to >= 0)
            this.AdiacentMatrix[from][to] = 1;
        return this.ConvertLinksElement(element, mdString);
    }
}


export { WebObsidianBuilder };

