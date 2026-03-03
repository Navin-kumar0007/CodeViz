def reverse_string_loop(s):
  """Reverses a string using a for loop."""
  reversed_s = ""
  for char in s:
    reversed_s = char + reversed_s
  return reversed_s

# Example usage:
input_string = "Programming"
reversed_string = reverse_string_loop(input_string)
print(f"Original string: {input_string}")
print(f"Reversed string: {reversed_string}")
