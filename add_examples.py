#!/usr/bin/env python3

# Read the original file
with open('frontend/src/examples.js', 'r') as f:
    content = f.read()

# New examples to add
new_examples = '''
        \"Binary Tree Traversal\": \`// JS Binary Tree Traversal
class TreeNode {
    constructor(val) {
        this.val = val;
        this.left = null;
        this.right = null;
    }
}

// Build a balanced tree
let root = new TreeNode(50);
root.left = new TreeNode(30);
root.right = new TreeNode(70);
root.left.left = new TreeNode(20);
root.left.right = new TreeNode(40);
root.right.left = new TreeNode(60);
root.right.right = new TreeNode(80);

console.log("Tree created!");
console.log("Root:", root);\`,

        \"BST Insertion\": \`// JS BST Insertion
class TreeNode {
    constructor(val) {
        this.val = val;
        this.left = null;
        this.right = null;
    }
}

// Start with root
let root = new TreeNode(50);
console.log("Root 50 created");

// Insert left - smaller than root
root.left = new TreeNode(30);
console.log("Inserted 30 to left");

// Insert right - larger than root
root.right = new TreeNode(70);
console.log("Inserted 70 to right");

// Insert more nodes
root.left.left = new TreeNode(20);
root.left.right = new TreeNode(40);
root.right.left = new TreeNode(60);

console.log("BST complete!", root);\`,

        \"Graph DFS\": \`// JS Graph DFS
const graph = {
    "A": ["B", "C"],
    "B": ["D"],
    "C": ["E", "F"],
    "D": [],
    "E": [],
    "F": ["G"],
    "G": []
};

let visited = [];
let stack = ["A"];

console.log("Starting DFS...");

while (stack.length > 0) {
    let node = stack.pop();
    
    if (!visited.includes(node)) {
        visited.push(node);
        console.log("Visiting:", node);
        
        let neighbors = graph[node];
        for (let i = neighbors.length - 1; i >= 0; i--) {
            let neighbor = neighbors[i];
            if (!visited.includes(neighbor)) {
                stack.push(neighbor);
            }
        }
    }
}
console.log("DFS complete!");\`,

        \"Small Graph\": \`// JS Small Graph
const graph = {
    "X": ["Y", "Z"],
    "Y": ["Z"],
    "Z": []
};

console.log("Simple graph created");
console.log("Nodes:", Object.keys(graph));

// Show connections
for (let node in graph) {
    console.log(node, "connects to:", graph[node]);
}\`'''

# Find where to insert (after "Linked List Demo" but before the closing brace of javascript section)
# Look for the pattern: Linked List Demo...`\n    },
insertion_point = content.find('console.log("Head:", head);`')
if insertion_point == -1:
    print("ERROR: Could not find insertion point")
    exit(1)

# Find the comma after the backtick
insertion_point = content.find(',', insertion_point)
if insertion_point == -1:
    print("ERROR: Could not find comma")
    exit(1)

insertion_point += 1  # After the comma

# Insert new content
new_content = content[:insertion_point] + new_examples + content[insertion_point:]

# Write back
with open('frontend/src/examples.js', 'w') as f:
    f.write(new_content)

print('Successfully added new tree and graph examples')
