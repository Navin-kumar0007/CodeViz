# Python Stack (LIFO - Last In First Out)
stack = []
print("Pushing elements...")

stack.append(10)
stack.append(20)
stack.append(30)
stack.append(40)
print(f"Stack: {stack}")

# Pop element
popped = stack.pop()
print(f"Popped: {popped}")
print(f"Stack after pop: {stack}")