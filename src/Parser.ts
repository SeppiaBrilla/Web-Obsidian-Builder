import { marked } from 'marked';
import { ObsidianlinkArray } from './links';
import { randomUUID } from "crypto";
import { MathElement, FindIndiced, MarkdownElement, GetElements } from './utils';


class Parser{

    private Links : ObsidianlinkArray;
    private MathElements: Array<MathElement> = [];
    
    constructor(links: ObsidianlinkArray){
        this.Links = links
    }

    public Convert(mdString:string): string {
        const mathless = this.GetMath(mdString);
        const correctLinks = this.RecreateLinks(mathless); 
        const htmlMd = marked.parse(correctLinks);
        return this.Rebuild(htmlMd);
    }

    private Rebuild(str: string): string {
        let finalStr = str;
        for(let mathElem of this.MathElements){
            finalStr = finalStr.replace(mathElem.Id, mathElem.Value)
        }
        return finalStr;
    }

    private RecreateLinks(mdString:string): string{
        const links = this.Links.toDict();
        let recreated = mdString;
        const openLinkindices: Array<number> = FindIndiced(mdString, '[[');
        const closeLinkindices: Array<number> = FindIndiced(mdString, ']]');
        const linkElements: Array<MarkdownElement> = GetElements(openLinkindices, closeLinkindices);
        for(let elem of linkElements){
            const currentLink:string = mdString.substring(elem.Start + 2, elem.Finish);
            recreated = recreated.replace(`[[${currentLink}]]`, `[${currentLink}](${links[currentLink]})`); 
        }
        return recreated;       
    }

    private GetMath(mdString: string): string {
        let mathless: string = mdString;
        const mathDisplayIndeces: Array<number> = FindIndiced(mdString, '$$');
        const startDisplayIndices: Array<number> = mathDisplayIndeces.filter((_, i) => {return i%2 == 0});
        const finishDisplayIndices: Array<number> = mathDisplayIndeces.filter((_, i) => {return i%2 == 1});
        const displayElements: Array<MarkdownElement> = GetElements(startDisplayIndices, finishDisplayIndices);
        let mathElements: Array<MathElement> = []
        for(let elem of displayElements){
            const id: string = randomUUID();
            const currentMath:string = mdString.substring(elem.Start + 2, elem.Finish);
            mathless = mathless.replace(`$$${currentMath}$$`, id);
            mathElements.push(new MathElement(currentMath, id, true));
        }
        const mathInlineIndeces: Array<number> = FindIndiced(mathless, '$');
        const startInlineIndices: Array<number> = mathInlineIndeces.filter((_, i) => {return i%2 == 0});
        const finishInlineIndices: Array<number> = mathInlineIndeces.filter((_, i) => {return i%2 == 1});
        let InlineElements: Array<MarkdownElement> = GetElements(startInlineIndices, finishInlineIndices);
        for(let elem of InlineElements){
            const id: string = randomUUID();
            const currentMath:string = mdString.substring(elem.Start + 1, elem.Finish);
            mathless = mathless.replace(`$${currentMath}$`, id);
            mathElements.push(new MathElement(currentMath, id, false));
        }
        this.MathElements = mathElements;
        return mathless;
    } 

    
}



export { Parser };
