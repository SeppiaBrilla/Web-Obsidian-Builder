import { Edge } from './types'

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

    public GetEdgesTo(node:string): Array<Edge>{
        let edges: Array<Edge> = [];
        for(let e of this.Edges){
            if(e.To == node){
                edges.push(e)
            }
        }
        return edges;
    }
}

export { Graph };
