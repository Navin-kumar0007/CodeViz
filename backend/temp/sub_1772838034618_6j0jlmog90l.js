const fs = require('fs');

class Node {
    constructor(val = 0, next = null) {
        this.val = val;
        this.next = next;
    }
}

// Read input from the console (synchronous read from standard input)
const userInput = fs.readFileSync(0, 'utf-8').trim();

// Handle the constraint where the list might be empty (0 nodes)
if (!userInput) {
    console.log();
} else {
    // Split by whitespace and convert strings to numbers
    const nums = userInput.split(/\s+/).map(Number);
    
    // 1. Build the singly linked list from the input numbers
    let head = new Node(nums[0]);
    let curr = head;
    
    for (let i = 1; i < nums.length; i++) {
        curr.next = new Node(nums[i]);
        curr = curr.next;
    }
    
    // 
    // 2. Reverse the linked list using the Three-Pointer approach
    let prev = null;
    curr = head;
    
    while (curr !== null) {
        let nextNode = curr.next;  // Step A: Save the next node so we don't lose the rest of the list
        curr.next = prev;          // Step B: Reverse the current node's pointer to point backward
        prev = curr;               // Step C: Move the 'prev' pointer one step forward
        curr = nextNode;           // Step D: Move the 'curr' pointer one step forward
    }
    
    // 3. Print the reversed list 
    // (After the loop, 'curr' is null, and 'prev' is pointing to the new head)
    let reversedHead = prev;
    curr = reversedHead;
    
    // Instead of printing node-by-node, it's faster in JS to build an array and join it
    let output = [];
    while (curr !== null) {
        output.push(curr.val);
        curr = curr.next;
    }
    
    console.log(output.join(" "));
}