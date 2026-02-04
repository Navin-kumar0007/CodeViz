// Java Bubble Sort
int[] arr = { 5, 1, 4, 2, 8 };
System.out.println("Start");

for (int i = 0; i < 5; i++) {
    for (int j = 0; j < 4 - i; j++) {
        if (arr[j] > arr[j+1]) {
            int temp = arr[j];
            arr[j] = arr[j+1];
            arr[j+1] = temp;
        }
    }
}
System.out.println("Sorted!");