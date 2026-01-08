// JS Linked List
class Node {
    constructor(val) {
        this.val = val;
        this.next = null;
    }
}

// 1. Create Nodes
let head = new Node(10);
let second = new Node(20);
let third = new Node(30);

// 2. Link them
head.next = second;
second.next = third;

// 3. Traverse
console.log("Traversing...");
let current = head;
while (current !== null) {
    console.log("Visiting:", current.val);
    current = current.next;
}
console.log("Done!");