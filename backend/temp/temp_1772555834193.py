def count_vowels(s):
    vowels = "aeiou"
    # Use sum and a generator expression to count vowels in the lowercase string
    return sum(1 for char in s.lower() if char in vowels)

# Example Usage
input_string = "Hello World"
print(f"Number of vowels: {count_vowels(input_string)}") # Output: Number of vowels: 3
