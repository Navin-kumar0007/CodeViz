# Python Check Prime
num = 29
is_prime = True

if num > 1:
    for i in range(2, num):
        if (num % i) == 0:
            is_prime = False
            print(f"{num} is divisible by {i}")
            break

if is_prime: print(f"{num} is Prime")
else: print(f"{num} is NOT Prime")