/**
 * Trees - Learning Path
 * Learn about hierarchical data structures and traversals
 */

export const TREES_PATH = {
    id: 'trees',
    title: 'Trees & BSTs',
    icon: '🌳',
    description: 'Master hierarchical data structures, binary search trees, and all the ways to traverse them.',
    prerequisites: ['linkedlists', 'recursion'],
    lessons: [
        {
            id: 'what-is-a-tree',
            title: 'Introduction to Trees',
            duration: '8 min',
            explanation: [
                {
                    type: 'text',
                    content: 'A **Tree** is a non-linear data structure that simulates a hierarchical tree structure, with a root value and subtrees of children with a parent node.'
                },
                {
                    type: 'tip',
                    content: 'Unlike Arrays and Linked Lists (which are linear), Trees are hierarchical. The top node is the Root, and nodes with no children are Leaves.'
                },
                {
                    type: 'text',
                    content: 'A **Binary Tree** is a special type of tree where each node can have at most two children, usually referred to as the left child and the right child.'
                }
            ],
            keyConcepts: [
                'Root: The topmost node',
                'Edge: The link between a parent and a child',
                'Leaf: A node with no children',
                'Height: Longest path from root to leaf',
                'Depth: Edges from root to the node'
            ],
            code: {
                python: `# Python - Basic Binary Tree Node
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

# Creating a simple tree:
#       1
#      / \\
#     2   3
root = TreeNode(1)
root.left = TreeNode(2)
root.right = TreeNode(3)
print(f"Root: {root.val}, Left: {root.left.val}, Right: {root.right.val}")`,
                javascript: `// JavaScript - Basic Binary Tree Node
class TreeNode {
    constructor(val = 0, left = null, right = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

// Creating a simple tree:
//       1
//      / \\
//     2   3
let root = new TreeNode(1);
root.left = new TreeNode(2);
root.right = new TreeNode(3);
console.log(\`Root: \${root.val}, Left: \${root.left.val}, Right: \${root.right.val}\`);`,
                java: `// Java - Basic Binary Tree Node
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode(int x) { val = x; }
}

public class Main {
    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        System.out.println("Root: " + root.val + ", Left: " + root.left.val + ", Right: " + root.right.val);
    }
}`,
                cpp: `// C++ - Basic Binary Tree Node
#include <iostream>
using namespace std;

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(NULL), right(NULL) {}
};

int main() {
    TreeNode* root = new TreeNode(1);
    root->left = new TreeNode(2);
    root->right = new TreeNode(3);
    cout << "Root: " << root->val << ", Left: " << root->left->val << ", Right: " << root->right->val << endl;
    return 0;
}`,
                c: `// C - Basic Binary Tree Node
#include <stdio.h>
#include <stdlib.h>

struct TreeNode {
    int val;
    struct TreeNode *left;
    struct TreeNode *right;
};

struct TreeNode* createNode(int val) {
    struct TreeNode* newNode = (struct TreeNode*)malloc(sizeof(struct TreeNode));
    newNode->val = val;
    newNode->left = NULL;
    newNode->right = NULL;
    return newNode;
}

int main() {
    struct TreeNode* root = createNode(1);
    root->left = createNode(2);
    root->right = createNode(3);
    printf("Root: %d, Left: %d, Right: %d\\n", root->val, root->left->val, root->right->val);
    return 0;
}`,
                go: `// Go - Basic Binary Tree Node
package main
import "fmt"

type TreeNode struct {
    Val   int
    Left  *TreeNode
    Right *TreeNode
}

func main() {
    root := &TreeNode{Val: 1}
    root.Left = &TreeNode{Val: 2}
    root.Right = &TreeNode{Val: 3}
    fmt.Printf("Root: %d, Left: %d, Right: %d\\n", root.Val, root.Left.Val, root.Right.Val)
}`,
                typescript: `// TypeScript - Basic Binary Tree Node
class TreeNode {
    val: number;
    left: TreeNode | null;
    right: TreeNode | null;
    
    constructor(val: number = 0, left: TreeNode | null = null, right: TreeNode | null = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

let root = new TreeNode(1);
root.left = new TreeNode(2);
root.right = new TreeNode(3);
console.log(\`Root: \${root.val}, Left: \${root.left?.val}, Right: \${root.right?.val}\`);`
            },
            syntaxDiff: 'Across all languages, a Tree node requires a value and pointers/references to its left and right children. C uses structs and pointers, Java uses object references.',
            quiz: [
                {
                    question: 'What is a leaf node in a tree?',
                    options: [
                        'The topmost node of the tree',
                        'A node that has exactly one child',
                        'A node that has no children',
                        'Any node that is not the root'
                    ],
                    correct: 2,
                    explanation: 'A leaf node is a node located at the bottom of the tree structure that has no children (both left and right pointers are null).'
                },
                {
                    question: 'What is the maximum number of children a node can have in a Binary Tree?',
                    options: ['0', '1', '2', 'Unlimited'],
                    correct: 2,
                    explanation: 'In a BINARY tree, each node can have AT MOST two children (usually referred to as the left child and right child).'
                }
            ]
        },
        {
            id: 'bst-properties',
            title: 'Binary Search Trees (BST)',
            duration: '10 min',
            explanation: [
                {
                    type: 'text',
                    content: 'A **Binary Search Tree (BST)** is a special binary tree that maintains a strict ordering property.'
                },
                {
                    type: 'tip',
                    content: 'The BST Property: For ANY node, all values in its LEFT subtree are strictly less than the node\'s value, and all values in its RIGHT subtree are strictly greater.'
                },
                {
                    type: 'text',
                    content: 'Because of this property, BSTs offer incredibly fast lookups! Searching a balanced BST takes O(log N) time, making it as fast as Binary Search on an array, but with the added benefit of fast insertions and deletions.'
                }
            ],
            keyConcepts: [
                'Left subtree < Parent < Right subtree',
                'Searching is O(log N) on average',
                'Insertion is O(log N) on average',
                'Requires the tree to be reasonably "balanced" for best performance'
            ],
            code: {
                python: `# Python - BST Search
def searchBST(root, val):
    # Base Cases: root is null or key is present at root
    if root is None or root.val == val:
        return root
    
    # Key is greater than root's key
    if root.val < val:
        return searchBST(root.right, val)
    
    # Key is smaller than root's key
    return searchBST(root.left, val)`,
                javascript: `// JavaScript - BST Search
function searchBST(root, val) {
    if (!root || root.val === val) {
        return root;
    }
    
    if (val < root.val) {
        return searchBST(root.left, val);
    } else {
        return searchBST(root.right, val);
    }
}`,
                java: `// Java - BST Search
public TreeNode searchBST(TreeNode root, int val) {
    if (root == null || root.val == val) return root;
    if (val < root.val) {
        return searchBST(root.left, val);
    } else {
        return searchBST(root.right, val);
    }
}`,
                cpp: `// C++ - BST Search
TreeNode* searchBST(TreeNode* root, int val) {
    if (root == NULL || root->val == val) return root;
    if (val < root->val) {
        return searchBST(root->left, val);
    }
    return searchBST(root->right, val);
}`,
                c: `// C - BST Search
struct TreeNode* searchBST(struct TreeNode* root, int val) {
    if (root == NULL || root->val == val) return root;
    if (val < root->val) {
        return searchBST(root->left, val);
    }
    return searchBST(root->right, val);
}`,
                go: `// Go - BST Search
func searchBST(root *TreeNode, val int) *TreeNode {
    if root == nil || root.Val == val {
        return root
    }
    if val < root.Val {
        return searchBST(root.Left, val)
    }
    return searchBST(root.Right, val)
}`,
                typescript: `// TypeScript - BST Search
function searchBST(root: TreeNode | null, val: number): TreeNode | null {
    if (!root || root.val === val) return root;
    if (val < root.val) return searchBST(root.left, val);
    return searchBST(root.right, val);
}`
            },
            syntaxDiff: 'The search logic uses recursion to traverse down the tree, discarding half the tree at every step, just like Binary Search.',
            quiz: [
                {
                    question: 'In a valid Binary Search Tree, where would you find the maximum value?',
                    options: [
                        'At the root',
                        'At the leftmost leaf',
                        'At the rightmost leaf or node',
                        'In the middle'
                    ],
                    correct: 2,
                    explanation: 'Because every right child is strictly greater than its parent, if you keep following the right pointers until you hit null, you will find the absolute maximum value in the BST.'
                },
                {
                    question: 'What is the average time complexity of searching a BST containing N nodes?',
                    options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
                    correct: 1,
                    explanation: 'Searching a balanced BST takes O(log N) time because at each step you eliminate approximately half of the remaining nodes.'
                }
            ]
        },
        {
            id: 'tree-traversals',
            title: 'DFS: Tree Traversals',
            duration: '12 min',
            explanation: [
                {
                    type: 'text',
                    content: 'Because trees are not linear, there are multiple ways to visit all their nodes. Depth-First Search (DFS) traversals go as deep as possible before backtracking.'
                },
                {
                    type: 'tip',
                    content: 'The 3 types of DFS traversal are defined by WHEN you visit the Parent (Root) node:\n1. Preorder: Root, Left, Right\n2. Inorder: Left, Root, Right\n3. Postorder: Left, Right, Root'
                },
                {
                    type: 'warning',
                    content: 'Inorder traversal of a Binary Search Tree (BST) will visit the nodes in completely SORTED ascending order! This is a very common interview trick.'
                }
            ],
            keyConcepts: [
                'Inorder (Left, Root, Right) -> Sorted values on a BST',
                'Preorder (Root, Left, Right) -> Good for copying a tree',
                'Postorder (Left, Right, Root) -> Good for deleting a tree (children first)',
                'Recursion makes traversals trivial to write'
            ],
            code: {
                python: `# Python - Recursive Traversals
def inorder(root):
    if not root: return
    inorder(root.left)
    print(root.val, end=" ") # Visit ROOT in the middle
    inorder(root.right)

def preorder(root):
    if not root: return
    print(root.val, end=" ") # Visit ROOT first
    preorder(root.left)
    preorder(root.right)`,
                javascript: `// JavaScript - Recursive Traversals
function inorder(root) {
    if (!root) return;
    inorder(root.left);
    console.log(root.val); // Visit ROOT in the middle
    inorder(root.right);
}

function preorder(root) {
    if (!root) return;
    console.log(root.val); // Visit ROOT first
    preorder(root.left);
    preorder(root.right);
}`,
                java: `// Java - Recursive Traversals
public void inorder(TreeNode root) {
    if (root == null) return;
    inorder(root.left);
    System.out.print(root.val + " "); // Middle
    inorder(root.right);
}`,
                cpp: `// C++ - Recursive Traversals
void inorder(TreeNode* root) {
    if (!root) return;
    inorder(root->left);
    cout << root->val << " "; // Middle
    inorder(root->right);
}`,
                c: `// C - Recursive Traversals
void inorder(struct TreeNode* root) {
    if (!root) return;
    inorder(root->left);
    printf("%d ", root->val); // Middle
    inorder(root->right);
}`,
                go: `// Go - Recursive Traversals
func inorder(root *TreeNode) {
    if root == nil { return }
    inorder(root.Left)
    fmt.Printf("%d ", root.Val) // Middle
    inorder(root.Right)
}`,
                typescript: `// TypeScript - Recursive Traversals
function inorder(root: TreeNode | null): void {
    if (!root) return;
    inorder(root.left);
    console.log(root.val); // Middle
    inorder(root.right);
}`
            },
            syntaxDiff: 'The recursive structure is absolutely identical across languages. The only difference is the print syntax.',
            quiz: [
                {
                    question: 'Which traversal strategy visits nodes in the order: Left Subtree, Right Subtree, Root?',
                    options: ['Inorder', 'Preorder', 'Postorder', 'Level-order'],
                    correct: 2,
                    explanation: 'Postorder traversal processes the left and right children before processing the current root node.'
                },
                {
                    question: 'If you want to read all the values in a Binary Search Tree in sorted (ascending) order, which traversal should you use?',
                    options: ['Preorder', 'Inorder', 'Postorder', 'Reverse Postorder'],
                    correct: 1,
                    explanation: 'Inorder traversal processes the left (smaller) values, then the root, then the right (larger) values, resulting in a perfectly sorted output.'
                }
            ]
        }
    ]
};
