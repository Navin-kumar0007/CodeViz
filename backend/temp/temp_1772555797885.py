def count_vowels_loop(s):
    vowels = "aeiou"
    count = 0
    # Convert the input string to lowercase once
    s = s.lower()
    for char in s:
        if char in vowels:
            count += 1
    return count

# Example Usage:
input_string = "Programming is Fun"
vowel_count = count_vowels_loop(input_string)
print(f"Number of vowels in the string: {vowel_count}")
