import { MarkdownElement, Token, MarkdownToken } from './types';


function ToToken(str:string): Token{

    for(let i = str.length; i > 0; i --){
        const tokenStr = str.substring(0, i);
         if(!isNaN(+tokenStr)){
            return Token.u
        }
        const t: Token | undefined = (<any>Token)[tokenStr];
        if(t !== undefined){
            return t
        }
    }
    return Token.u;
}

function Tokenize(mdString: string): Array<MarkdownToken>{
    const steps: Array<number> = [...new Set(Object.keys(Token).map(v => v.length))];
    const maxStep: number = Math.max(...steps);
    let match: Array<MarkdownToken> = [];
    let i = 0;
    while(i <=mdString.length){
        const str: string = mdString.substring(i, Math.min(i+maxStep, mdString.length));
        const token: Token = ToToken(str);
        if(token != Token.u){
            match.push(new MarkdownToken(token, i));
            i += Token[token].length - 1;
        }
        i++;
    }
    return match;
}

const Opener = [Token['[['], Token.$, Token.$$, Token['```'], Token['```mermaid']]


function BuildElements(tokens: Array<MarkdownToken>, mdString:string): Array<MarkdownElement>{
    const opened: { [id: string] : MarkdownToken|undefined; } = {};
    let elements: Array<MarkdownElement> = [];

    for(let t of Opener){
        opened[t.toString()] = undefined;
    }
    for(let i = 0; i < tokens.length; i++){
        const t = Token[tokens[i].Value];
        switch(t){
            case '[[':
                if(opened[t] !== undefined){
                    throw new Error(`Wrong markdown file format: unexpected token ${t}`);
                }
                opened[t] = tokens[i];
            break;
            case ']]':
                if(opened['[['] === undefined){
                    throw new Error(`Wrong markdown file format: unexpected token ${t}`);
                }
                const str = mdString.substring((<MarkdownToken>opened['[[']).Position + 2, tokens[i].Position);
                elements.push(new MarkdownElement((<MarkdownToken>opened['[[']).Position, tokens[i].Position, str, Token['[[']));
                opened[t] = undefined;
            break;
            case '$$':
                if(opened[t] !== undefined){
                    const str = mdString.substring((<MarkdownToken>opened['$$']).Position + 2, tokens[i].Position);
                    elements.push(new MarkdownElement((<MarkdownToken>opened[t]).Position, tokens[i].Position, str, Token.$$));
                }else{
                    opened[t] = tokens[i];
                }
            break;
            case '$':
                if(opened[t] !== undefined){
                    const str = mdString.substring((<MarkdownToken>opened['$']).Position + 1, tokens[i].Position);
                    elements.push(new MarkdownElement((<MarkdownToken>opened[t]).Position, tokens[i].Position, str, Token.$));

                }else{
                    opened[t] = tokens[i];
                }
            break;
            case '```mermaid':
                if(opened[t] !== undefined){
                    throw new Error(`Wrong markdown file format: unexpected token ${t}`);
                }
                opened[t] = tokens[i];
            break;
            case '```':
                if(opened[t] === undefined && opened[Token['```mermaid'].toString()] === undefined){
                    opened[t] = tokens[i];
                }else if(opened[t] === undefined){
                    const str = mdString.substring((<MarkdownToken>opened['```mermaid']).Position + 10, tokens[i].Position);
                    elements.push(new MarkdownElement((<MarkdownToken>opened[Token['```mermaid']]).Position, tokens[i].Position, str, Token['```mermaid']));
                    opened[Token['```mermaid']] = undefined;
                }else if(opened[Token['```mermaid'].toString()] === undefined){
                    const str = mdString.substring((<MarkdownToken>opened['```']).Position + 3, tokens[i].Position);
                    elements.push(new MarkdownElement((<MarkdownToken>opened[t]).Position, tokens[i].Position, str, Token['```']));
                    opened[Token['```']] = undefined;
                }
            break;
            default:
                throw new Error(`invalid token ${t}`);
        }
    }
    return elements;

}

export { Tokenize, BuildElements };
