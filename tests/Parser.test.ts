import { Tokenize, BuildElements } from '../src/Parser';
import { MarkdownToken, Token } from '../src/Tokens';

describe('Tokenize', () => {
    test('inline math', () => {
        const mdStr = '$123$';
        const tokens = Tokenize(mdStr);
        expect(tokens.length).toEqual(2);
        expect(tokens[0].Value).toEqual(Token.$);
        expect(tokens[0].Position).toEqual(0);
        expect(tokens[1].Value).toEqual(Token.$);
        expect(tokens[1].Position).toEqual(4);

    });
    
    test('display math', () => {
        const mdStr = '$$123$$';
        const tokens = Tokenize(mdStr);
        expect(tokens.length).toEqual(2);
        expect(tokens[0].Value).toEqual(Token.$$);
        expect(tokens[0].Position).toEqual(0);
        expect(tokens[1].Value).toEqual(Token.$$);
        expect(tokens[1].Position).toEqual(5);
    });
    
    test('normal link', () => {
        const mdStr = '[[123]]';
        const tokens = Tokenize(mdStr);
        expect(tokens.length).toEqual(2);
        expect(tokens[0].Value).toEqual(Token['[[']);
        expect(tokens[0].Position).toEqual(0);
        expect(tokens[1].Value).toEqual(Token[']]']);
        expect(tokens[1].Position).toEqual(5);
    });
    
    test('image link', () => {
        const mdStr = '![[123]]';
        const tokens = Tokenize(mdStr);
        expect(tokens.length).toEqual(2);
        expect(tokens[0].Value).toEqual(Token['![[']);
        expect(tokens[0].Position).toEqual(0);
        expect(tokens[1].Value).toEqual(Token[']]']);
        expect(tokens[1].Position).toEqual(6);
    });

    test('mermaid', () => {
        const mdStr = '```mermaid mermaid text ```';
        const tokens = Tokenize(mdStr);
        expect(tokens.length).toEqual(2);
        expect(tokens[0].Value).toEqual(Token['```mermaid']);
        expect(tokens[0].Position).toEqual(0);
        expect(tokens[1].Value).toEqual(Token['```']);
        expect(tokens[1].Position).toEqual(24);
    });

    test('normal insert', () => {
        const mdStr = '```py test() ```';
        const tokens = Tokenize(mdStr);
        expect(tokens.length).toEqual(2);
        expect(tokens[0].Value).toEqual(Token['```']);
        expect(tokens[0].Position).toEqual(0);
        expect(tokens[1].Value).toEqual(Token['```']);
        expect(tokens[1].Position).toEqual(13);
    });

    test('multiple tokes', () => {
        const mdStr = '[[123]] $$math$$ $inline$ ```mermaid m ```';
        const tokens = Tokenize(mdStr);
        expect(tokens.length).toEqual(8);
        expect(tokens[0].Value).toEqual(Token['[[']);
        expect(tokens[0].Position).toEqual(0);
        expect(tokens[1].Value).toEqual(Token[']]']);
        expect(tokens[1].Position).toEqual(5);
        expect(tokens[2].Value).toEqual(Token['$$']);
        expect(tokens[2].Position).toEqual(8);
        expect(tokens[3].Value).toEqual(Token['$$']);
        expect(tokens[3].Position).toEqual(14);
        expect(tokens[4].Value).toEqual(Token['$']);
        expect(tokens[4].Position).toEqual(17);
        expect(tokens[5].Value).toEqual(Token['$']);
        expect(tokens[5].Position).toEqual(24);
        expect(tokens[6].Value).toEqual(Token['```mermaid']);
        expect(tokens[6].Position).toEqual(26);
        expect(tokens[7].Value).toEqual(Token['```']);
        expect(tokens[7].Position).toEqual(39);
    });

    test('escape sequence', () => {
        const mdStr = '$123 \\$ \\$ 123$';
        const tokens = Tokenize(mdStr);

        expect(tokens.length).toEqual(2);
        expect(tokens[0].Value).toEqual(Token['$']);
        expect(tokens[0].Position).toEqual(0);
        expect(tokens[1].Value).toEqual(Token['$']);
        expect(tokens[1].Position).toEqual(14);
    });
});

const mdString = '$$math$$ [[link]] ```mermaid m ``` $inline$ $$double math$$ ```py code ``` ![[image]]';
const tokens = [
        new MarkdownToken( 0, 0),
        new MarkdownToken( 0, 6),
        new MarkdownToken( 2, 9),
        new MarkdownToken( 4, 15),
        new MarkdownToken( 5, 18),
        new MarkdownToken( 6, 31),
        new MarkdownToken( 1, 35),
        new MarkdownToken( 1, 42),
        new MarkdownToken( 0, 44),
        new MarkdownToken( 0, 57),
        new MarkdownToken( 6, 60),
        new MarkdownToken( 6, 71),
        new MarkdownToken( 3, 75),
        new MarkdownToken( 4, 83)
      ]

describe('BuildElements', () => {
    test('find elements', () =>{
        const elements = BuildElements(tokens, mdString);

        expect(elements.length).toEqual(7);
        expect(elements[0].Value).toEqual("math");
        expect(elements[0].Type).toEqual(Token.$$);

        expect(elements[1].Value).toEqual("link");
        expect(elements[1].Type).toEqual(Token['[[']);

        expect(elements[2].Value).toEqual(" m ");
        expect(elements[2].Type).toEqual(Token['```mermaid']);

        expect(elements[3].Value).toEqual("inline");
        expect(elements[3].Type).toEqual(Token.$);

        expect(elements[4].Value).toEqual("double math");
        expect(elements[4].Type).toEqual(Token.$$);

        expect(elements[5].Value).toEqual("py code ");
        expect(elements[5].Type).toEqual(Token['```']);

        expect(elements[6].Value).toEqual("image");
        expect(elements[6].Type).toEqual(Token['![[']);
    });
});
