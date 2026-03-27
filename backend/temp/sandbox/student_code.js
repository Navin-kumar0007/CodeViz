// JavaScript Graph BFS (Breadth-First Search)
const graph = {
    "A": ["B", "C"],
    "B": ["D", "E"],
    "C": ["F"],
    "D": [],
    "E": ["F"],
    "F": []
};

let queue = ["A"];
let visited = ["A"];

console.log("Starting BFS from A...");

while (queue.length > 0) {
    let node = queue.shift();
    console.log("Visiting:", node);
    
    let neighbors = graph[node];
    for (let i = 0; i < neighbors.length; i++) {
        if (!visited.includes(neighbors[i])) {
            visited.push(neighbors[i]);
            queue.push(neighbors[i]);
        }
    }
}

console.log("BFS complete!");