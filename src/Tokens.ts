enum Token {
    '$$',
    '$',
    '[[',
    '![[',
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

export { Token, MarkdownToken }
