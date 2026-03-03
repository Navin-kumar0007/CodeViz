// JavaScript Binary Tree
class TreeNode {
    constructor(val) {
        this.val = val;
        this.left = null;
        this.right = null;
    }
}

// Build tree
let root = new TreeNode(10);
root.left = new TreeNode(5);
root.right = new TreeNode(15);
root.left.left = new TreeNode(2);
root.left.right = new TreeNode(7);

console.log("Tree created!");
console.log("Root:", root.val);
console.log("Left child:", root.left.val);
console.log("Right child:", root.right.val);