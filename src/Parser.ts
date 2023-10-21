import { MarkdownElement } from './ObsidianElements';
import { Token, MarkdownToken} from './Tokens';

function ToToken(str:string): Token{

    for(let i = str.length; i > 0; i --){
        const tokenStr = str.substring(0, i);
         if(!isNaN(+tokenStr))
            return Token.u
        /* eslint-disable */
        const t: Token | undefined = (<any>Token)[tokenStr];
        /* eslint-enable */
        if(t !== undefined)
            return t
    }
    return Token.u;
}

function Tokenize(mdString: string): Array<MarkdownToken>{
    const steps: Array<number> = [...new Set(Object.keys(Token).map(v => v.length))];
    const maxStep: number = Math.max(...steps);
    const match: Array<MarkdownToken> = [];
    let i = 0;
    while(i <= mdString.length){
        if(mdString[i] === '\\')
            i += 2;
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

const Closer = [Token[']]'], Token.$, Token.$$, Token['```']]


function BuildElements(tokens: Array<MarkdownToken>, mdString:string): Array<MarkdownElement>{
    const opened: { [id: string] : MarkdownToken|undefined; } = {};
    const elements: Array<MarkdownElement> = [];
    tokens.sort((a:MarkdownToken, b:MarkdownToken) => {
        return a.Position > b.Position ? 1:-1;
    });
    for(const t of Closer){
        opened[t.toString()] = undefined;
    }
    for(let i = 0; i < tokens.length; i++){
        const t = Token[tokens[i].Value];
        const token = (<MarkdownToken>opened[t]);
        let str: string = "";
        switch(t){
            case '![[':
            case '[[':
                if(opened[']]'] !== undefined)
                    throw new Error(`Wrong markdown file format: unexpected token ${t}`);
                opened[']]'] = tokens[i];
            break;
            case ']]':
                if(opened[t] === undefined)
                    throw new Error(`Wrong markdown file format: unexpected token ${t}`);
                str = mdString.substring(token.Position + Token[token.Value].length, tokens[i].Position);
                elements.push(new MarkdownElement(str, token.Value));
                opened[t] = undefined;
            break;
            case '$$':
                if(opened[t] === undefined){
                    opened[t] = tokens[i]
                    break;
                }
                str = mdString.substring((<MarkdownToken>opened['$$']).Position + 2, tokens[i].Position);
                elements.push(new MarkdownElement(str, Token.$$));
                opened[t] = undefined;
            break;
            case '$':
                if(opened[t] === undefined){
                    opened[t] = tokens[i];
                    break;
                }
                str = mdString.substring((<MarkdownToken>opened['$']).Position + 1, tokens[i].Position);
                elements.push(new MarkdownElement(str, Token.$));
                opened[t] = undefined;
            break;
            case '```mermaid':
                if(opened['```'] !== undefined)
                    throw new Error(`Wrong markdown file format: unexpected token ${t}`);
                opened['```'] = tokens[i];
            break;
            case '```':
                if(opened[t] === undefined){
                    opened[t] = tokens[i];
                    break;
                }
                str = mdString.substring(token.Position + Token[token.Value].length, tokens[i].Position);
                elements.push(new MarkdownElement(str, (<MarkdownToken>opened[t]).Value));
                opened[t] = undefined;
            break;
            default:
                throw new Error(`invalid token ${t}`);
        }
    }
    return elements;
}

export { Tokenize, BuildElements };
