# Python Binary Search
arr = [2, 5, 8, 12, 16, 23, 38, 56]
target = 23
low = 0
high = len(arr) - 1
found = -1

while low <= high:
    mid = (low + high) // 2
    if arr[mid] == target:
        found = mid
        print(f"Found at index {mid}")
        break
    elif arr[mid] < target:
        low = mid + 1
    else:
        high = mid - 1

if found == -1: print("Not Found")
