// JavaScript Graph DFS (Depth-First Search)
const graph = {
    "A": ["B", "C"],
    "B": ["D"],
    "C": ["E", "F"],
    "D": [],
    "E": [],
    "F": []
};

let stack = ["A"];
let visited = [];

console.log("Starting DFS from A...");

while (stack.length > 0) {
    let node = stack.pop();
    
    if (!visited.includes(node)) {
        visited.push(node);
        console.log("Visiting:", node);
        
        let neighbors = graph[node];
        for (let i = neighbors.length - 1; i >= 0; i--) {
            stack.push(neighbors[i]);
        }
    }
}

console.log("DFS complete!");