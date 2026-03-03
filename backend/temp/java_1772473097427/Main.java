// Java For Loop
public class Main {
    public static void main(String[] args) {
        int[] numbers = {1, 2, 3, 4, 5};
        int total = 0;

        for (int i = 0; i < numbers.length; i++) {
            total += numbers[i];
            System.out.println("Added " + numbers[i] + " Total: " + total);
        }

        System.out.println("Final Sum: " + total);
    }
}