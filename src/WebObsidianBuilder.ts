import { ObsidianlinkArray } from './Links';
import { Token } from './Tokens';
import { Graph } from './Graph';
import { MarkdownElement, MathElement, Element, LinkElement, MermaidElement, VisualLinkElement, MathClass} from './ObsidianElements';
import { BuildElements, build_regex} from './Parser';
import { randomUUID } from "crypto";
import { marked } from 'marked';

class WebObsidianBuilder{

	private Links:ObsidianlinkArray;
	private LinksDict: {[id:string]: string};
	private NotInGraphLinksDict: {[id:string]: string};
	private AdiacentMatrix:number[][];
	private NoteNames:Array<string>;
	private Tokens: Array<Token>;
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

		const all_tokens = ['$$', '$', '[[', '![[', ']]', '```mermaid', '```', 'u']

		this.Tokens = [
            new Token('![[', build_regex('![[', ']]', all_tokens)),
            new Token('[[', build_regex('[[', ']]', all_tokens)),
            new Token('$$', build_regex('$$', '$$', all_tokens)),
            new Token('$', build_regex('$', '$', all_tokens)),
            new Token('```mermaid', build_regex('```mermaid', '```', all_tokens)),
            new Token('```', build_regex('```', '```', all_tokens)),
		];

        this.NoteNames = links.GetNames();
    }

	AddToken(token:Token): void{
        this.Tokens.push(token)
	}
    
	CreateAndAddToken(openSymbol:string, closeSymbol:string): void{
        const allTokens = []
		for(let i = 0; i < this.Tokens.length; i++)
            allTokens.push(this.Tokens[i].Symbol)
		this.AddToken(new Token(openSymbol, build_regex(openSymbol, closeSymbol, allTokens)));
	}

    PopToken(symbol:string):Token | undefined{
        const idx = this.Tokens.findIndex( x=> x.Symbol == symbol);
        if(idx < -1)
            return undefined
        const el = this.Tokens[idx];
        this.Tokens.splice(idx, 1);
        return el;
    }

	AddAndConvert(noteName:string, noteText:string): string{
        const from = this.NoteNames.indexOf(noteName);
        const elements = BuildElements(noteText, this.Tokens);

		noteText = this.RemoveElementAndConvert(noteText, elements, from);
        return this.Rebuild(noteText);
	}

	Convert(noteText:string): string{
        const elements = BuildElements(noteText, this.Tokens);

        noteText = this.RemoveElementAndConvert(noteText, elements);
        return this.Rebuild(noteText);
	}

	GetGraph(): Graph{
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

	private RemoveElementAndConvert(noteText:string, elements:Array<MarkdownElement>, noteIndex:number|undefined = undefined): string{
        const convertOnly: boolean = noteIndex === undefined;
		for(const element of elements){
            if(element.Type === 'u')
                throw new Error("undefined element found");
			switch(element.Type){
                case '$$':
                    noteText = this.ConvertDisplayMathElement(element, noteText);
                    this.Mathcss = true;
					break;
				case '$':
					noteText = this.ConvertInlineMathElement(element, noteText);
					this.Mathcss = true;
					break;
				case '![[':
				case '[[':
					if(convertOnly){
                        noteText = this.ConvertLinksElement(element, noteText);
                        break;
                    }
					noteText = this.BuildGraphAndConvert(element, noteText, (<number>noteIndex));
					break;
				case '```mermaid':
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
		if(element.Type === '[['){
            this.Elements.push(new LinkElement(currentLink, id, link));
            return mdString.replace(`[[${element.Value}]]`, id); 
		}
		this.Elements.push(new VisualLinkElement(currentLink, id, link));
		return mdString.replace(`![[${element.Value}]]`, id); 
	}

	private ConvertMermaidElement(element:MarkdownElement, mdString:string): string{
        const id:string = randomUUID();
        const currentMermaid:string = element.Value;
		this.Elements.push(new MermaidElement(currentMermaid, id));
		return mdString.replace(`\`\`\`mermaid${currentMermaid}\`\`\``,id);
	}

	private BuildGraphAndConvert(element:MarkdownElement, mdString:string, from:number): string{
		const currentLink:string = element.Value;
		const to = this.NoteNames.indexOf(currentLink);
		if(to >= 0)
            this.AdiacentMatrix[from][to] = 1;
		return this.ConvertLinksElement(element, mdString);
	}
}


export { WebObsidianBuilder };

