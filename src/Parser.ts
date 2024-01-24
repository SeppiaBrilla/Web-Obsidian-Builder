import { MarkdownElement } from './ObsidianElements';
import { MarkdownToken} from './Tokens';

const REGEX = "([a-zA-Z0-9\\n\\t \\[\\]\\^\\/,\\.\\*\\!\\@\\#\\%\\^\\&()\\{}_\\-=\\+`~;:'\"<>\\?\\|\\\\n\\t]+)";
const CHAR_TO_ESCAPE = ['\\','.','$','*','+','?','(',')','[','{,','|', ']', '-'];
const ALL_TOKENS = ['$$', '$', '[[', '![[', ']]', '```mermaid', '```', 'u'];

function addEscape(str:string){
    for (const char of CHAR_TO_ESCAPE){
        str = str.replaceAll(char,`\\${char}`);
    }
    return str;
}

function build_regex(open_token:string, close_token:string, all_tokens:Array<string>): RegExp{
    const open_tokens_to_remove_before = [];
    const open_tokens_to_remove_after = [];
    const close_tokens_to_remove_before = [];
    const close_tokens_to_remove_after = [];
    for(const token of all_tokens){
        if(isNaN(+token)){
            if(token.length > open_token.length){
                let removed_before = false;
                if(token.substring(token.length - open_token.length, token.length) == open_token){
                    const tokenToRemove = token.replace(open_token, '');
                    open_tokens_to_remove_before.push(addEscape(tokenToRemove));
                    removed_before = true;
                }
                if(token.substring(0, open_token.length) == open_token){
                    const tokenToRemove = token.replace(open_token, '');
                    if(!removed_before && tokenToRemove != open_tokens_to_remove_before[open_tokens_to_remove_before.length - 1])
                        open_tokens_to_remove_after.push(addEscape(tokenToRemove));
                }
            }
            if(token.length > close_token.length){
                let removed_after = false;
                if(token.substring(0, close_token.length) == close_token){
                    const tokenToRemove = token.replace(close_token, '');
                    close_tokens_to_remove_after.push(addEscape(tokenToRemove));
                    removed_after = true;
                }
                if(token.substring(token.length - close_token.length, token.length) == close_token){
                    const tokenToRemove = token.replace(close_token, '');
                    if(!removed_after && tokenToRemove != close_tokens_to_remove_after[close_tokens_to_remove_after.length - 1])
                        close_tokens_to_remove_before.push(addEscape(tokenToRemove));
                }
            }
        }
    }

    let final_regex = REGEX; 
    for(let i = 0; i < open_token.length; i++){
        if(!open_token[i].match(/[a-z]/))
            final_regex = final_regex.replace(addEscape(open_token[i]), '')
    }
    for(let i = 0; i < close_token.length; i++){
        if(!close_token[i].match(/[a-z]/))
            final_regex = final_regex.replace(addEscape(close_token[i]), '')
    }
    let before = open_tokens_to_remove_before.length > 0 ? `(?<!${open_tokens_to_remove_before.join("|")})` : "";
    let after = open_tokens_to_remove_after.length > 0? `(?!${open_tokens_to_remove_after.join("|")})` : "";
    open_token = `${before}${addEscape(open_token)}${after}`;
    before = close_tokens_to_remove_before.length > 0 ? `(?<!${close_tokens_to_remove_before.join("|")})` : "";
    after = close_tokens_to_remove_after.length > 0? `(?!${close_tokens_to_remove_after.join("|")})` : "";
    close_token = `${before}${addEscape(close_token)}${after}`;
    return RegExp(`${open_token}${final_regex}${close_token}`, "g");
}

function BuildElements(mdString:string, regexes: Array<{[index: string]: string | RegExp}>):Array<MarkdownElement>{
    
    const elements:Array<MarkdownElement> = [];
    for(const val of regexes){
        const token: string = <string>val['token'];
        const regex: RegExp = <RegExp>val['value'];
        const regex_results = [...mdString.matchAll(regex)];
        for(const result of regex_results){
            elements.push(new MarkdownElement(result[1], token));
        }
    }
    return elements;
}

function ToToken(str:string): string{

    for(let i = str.length; i > 0; i --){
        const tokenStr = str.substring(0, i);
        const idx = ALL_TOKENS.indexOf(tokenStr);
        if(idx != -1)
            return ALL_TOKENS[idx];
    }
    return 'u';
}

function Tokenize(mdString: string): Array<MarkdownToken>{
    const steps: Array<number> = [...new Set(ALL_TOKENS.map(v => v.length))];
    const maxStep: number = Math.max(...steps);
    const match: Array<MarkdownToken> = [];
    let i = 0;
    while(i <= mdString.length){
        if(mdString[i] === '\\')
            i += 2;
        const str: string = mdString.substring(i, Math.min(i+maxStep, mdString.length));
        const token: string = ToToken(str);
        if(token != 'u'){
            match.push(new MarkdownToken(token, i));
            i += token.length - 1;
        }
        i++;
    }
    return match;
}

const Closer = [']]', '$', '$$', '```']


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
        const t = tokens[i].Value;
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
                str = mdString.substring(token.Position + token.Value.length, tokens[i].Position);
                elements.push(new MarkdownElement(str, token.Value));
                opened[t] = undefined;
            break;
            case '$$':
                if(opened[t] === undefined){
                    opened[t] = tokens[i]
                    break;
                }
                str = mdString.substring((<MarkdownToken>opened['$$']).Position + 2, tokens[i].Position);
                elements.push(new MarkdownElement(str, '$$'));
                opened[t] = undefined;
            break;
            case '$':
                if(opened[t] === undefined){
                    opened[t] = tokens[i];
                    break;
                }
                str = mdString.substring((<MarkdownToken>opened['$']).Position + 1, tokens[i].Position);
                elements.push(new MarkdownElement(str, '$'));
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
                str = mdString.substring(token.Position + token.Value.length, tokens[i].Position);
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
