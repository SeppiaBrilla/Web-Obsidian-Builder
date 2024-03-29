import { Tokenize, BuildElements, } from '../src/Parser';
import { Token } from '../src/Tokens';

describe('Tokenize', () => {
    test('inline math', () => {
        const mdStr = '$123$';
        const tokens = Tokenize(mdStr);
        expect(tokens.length).toEqual(2);
        expect(tokens[0].Value).toEqual('$');
        expect(tokens[0].Position).toEqual(0);
        expect(tokens[1].Value).toEqual('$');
        expect(tokens[1].Position).toEqual(4);

    });
    
    test('display math', () => {
        const mdStr = '$$123$$';
        const tokens = Tokenize(mdStr);
        expect(tokens.length).toEqual(2);
        expect(tokens[0].Value).toEqual('$$');
        expect(tokens[0].Position).toEqual(0);
        expect(tokens[1].Value).toEqual('$$');
        expect(tokens[1].Position).toEqual(5);
    });
    
    test('normal link', () => {
        const mdStr = '[[123]]';
        const tokens = Tokenize(mdStr);
        expect(tokens.length).toEqual(2);
        expect(tokens[0].Value).toEqual('[[');
        expect(tokens[0].Position).toEqual(0);
        expect(tokens[1].Value).toEqual(']]');
        expect(tokens[1].Position).toEqual(5);
    });
    
    test('image link', () => {
        const mdStr = '![[123]]';
        const tokens = Tokenize(mdStr);
        expect(tokens.length).toEqual(2);
        expect(tokens[0].Value).toEqual('![[');
        expect(tokens[0].Position).toEqual(0);
        expect(tokens[1].Value).toEqual(']]');
        expect(tokens[1].Position).toEqual(6);
    });

    test('mermaid', () => {
        const mdStr = '```mermaid mermaid text ```';
        const tokens = Tokenize(mdStr);
        expect(tokens.length).toEqual(2);
        expect(tokens[0].Value).toEqual('```mermaid');
        expect(tokens[0].Position).toEqual(0);
        expect(tokens[1].Value).toEqual('```');
        expect(tokens[1].Position).toEqual(24);
    });

    test('normal insert', () => {
        const mdStr = '```py test() ```';
        const tokens = Tokenize(mdStr);
        expect(tokens.length).toEqual(2);
        expect(tokens[0].Value).toEqual('```');
        expect(tokens[0].Position).toEqual(0);
        expect(tokens[1].Value).toEqual('```');
        expect(tokens[1].Position).toEqual(13);
    });

    test('multiple tokes', () => {
        const mdStr = '[[123]] $$math$$ $inline$ ```mermaid m ```';
        const tokens = Tokenize(mdStr);
        expect(tokens.length).toEqual(8);
        expect(tokens[0].Value).toEqual('[[');
        expect(tokens[0].Position).toEqual(0);
        expect(tokens[1].Value).toEqual(']]');
        expect(tokens[1].Position).toEqual(5);
        expect(tokens[2].Value).toEqual('$$');
        expect(tokens[2].Position).toEqual(8);
        expect(tokens[3].Value).toEqual('$$');
        expect(tokens[3].Position).toEqual(14);
        expect(tokens[4].Value).toEqual('$');
        expect(tokens[4].Position).toEqual(17);
        expect(tokens[5].Value).toEqual('$');
        expect(tokens[5].Position).toEqual(24);
        expect(tokens[6].Value).toEqual('```mermaid');
        expect(tokens[6].Position).toEqual(26);
        expect(tokens[7].Value).toEqual('```');
        expect(tokens[7].Position).toEqual(39);
    });

    test('escape sequence', () => {
        const mdStr = '$123 \\$ \\$ 123$';
        const tokens = Tokenize(mdStr);

        expect(tokens.length).toEqual(2);
        expect(tokens[0].Value).toEqual('$');
        expect(tokens[0].Position).toEqual(0);
        expect(tokens[1].Value).toEqual('$');
        expect(tokens[1].Position).toEqual(14);
    });
});

const mdString = '$$math$$ [[link]] ```mermaid m ``` $\\phi$ $$double math$$ ```py code ``` ![[image]]';

describe('BuildElements', () => {
    test('find elements', () =>{
        const regexes = [
            new Token('![[', /!\[\[([a-zA-Z0-9\n\t \^\/,\.\*\\@\#\%\^\&()\{}_\-=\+`~;:'"<>\?\|\\n\t]+)\]\]/g),
            new Token('[[', /(?<!!)\[\[([a-zA-Z0-9\n\t \^\/,\.\*\!\@\#\%\^\&()\{}_\-=\+`~;:'"<>\?\|\\n\t]+)\]\]/g),
            new Token('$$', /\$\$([a-zA-Z0-9\n\t \[\]\^\/,\.\*\!\@\#\%\^\&()\{}_\-=\+`~;:'"<>\?\|\\n\t]+)\$\$/g),
            new Token('$', /(?<!\$)\$([a-zA-Z0-9\n\t \[\]\^\/,\.\*\!\@\#\%\^\&()\{}_\-=\+`~;:'"<>\?\|\\n\t]+)\$(?!\$)/g),
            new Token('```mermaid', /```mermaid([a-zA-Z0-9\n\t \[\]\^\/,\.\*\!\@\#\%\^\&()\{}_\-=\+~;:'"<>\?\|\\n\t]+)```(?!mermaid)/g),
            new Token('```', /```(?!mermaid)([a-zA-Z0-9\n\t \[\]\^\/,\.\*\!\@\#\%\^\&()\{}_\-=\+~;:'"<>\?\|\\n\t]+)```(?!mermaid)/g)
        ];
        let elements = BuildElements(mdString, regexes);
        expect(elements.length).toEqual(7);
            expect(elements[0].Value).toEqual("image");
        expect(elements[0].Type).toEqual('![[');

        expect(elements[1].Value).toEqual("link");
        expect(elements[1].Type).toEqual('[[');

        expect(elements[2].Value).toEqual("math");
        expect(elements[2].Type).toEqual('$$');

        expect(elements[3].Value).toEqual("double math");
        expect(elements[3].Type).toEqual('$$');

        expect(elements[4].Value).toEqual("\\phi");
        expect(elements[4].Type).toEqual('$');

        expect(elements[5].Value).toEqual(" m ");
        expect(elements[5].Type).toEqual('```mermaid');

        expect(elements[6].Value).toEqual("py code ");
        expect(elements[6].Type).toEqual('```');

        elements = BuildElements(`$$
\\begin{align}
\\frac{\\partial L}{\\partial \\Theta_{k -1}} &= \\frac{\\partial L}{\\partial f_k} \\frac{\\partial f_k}{\\partial \\Theta_{k - 1}}\\
\\frac{\\partial L}{\\partial \\Theta_{k -2}} &= \\frac{\\partial L}{\\partial f_k} \\frac{\\partial f_k}{\\partial f_{k-1}} \\frac{\\partial f_{k-1}}{\\partial \\Theta_{k-2}}\\
\\frac{\\partial L}{\\partial \\Theta_{k -3}} &= \\frac{\\partial L}{\\partial f_k} \\frac{\\partial f_k}{\\partial f_{k-1}} \\frac{\\partial f_{k-1}}{\\partial f_{k-2}}\\frac{\\partial f_{k-2}}{\\partial \\Theta_{k-3}}\\
&\\dots
\\end{align}
$$`, regexes);
        expect(elements.length).toEqual(1);
        expect(elements[0].Type).toEqual('$$');
    });
});
