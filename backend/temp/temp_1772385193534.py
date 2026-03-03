# Reverse the array without using .reverse()
arr = [1, 2, 3, 4, 5]

# Your code here
for i in range(len(arr) // 2):
    arr[i], arr[~i] = arr[~i], arr[i]

print(arr)
