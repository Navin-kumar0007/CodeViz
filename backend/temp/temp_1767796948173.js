// JS Queue Demo
let queue = [];
console.log("Enqueuing elements...");

// Enqueue (add to rear)
queue.push(1);
queue.push(2);
queue.push(3);
queue.push(4);

// Dequeue (remove from front)
let removed = queue.shift();
console.log("Removed:", removed);

queue.push(5);
console.log("Final queue:", queue);