// JS Graph BFS
// Adjacency List Representation
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

console.log("Starting BFS...");

while (queue.length > 0) {
    let node = queue.shift();
    console.log("Visiting:", node);
    
    let neighbors = graph[node];
    for (let i = 0; i < neighbors.length; i++) {
        let neighbor = neighbors[i];
        
        if (!visited.includes(neighbor)) {
            visited.push(neighbor);
            queue.push(neighbor);
        }
    }
}
console.log("Done!");