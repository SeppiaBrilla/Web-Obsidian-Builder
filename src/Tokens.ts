
class Token{
    public Symbol:string;
    public Regex:RegExp;

    constructor(symbol:string, regex:RegExp){
        this.Symbol = symbol;
        this.Regex = regex;
    }
}

class MarkdownToken{
    public Value: string;
    public Position:number;
    constructor(value:string, position:number){
        this.Value = value;
        this.Position = position;
    }
}

export { MarkdownToken, Token}
