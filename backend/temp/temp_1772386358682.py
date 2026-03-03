# Python Queue (FIFO - First In First Out)
queue = []
print("Enqueuing elements...")

queue.append(1)
queue.append(2)
queue.append(3)
queue.append(4)
print(f"Queue: {queue}")

# Dequeue element
removed = queue.pop(0)
print(f"Dequeued: {removed}")
print(f"Queue after dequeue: {queue}")