import { link } from 'fs';
import { Parser } from './Parser';
import { ObsidianlinkArray } from './links';
import { MarkdownElement, FindIndiced, GetElements } from './utils';

class WebObsidian{
    
    Links:ObsidianlinkArray;
    Parser:Parser;
    AdiacentMatrix:number[][];
    NoteNames:Array<string>;

    constructor(links:ObsidianlinkArray){
        this.Links = links;
        this.Parser = new Parser(links);
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
        const openLinkindices: Array<number> = FindIndiced(noteText, '[[');
        const closeLinkindices: Array<number> = FindIndiced(noteText, ']]');
        const linkElements: Array<MarkdownElement> = GetElements(openLinkindices, closeLinkindices);
        for(let elem of linkElements){
            const currentLink:string = noteText.substring(elem.Start + 2, elem.Finish);
            const to = this.NoteNames.indexOf(currentLink);
            this.AdiacentMatrix[from][to] = 1;
        }
        return this.Parser.Convert(noteText);
    }

    Convert(noteText:string){
        return this.Parser.Convert(noteText)
    }

    GetGraph(){
        return this.AdiacentMatrix;
    }
}


export { WebObsidian };

