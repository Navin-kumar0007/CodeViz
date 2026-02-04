// JavaScript Queue (FIFO - First In First Out)
let queue = [];
console.log("Enqueuing elements...");

queue.push(1);
queue.push(2);
queue.push(3);
queue.push(4);
console.log("Queue:", queue);

// Dequeue element
let removed = queue.shift();
console.log("Dequeued:", removed);
console.log("Queue after dequeue:", queue);