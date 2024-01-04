import { MarkdownElement } from './ObsidianElements';
import { Token, MarkdownToken} from './Tokens';

const REGEX = "([a-zA-Z0-9 \\^\\/,\\.\\*\\!\\@\\#\\%\\^\\&()\\{}_\\-=\\+`~;:'\"<>\\?\\|\\\\n\\t]+)";
const CHAR_TO_ESCAPE = ['\\','.','$','*','+','?','(',')','[','{,','|', ']', '-']

function addEscape(str:string){
for (const char of CHAR_TO_ESCAPE){
        str = str.replaceAll(char,`\\${char}`);
    }
    return str;
}

function build_regex(open_token:Token, close_token:Token): RegExp{
    let open_token_str: string = Token[open_token];
    let close_token_str: string = Token[close_token];
    const open_tokens_to_remove_before = [];
    const open_tokens_to_remove_after = [];
    const close_tokens_to_remove_before = [];
    const close_tokens_to_remove_after = [];
    for(const token of Object.keys(Token)){
        if(isNaN(+token)){
            if(token.length > open_token_str.length){
                let removed_before = false;
                if(token.substring(token.length - open_token_str.length, token.length) == open_token_str){
                    const tokenToRemove = token.replace(open_token_str, '');
                    open_tokens_to_remove_before.push(addEscape(tokenToRemove));
                    removed_before = true;
                }
                if(token.substring(0, open_token_str.length) == open_token_str){
                    const tokenToRemove = token.replace(open_token_str, '');
                    if(!removed_before && tokenToRemove != open_tokens_to_remove_before[open_tokens_to_remove_before.length - 1])
                        open_tokens_to_remove_after.push(addEscape(tokenToRemove));
                }
            }
            if(token.length > close_token_str.length){
                let removed_after = false;
                if(token.substring(0, close_token_str.length) == close_token_str){
                    const tokenToRemove = token.replace(close_token_str, '');
                    close_tokens_to_remove_after.push(addEscape(tokenToRemove));
                    removed_after = true;
                }
                if(token.substring(token.length - close_token_str.length, token.length) == close_token_str){
                    const tokenToRemove = token.replace(close_token_str, '');
                    if(!removed_after && tokenToRemove != close_tokens_to_remove_after[close_tokens_to_remove_after.length - 1])
                        close_tokens_to_remove_before.push(addEscape(tokenToRemove));
                }
            }
        }
    }
    let before = open_tokens_to_remove_before.length > 0 ? `(?<!${open_tokens_to_remove_before.join("|")})` : "";
    let after = open_tokens_to_remove_after.length > 0? `(?!${open_tokens_to_remove_after.join("|")})` : "";
    open_token_str = `${before}${addEscape(open_token_str)}${after}`;
    before = close_tokens_to_remove_before.length > 0 ? `(?<!${close_tokens_to_remove_before.join("|")})` : "";
    after = close_tokens_to_remove_after.length > 0? `(?!${close_tokens_to_remove_after.join("|")})` : "";
    close_token_str = `${before}${addEscape(close_token_str)}${after}`;
    return RegExp(`${open_token_str}${REGEX}${close_token_str}`, "g");
}

function BuildElements(mdString:string):Array<MarkdownElement>{
    const regexes: Array<{[index: string]: Token | RegExp}> = [
        {'token':Token['![['], 'value':build_regex(Token['![['], Token[']]'])},
        {'token':Token['[['], 'value':build_regex(Token['[['], Token[']]'])},
        {'token':Token.$$, 'value':build_regex(Token['$$'], Token['$$'])},
        {'token':Token.$, 'value':build_regex(Token['$'], Token['$'])},
        {'token':Token['```mermaid'], 'value':build_regex(Token['```mermaid'], Token['```'])},
        {'token':Token['```'], 'value':build_regex(Token['```'], Token['```'])},
    ];
    const elements:Array<MarkdownElement> = [];
    for(const val of regexes){
        const token: Token = <Token>val['token'];
        const regex: RegExp = <RegExp>val['value'];
        const regex_results = [...mdString.matchAll(regex)];
        for(const result of regex_results){
            elements.push(new MarkdownElement(result[1], token));
        }
    }
    return elements;
}

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


function old_BuildElements(tokens: Array<MarkdownToken>, mdString:string): Array<MarkdownElement>{
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

export { Tokenize, old_BuildElements, BuildElements, build_regex };
