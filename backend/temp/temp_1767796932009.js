// JS Stack Demo
let stack = [];
console.log("Pushing elements...");

// Push elements
stack.push(10);
stack.push(20);
stack.push(30);
stack.push(40);

// Pop element
let popped = stack.pop();
console.log("Popped:", popped);

stack.push(50);
console.log("Final stack:", stack);