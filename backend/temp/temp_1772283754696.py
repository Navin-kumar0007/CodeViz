# Python - Accessing Elements
numbers = [10, 20, 30, 40, 50]

# Access by index
first = numbers[0]    # 10
third = numbers[2]    # 30
last = numbers[-1]    # 50 (negative index!)

print(f"First: {first}")
print(f"Third: {third}")
print(f"Last: {last}")

# Modify an element
numbers[1] = 25
print(f"After change: {numbers}")