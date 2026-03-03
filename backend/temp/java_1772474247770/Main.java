// Java Multithreading
class MyThread extends Thread {
    public void run() {
        for (int i = 1; i <= 3; i++) {
            System.out.println(Thread.currentThread().getName() + " - Count: " + i);
            try {
                Thread.sleep(500); // Pause for 500ms
            } catch (InterruptedException e) {
                System.out.println("Thread error");
            }
        }
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println("Starting threads...");
        
        MyThread t1 = new MyThread();
        MyThread t2 = new MyThread();
        
        t1.setName("Thread-A");
        t2.setName("Thread-B");
        
        t1.start();
        t2.start();
        
        System.out.println("Main method finished, but Threads continue running!");
    }
}