// JS Linked List Demo
class Node {
    constructor(val) {
        this.val = val;
        this.next = null;
    }
}

// Create: 10 -> 20 -> 30 -> 40
let head = new Node(10);
head.next = new Node(20);
head.next.next = new Node(30);
head.next.next.next = new Node(40);

console.log("Created!");
console.log("Head:", head);