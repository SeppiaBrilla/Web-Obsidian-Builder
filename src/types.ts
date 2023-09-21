import { marked } from 'marked';
const katex = require('katex');

interface Element{
    Value:string;
    Id:string;
}

class MathElement implements Element{
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

class LinkElement implements Element{
    public Value: string;
    public Id: string;

    constructor(value: string, id: string, link:string){
        this.Value = marked.parse(`[${value}](${link})`).replace('<p>','').replace('<\\p>','');
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

enum Token{
    '$$',
    '$',
    '[[',
    ']]',
    '```mermaid',
    '```',
    'u'
}

class MarkdownToken{
    public Value: Token;
    public Position:number;
    constructor(value:Token, position:number){
        this.Value = value;
        this.Position = position;
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

class Edge{
    public From:string;
    public To:string;

    constructor(from:string, to:string){
        this.From = from;
        this.To = to;
    }
}

export { MathElement, Element, LinkElement, MermaidElement, Token, MarkdownToken, MarkdownElement, Edge }
