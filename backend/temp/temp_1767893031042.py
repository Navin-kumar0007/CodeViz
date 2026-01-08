# Test array rendering and stepping
def array_demo():
    arr = [5, 2, 8, 1, 9, 3, 7]
    for i in range(len(arr)):
        temp = arr[i]
        print(f"Processing element {i}: {temp}")
    return arr