# Python Fibonacci
n = 8
a, b = 0, 1
print(f"Fib 0: {a}")
print(f"Fib 1: {b}")

for i in range(2, n):
    c = a + b
    print(f"Fib {i}: {c}")
    a = b
    b = c