# Python Recursive Factorial
def factorial(n):
    if n == 1:
        return 1
    else:
        # Recursive Call
        result = n * factorial(n - 1)
        return result

num = 5
print(f"Calculating factorial of {num}...")
final_result = factorial(num)
print(f"Result: {final_result}")