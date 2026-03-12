/**
 * Graphs - Learning Path
 * Learn about modeling connections and relationships
 */

export const GRAPHS_PATH = {
    id: 'graphs',
    title: 'Graphs & Traversals',
    icon: '🕸️',
    description: 'Model real-world networks using vertices and edges, and learn BFS and DFS algorithms.',
    prerequisites: ['trees'],
    lessons: [
        {
            id: 'what-is-a-graph',
            title: 'Introduction to Graphs',
            duration: '10 min',
            explanation: [
                {
                    type: 'text',
                    content: 'A **Graph** is a non-linear data structure consisting of **Vertices (or Nodes)** and **Edges** that connect them.'
                },
                {
                    type: 'tip',
                    content: 'Think of a social network: You are a Vertex, and your friendship with someone else is an Edge connecting the two of you.'
                },
                {
                    type: 'text',
                    content: 'Graphs can be **Directed** (one-way streets like Twitter follows) or **Undirected** (two-way streets like Facebook friends). They can also be **Weighted** (edges have distances/costs) or **Unweighted**.'
                }
            ],
            keyConcepts: [
                'Vertices (V): The nodes in the graph',
                'Edges (E): The connections between vertices',
                'Adjacency Matrix: A 2D array representing connections (O(V²) space)',
                'Adjacency List: A list of lists representing neighbors (O(V+E) space)'
            ],
            code: {
                python: `# Python - Adjacency List building
num_vertices = 4
edges = [[0, 1], [0, 2], [1, 2], [2, 3]]

# Initialize empty adjacency list
adj = {i: [] for i in range(num_vertices)}

# Populate undirected graph
for u, v in edges:
    adj[u].append(v)
    adj[v].append(u)  # Omit this for directed graph

print(adj)`,
                javascript: `// JavaScript - Adjacency List building
const numVertices = 4;
const edges = [[0, 1], [0, 2], [1, 2], [2, 3]];

// Initialize empty adjacency list
const adj = Array.from({ length: numVertices }, () => []);

// Populate undirected graph
for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u); // Omit this for directed graph
}

console.log(adj);`,
                java: `// Java - Adjacency List building
import java.util.*;

public class Main {
    public static void main(String[] args) {
        int numVertices = 4;
        int[][] edges = {{0, 1}, {0, 2}, {1, 2}, {2, 3}};
        
        // Initialize
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < numVertices; i++) {
            adj.add(new ArrayList<>());
        }
        
        // Populate
        for (int[] edge : edges) {
            adj.get(edge[0]).add(edge[1]);
            adj.get(edge[1]).add(edge[0]); // Omit for directed
        }
        System.out.println(adj);
    }
}`,
                cpp: `// C++ - Adjacency List building
#include <iostream>
#include <vector>
using namespace std;

int main() {
    int numVertices = 4;
    vector<pair<int, int>> edges = {{0, 1}, {0, 2}, {1, 2}, {2, 3}};
    
    vector<vector<int>> adj(numVertices);
    
    for (auto edge : edges) {
        adj[edge.first].push_back(edge.second);
        adj[edge.second].push_back(edge.first); // Omit for directed
    }
    
    // Print adj logic
    return 0;
}`,
                c: `// C - Adjacency Matrix (simpler in C without dynamic arrays)
#include <stdio.h>

int main() {
    int V = 4;
    int edges[4][2] = {{0,1}, {0,2}, {1,2}, {2,3}};
    int adj[4][4] = {0}; // Adjacency Matrix
    
    for (int i=0; i<4; i++) {
        int u = edges[i][0];
        int v = edges[i][1];
        adj[u][v] = 1;
        adj[v][u] = 1; // Omit for directed
    }
    return 0;
}`,
                go: `// Go - Adjacency List building
package main
import "fmt"

func main() {
    numVertices := 4
    edges := [][]int{{0, 1}, {0, 2}, {1, 2}, {2, 3}}
    
    adj := make([][]int, numVertices)
    
    for _, edge := range edges {
        u, v := edge[0], edge[1]
        adj[u] = append(adj[u], v)
        adj[v] = append(adj[v], u) // Omit for directed
    }
    fmt.Println(adj)
}`,
                typescript: `// TypeScript - Adjacency List building
const numVertices: number = 4;
const edges: number[][] = [[0, 1], [0, 2], [1, 2], [2, 3]];

const adj: number[][] = Array.from({ length: numVertices }, () => []);

for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u); // Omit for directed
}

console.log(adj);`
            },
            syntaxDiff: 'Most modern languages use Lists/Arrays of Lists/Arrays (like `vector<vector<int>>` or `List<List<Integer>>`) for building adjacency lists. C typically falls back on 2D matrices for simplicity unless implementing a custom linked-list array.',
            quiz: [
                {
                    question: 'If a graph is stored as an Adjacency Matrix for V vertices, what is the space complexity?',
                    options: ['O(V)', 'O(V + E)', 'O(E)', 'O(V²)'],
                    correct: 3,
                    explanation: 'An Adjacency Matrix is a V by V 2D array, taking O(V²) space regardless of how few edges there actually are.'
                },
                {
                    question: 'In a Directed Graph, if there is an edge [1, 2], what does this mean?',
                    options: [
                        'Node 1 and Node 2 are mutually connected',
                        'You can go from Node 1 to Node 2, but not back',
                        'You can go from Node 2 to Node 1, but not back',
                        'Node 1 has a weight of 2'
                    ],
                    correct: 1,
                    explanation: 'A directed edge [A, B] points strictly from A to B. It is a one-way path.'
                }
            ]
        },
        {
            id: 'graph-bfs',
            title: 'Breadth-First Search (BFS)',
            duration: '15 min',
            explanation: [
                {
                    type: 'text',
                    content: 'Breadth-First Search (BFS) explores the graph layer by layer, moving outwards from the starting node like ripples in a pond.'
                },
                {
                    type: 'tip',
                    content: 'Because BFS processes nodes in increasing distance from the start, it is perfectly suited for finding the **Shortest Path** in an unweighted graph!'
                },
                {
                    type: 'text',
                    content: 'BFS is implemented using a **Queue** (FIFO: First-In, First-Out) and a `visited` set to avoid infinitely looping in graph cycles.'
                }
            ],
            keyConcepts: [
                'Uses a Queue to track nodes to process next',
                'Explores all neighbors before moving to the next level',
                'Requires a `visited` set/array to handle cycles',
                'Level-order traversal is the tree equivalent of BFS'
            ],
            code: {
                python: `# Python - BFS Algorithm
from collections import deque

def bfs(start_node, adj):
    visited = set()
    queue = deque([start_node])
    visited.add(start_node)
    
    while queue:
        curr = queue.popleft()
        print(curr, end=" ")
        
        for neighbor in adj[curr]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)`,
                javascript: `// JavaScript - BFS Algorithm
function bfs(startNode, adj) {
    const visited = new Set();
    const queue = [startNode];
    visited.add(startNode);
    
    while (queue.length > 0) {
        // Shift is O(N). In real JS apps, use a real Queue class.
        const curr = queue.shift(); 
        console.log(curr);
        
        for (const neighbor of adj[curr]) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }
}`,
                java: `// Java - BFS Algorithm
public void bfs(int startNode, List<List<Integer>> adj) {
    boolean[] visited = new boolean[adj.size()];
    Queue<Integer> queue = new LinkedList<>();
    
    visited[startNode] = true;
    queue.offer(startNode);
    
    while (!queue.isEmpty()) {
        int curr = queue.poll();
        System.out.print(curr + " ");
        
        for (int neighbor : adj.get(curr)) {
            if (!visited[neighbor]) {
                visited[neighbor] = true;
                queue.offer(neighbor);
            }
        }
    }
}`,
                cpp: `// C++ - BFS Algorithm
void bfs(int startNode, vector<vector<int>>& adj) {
    vector<bool> visited(adj.size(), false);
    queue<int> q;
    
    visited[startNode] = true;
    q.push(startNode);
    
    while (!q.empty()) {
        int curr = q.front();
        q.pop();
        cout << curr << " ";
        
        for (int neighbor : adj[curr]) {
            if (!visited[neighbor]) {
                visited[neighbor] = true;
                q.push(neighbor);
            }
        }
    }
}`,
                c: `// C - BFS Algorithm (using manual array as queue)
void bfs(int startNode, int numVertices, int adj[100][100]) { // simplified adj matrix
    int visited[100] = {0};
    int queue[100];
    int front = 0, rear = 0;
    
    visited[startNode] = 1;
    queue[rear++] = startNode;
    
    while (front < rear) {
        int curr = queue[front++];
        printf("%d ", curr);
        
        for (int i = 0; i < numVertices; i++) {
            if (adj[curr][i] == 1 && !visited[i]) {
                visited[i] = 1;
                queue[rear++] = i;
            }
        }
    }
}`,
                go: `// Go - BFS Algorithm
func bfs(startNode int, adj [][]int) {
    visited := make([]bool, len(adj))
    queue := []int{startNode}
    visited[startNode] = true
    
    for len(queue) > 0 {
        curr := queue[0]
        queue = queue[1:] // Pop left
        fmt.Printf("%d ", curr)
        
        for _, neighbor := range adj[curr] {
            if !visited[neighbor] {
                visited[neighbor] = true
                queue = append(queue, neighbor)
            }
        }
    }
}`,
                typescript: `// TypeScript - BFS Algorithm
function bfs(startNode: number, adj: number[][]): void {
    const visited: Set<number> = new Set();
    const queue: number[] = [startNode];
    visited.add(startNode);
    
    while (queue.length > 0) {
        const curr = queue.shift()!;
        console.log(curr);
        
        for (const neighbor of adj[curr]) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }
}`
            },
            syntaxDiff: 'Python uses `collections.deque` and Java uses `LinkedList<>` as true O(1) Queues. In JS/TS, `Array.shift()` is O(N) but used in simple algorithms. C/Go manually slice slices or maintain front/rear indices.',
            quiz: [
                {
                    question: 'What underlying data structure drives Breadth-First Search (BFS)?',
                    options: ['Stack', 'Queue', 'Hash Map', 'Priority Queue'],
                    correct: 1,
                    explanation: 'BFS uses a Queue (First-In, First-Out) to ensure that the immediate neighbors of a node are processed before the neighbors of the neighbors.'
                },
                {
                    question: 'What famous problem is BFS uniquely suited for compared to DFS?',
                    options: [
                        'Counting nodes in a tree',
                        'Finding the shortest path in an unweighted graph',
                        'Topological sorting',
                        'Validating a Binary Search Tree'
                    ],
                    correct: 1,
                    explanation: 'Because BFS radiates outwards level-by-level, the first time it reaches the target node, it guarantees it traversed the minimum number of edges (shortest path).'
                }
            ]
        },
        {
            id: 'graph-dfs',
            title: 'Depth-First Search (DFS)',
            duration: '12 min',
            explanation: [
                {
                    type: 'text',
                    content: 'Depth-First Search (DFS) dives as deep as possible down a single path before backtracking and trying the next path.'
                },
                {
                    type: 'tip',
                    content: 'DFS is incredibly versatile. It is heavily used for cycle detection, topological sorting, finding connected components, and pathfinding in mazes!'
                },
                {
                    type: 'text',
                    content: 'It can be implemented recursively (using the system call stack) or iteratively using an explicit **Stack** (LIFO: Last-In, First-Out).'
                }
            ],
            keyConcepts: [
                'Goes deep before going wide',
                'Uses a Stack (Recursion) instead of a Queue',
                'Requires a `visited` set to prevent infinite loops',
                'Very short to write recursively!'
            ],
            code: {
                python: `# Python - Recursive DFS
def dfs(curr, adj, visited):
    if curr in visited:
        return
    visited.add(curr)
    print(curr, end=" ")
    
    for neighbor in adj[curr]:
        dfs(neighbor, adj, visited)

# Usage: dfs(start_node, adj, set())`,
                javascript: `// JavaScript - Recursive DFS
function dfs(curr, adj, visited) {
    if (visited.has(curr)) return;
    
    visited.add(curr);
    console.log(curr);
    
    for (const neighbor of adj[curr]) {
        dfs(neighbor, adj, visited);
    }
}
// Usage: dfs(startNode, adj, new Set());`,
                java: `// Java - Recursive DFS
public void dfs(int curr, List<List<Integer>> adj, boolean[] visited) {
    if (visited[curr]) return;
    
    visited[curr] = true;
    System.out.print(curr + " ");
    
    for (int neighbor : adj.get(curr)) {
        dfs(neighbor, adj, visited);
    }
}`,
                cpp: `// C++ - Recursive DFS
void dfs(int curr, vector<vector<int>>& adj, vector<bool>& visited) {
    if (visited[curr]) return;
    
    visited[curr] = true;
    cout << curr << " ";
    
    for (int neighbor : adj[curr]) {
        dfs(neighbor, adj, visited);
    }
}`,
                c: `// C - Recursive DFS
void dfs(int curr, int numVertices, int adj[100][100], int visited[100]) {
    if (visited[curr]) return;
    
    visited[curr] = 1;
    printf("%d ", curr);
    
    for (int i = 0; i < numVertices; i++) {
        if (adj[curr][i] == 1) {
            dfs(i, numVertices, adj, visited);
        }
    }
}`,
                go: `// Go - Recursive DFS
func dfs(curr int, adj [][]int, visited []bool) {
    if visited[curr] {
        return
    }
    
    visited[curr] = true
    fmt.Printf("%d ", curr)
    
    for _, neighbor := range adj[curr] {
        dfs(neighbor, adj, visited)
    }
}`,
                typescript: `// TypeScript - Recursive DFS
function dfs(curr: number, adj: number[][], visited: Set<number>): void {
    if (visited.has(curr)) return;
    
    visited.add(curr);
    console.log(curr);
    
    for (const neighbor of adj[curr]) {
        dfs(neighbor, adj, visited);
    }
}`
            },
            syntaxDiff: 'The code structure relies heavily on recursion across all languages. The only subtle difference is whether the visited structure is an Array/Vector (Java/C++) or a Set/Map (Python/JS) based on how quickly the language can instantiate and check membership.',
            quiz: [
                {
                    question: 'If implemented iteratively, what data structure replaces the recursive call stack in DFS?',
                    options: ['Queue', 'Linked List', 'Stack', 'Array'],
                    correct: 2,
                    explanation: 'DFS uses a Stack (LIFO). You push neighbors onto the stack and pop them off, ensuring you always process the most recently discovered nodes first (diving deeper).'
                },
                {
                    question: 'What happens if you run DFS on a graph with cycles without using a "visited" set?',
                    options: [
                        'It runs normally but slower',
                        'It finds the shortest path',
                        'It immediately returns an error',
                        'It gets stuck in an infinite recursion loop (Stack Overflow)'
                    ],
                    correct: 3,
                    explanation: 'Without marking nodes as visited, DFS will cycle infinitely back and forth between connected nodes (e.g., A -> B -> A -> B...) until the program crashes from a Stack Overflow.'
                }
            ]
        }
    ]
};
