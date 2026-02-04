// Java Fibonacci
int n = 8;
int a = 0;
int b = 1;

System.out.println("Fib: " + a);
System.out.println("Fib: " + b);

for (int i = 2; i < n; i++) {
    int c = a + b;
    System.out.println("Fib: " + c);
    a = b;
    b = c;
}