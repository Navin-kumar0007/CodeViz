def find_max_element(numbers):
    # Check if the list is empty
    if not numbers:
        return None

    # Initialize 'max_val' with the first item in the list
    max_val = numbers[0]

    # Loop through the list starting from the second element
    for num in numbers:
        if num > max_val:
            # If current number is larger, update max_val
            max_val = num
            
    return max_val

# Example usage:
my_list = [12, 45, 2, 89, 34, 11]
result = find_max_element(my_list)
print(f"The maximum element is: {result}")