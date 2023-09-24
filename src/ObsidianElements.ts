import { marked } from 'marked';
import { Token } from './Tokens';
const katex = require('katex');
 
interface Element{
    Value:string;
    Id:string;
}

const MathClass = "WebObsidianMath InlineMath";

class MathElement implements Element{
    public Value: string;
    public Id: string;

    constructor(value: string, id: string, display:boolean){
        this.Value = katex.renderToString(
            value, 
            {
                "displayMode":display,
                "output":"htmlAndMathml",
                "throwOnError": false
            }).replace('aria-hidden="true"',`aria-hidden="true" class:"${MathClass}"`);
        if(!display)
            this.Value = this.Value.replace('display="block"','');
        this.Id = id;
    }
}

class LinkElement implements Element{
    public Value: string;
    public Id: string;

    constructor(value: string, id: string, link:string){
        this.Value = marked.parse(`[${value}](${link})`).replace('<p>','').replace('</p>','');
        this.Id = id;
    }

}

class VisualLinkElement implements Element{
    public Value: string;
    public Id: string;

    constructor(value: string, id: string, link:string){
        this.Value = marked.parse(`![${value}](${link})`).replace('<p>','').replace('</p>','');
        this.Id = id;
    }

}

class MermaidElement implements Element{
    public Value: string;
    public Id: string;

    constructor(value: string, id: string){
        this.Value = `<pre class="mermaid">
${value}
</pre>`;
        this.Id = id;
    }
}



class MarkdownElement{
    public Value: string;
    public Type: Token;

    constructor(value:string, type:Token){
        this.Value = value;
        this.Type = type;
    };
}



export { MathElement, Element, LinkElement, VisualLinkElement, MermaidElement, MarkdownElement, MathClass}