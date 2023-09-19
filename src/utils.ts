const katex = require('katex')


class Graph {
    public Nodes: Array<string> = []
    public Edges: Array<Edge> = []
    constructor(nodes: Array<string>, adiacentMatrix: number[][]){
        this.Nodes = nodes;
        this.Edges = this.ConvertEdges(adiacentMatrix);
    }
    private ConvertEdges(adiacentMatrix:number[][]): Array<Edge>{
        let edges: Array<Edge> = []

        const size = adiacentMatrix.length;
        for(let i = 0; i < size; i++){
            for(let j = 0; j < size; j++){
                if(adiacentMatrix[i][j] === 1){
                    edges.push(new Edge(this.Nodes[i], this.Nodes[j]));
                }
            }
        }
        return edges;
    }

    public GetEdgesFrom(node:string): Array<Edge>{
        let edges: Array<Edge> = [];
        for(let e of this.Edges){
            if(e.From == node){
                edges.push(e)
            }
        }
        return edges;
    }

    public GetEdgesTO(node:string): Array<Edge>{
        let edges: Array<Edge> = [];
        for(let e of this.Edges){
            if(e.To == node){
                edges.push(e)
            }
        }
        return edges;
    }
}

class Edge{
    public From:string;
    public To:string;

    constructor(from:string, to:string){
        this.From = from;
        this.To = to;
    }
}


function GetElements(starts: Array<number>, finishes: Array<number>): Array<MarkdownElement>{
        if(starts.length != finishes.length)
            throw new Error("starts and finishes must have the same length");

        let res: Array<MarkdownElement> = [];

        for(let i = 0; i < starts.length; i ++){
            res.push(new MarkdownElement(starts[i], finishes[i]));
        }

        return res;
}

class MathElement{
    public Value: string;
    public Id: string;

    constructor(value: string, id: string, display:boolean){
        this.Value = katex.renderToString(
            value, 
            {
                "displayMode":display,
                "output":"htmlAndMathml",
            });
        this.Id = id;
    }

}

class MarkdownElement{
    public Start: number;
    public Finish: number;

    constructor(start:number, finish:number){
        this.Start = start;
        this.Finish = finish;
    };
}

function FindIndiced(originString:string, subString:string): Array<number>{
    let step: number = subString.length;
    let match: Array<number> = [];
    for(let i = 0; i < originString.length - step; i++){
        let sub:string = originString.substring(i, i+step);
        if(sub === subString){
            match.push(i)
        }
    }

    return match;
}

export { FindIndiced, MarkdownElement, MathElement, Graph, GetElements };
