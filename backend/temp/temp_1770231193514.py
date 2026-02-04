# Python Linear Search
arr = [10, 50, 30, 70, 80, 20]
target = 70
found_index = -1

for i in range(len(arr)):
    if arr[i] == target:
        found_index = i
        print(f"Found {target} at index {i}!")
        break

if found_index == -1:
    print(f"{target} not found")