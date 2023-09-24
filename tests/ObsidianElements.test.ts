import { MathElement, LinkElement, VisualLinkElement, MermaidElement} from '../src/ObsidianElements';

describe('MathElement', () => {
    test('Convert', () => {
        const text = "e = m \\times c^2";
        const math = new MathElement(text, "123", true);
        expect(math.Value).not.toBe(text);
    });
    test('Inline', () =>{
        const text = "e = m \\times c^2";
        const math = new MathElement(text, "123", false);
        expect(math.Value.includes('display:"block"')).toBe(false);
    });
});

describe('LinkElement', () => {
    test('Convert', () => {
        const link = new LinkElement("value", "123", "link");
        expect(link.Value.replace(/\s/g, '')).toEqual('<a href="link">value</a>'.replace(/\s/g, ''));
    });
});

describe('VisualLinkElement', () => {
    test('Convert', () => {
        const link = new VisualLinkElement("value", "123", "link");
        expect(link.Value.replace(/\s/g, '')).toEqual('<img src="link" alt="value">'.replace(/\s/g, ''));
    });
});

describe('MermaidElement', () => {
    test('Convert', () => {
        const value = `graph TD 
A[a] --> B[b]`;
        const mermaid = new MermaidElement(value, "123");
        expect(mermaid.Value).toEqual(`<pre class="mermaid">
${value}
</pre>`);
    });
});


