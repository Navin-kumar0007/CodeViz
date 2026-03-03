# Python Bubble Sort
arr = [64, 34, 25, 12, 22]
n = len(arr)
print(f"Original: {arr}")

for i in range(n):
    for j in range(0, n-i-1):
        if arr[j] > arr[j+1]:
            arr[j], arr[j+1] = arr[j+1], arr[j]
            
print(f"Sorted: {arr}")