// JavaScript Linked List
class Node {
    constructor(val) {
        this.val = val;
        this.next = null;
    }
}

// Create nodes
let head = new Node(10);
let second = new Node(20);
let third = new Node(30);

// Link them together
head.next = second;
second.next = third;

// Traverse
console.log("Traversing linked list...");
let current = head;
while (current !== null) {
    console.log("Node value:", current.val);
    current = current.next;
}
console.log("End of list (null)");