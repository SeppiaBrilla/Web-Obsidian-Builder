import {ObsidianLink, ObsidianlinkArray} from '../src/Links'
import {WebObsidianBuilder} from '../src/WebObsidianBuilder'

function remove(str:string):string {
    return str.replace(" ","");
}


describe('WebObsidianBuilder', () => {
    test('AddAndConvert', () => {
        const array = new ObsidianlinkArray([
            new ObsidianLink("name", "link"),
            new ObsidianLink("name2", "link2"),
            new ObsidianLink("link", "name"),
            new ObsidianLink("note", "new_note")
        ])
        const builder = new WebObsidianBuilder(array);
        const html = builder.AddAndConvert("note", "# Title \n ## Subtitle [[name]], ![[image]] $$e = mc^2$$ $i_{low}$ ```py print('hello')```");
        const graph = builder.GetGraph();
        expect(graph.Nodes.length).toEqual(4);
        expect(graph.GetEdgesFrom("note").length).toEqual(1);
        expect(graph.GetEdgesFrom("note")[0].To).toEqual("name");
        expect(remove(html)).toEqual(remove(RES));
    });
});


const RES = `<h1>Title</h1>
<h2>Subtitle <a href="link">name</a>
, <img src="image" alt="image">
 <span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>e</mi><mo>=</mo><mi>m</mi><msup><mi>c</mi><mn>2</mn></msup></mrow><annotation encoding="application/x-tex">e = mc^2</annotation></semantics></math></span><span class="katex-html ObsidianMath" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">e</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8641em;"></span><span class="mord mathnormal">m</span><span class="mord"><span class="mord mathnormal">c</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8641em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span></span></span></span></span> <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>i</mi><mrow><mi>l</mi><mi>o</mi><mi>w</mi></mrow></msub></mrow><annotation encoding="application/x-tex">i_{low}</annotation></semantics></math></span><span class="katex-html ObsidianMath" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8095em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">i</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.01968em;">l</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight" style="margin-right:0.02691em;">w</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> <code>py print(&#39;hello&#39;)</code></h2>
`;


