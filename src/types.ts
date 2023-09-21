const katex = require('katex');

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
    public Start: number;
    public Finish: number;
    public Value: string;
    public Type: Token;

    constructor(start:number, finish:number, value:string, type:Token){
        this.Start = start;
        this.Finish = finish;
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

export { MathElement, Token, MarkdownToken, MarkdownElement, Edge }
