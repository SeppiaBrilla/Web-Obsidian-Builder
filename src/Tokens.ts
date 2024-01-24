
class MarkdownToken{
    public Value: string;
    public Position:number;
    constructor(value:string, position:number){
        this.Value = value;
        this.Position = position;
    }
}

export { MarkdownToken }
