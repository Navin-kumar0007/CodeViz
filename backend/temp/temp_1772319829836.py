import math

# Input two numbers from the user
num1 = int(input("Enter the first number: "))
num2 = int(input("Enter the second number: "))

# Calculate the GCD
gcd_result = math.gcd(num1, num2)

# Print the result
print(f"The GCD of {num1} and {num2} is: {gcd_result}")
