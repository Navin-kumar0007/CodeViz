# Python Binary Search (array must be sorted!)
arr = [2, 5, 8, 12, 16, 23, 38, 56]
target = 23
low = 0
high = len(arr) - 1

while low <= high:
    mid = (low + high) // 2
    print(f"Checking index {mid}: {arr[mid]}")
    
    if arr[mid] == target:
        print(f"Found {target} at index {mid}!")
        break
    elif arr[mid] < target:
        low = mid + 1
    else:
        high = mid - 1