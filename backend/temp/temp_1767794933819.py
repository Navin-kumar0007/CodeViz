# Python Find Max
arr = [10, 50, 30, 90, 20]
max_val = arr[0]

for x in arr:
    if x > max_val:
        max_val = x
        
print(f"Maximum value is {max_val}")