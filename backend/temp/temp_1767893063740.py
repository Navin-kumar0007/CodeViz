# Test stack and queue visualizations
def data_structures_demo():
    stack = []
    queue = []
    
    # Build stack
    for i in range(5):
        stack.append(i * 10)
    
    # Build queue
    for i in range(5):
        queue.append(i * 100)
    
    # Pop from stack
    while len(stack) > 0:
        item = stack.pop()
        print(f"Popped from stack: {item}")
    
    return queue