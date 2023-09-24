import { Graph } from '../src/Graph';

const Nodes: Array<string> = ['node1', 'node2', 'node3'];
const AdiacentMatrix: number[][] = [ [0,1,0], [0,0,1], [1,0,0] ];

describe('Graph', () => {
    test('GetEdgesFrom', () => {
        const graph = new Graph(Nodes, AdiacentMatrix);
        const edges = graph.GetEdgesFrom('node1');
        expect(edges.length).toEqual(1);
        expect(edges[0].From).toEqual('node1');
        expect(edges[0].To).toEqual('node2');
    });
    test('GetEdgesTo', () => {
        const graph = new Graph(Nodes, AdiacentMatrix);
        const edges = graph.GetEdgesTo('node1');
        expect(edges.length).toEqual(1);
        expect(edges[0].From).toEqual('node3');
        expect(edges[0].To).toEqual('node1');
    });
});
