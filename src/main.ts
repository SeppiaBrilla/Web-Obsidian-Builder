import { Parser } from './Parser';
import { writeFileSync } from 'fs'

const text = `It is a non-linear [[Image filters]] that deals with Gaussian noise without blurring the image like [[Mean filter]] and [[Gaussian filter]]. The formula of a bilateral filter is: $$ \\begin{align} &O(p) = \\sum_{q \\in S} H(p,q) *I_q\\ &H(p,q) = \\frac{1}{W(p)}G_{\\sigma_s}(d_s(p,q))G_{\\sigma_r}(d_r(p,q))\\\\ &d_s(p,q) = ||p - q||2 = \\sqrt{(u_p - u_q)^2 - (v_p - v_q)^2} \\rightarrow \\text{spatial distance}\\ &d_r(I_p,I_q) = |I_p - I_q| \\rightarrow \\text{range/intensity distance}\\ &W(p) = \\sum{q \\in s} G_{\\sigma_s}(d_s(p,q))G_{\\sigma_r}(d_r(p,q)) \\rightarrow \\text{normalization factor} \\end{align} $$ ![[Pasted image 20230309192143.png]]

In practice, the filter takes into account both the spatial and the color distance of the pixels and uses it to increase or lower the influence of the neighbors pixels on the intensity of the current one.`;
let p = new Parser()
let l = p.Convert(text);
// console.log(l);
writeFileSync('prova.html',l);
