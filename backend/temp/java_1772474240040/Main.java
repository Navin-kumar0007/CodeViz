// Java Object-Oriented Programming
class Car {
    String brand;
    int year;

    Car(String b, int y) {
        brand = b;
        year = y;
    }

    void displayInfo() {
        System.out.println("Car: " + brand + ", Year: " + year);
    }
}

public class Main {
    public static void main(String[] args) {
        // Creating objects from the Car class
        Car myCar1 = new Car("Toyota", 2020);
        Car myCar2 = new Car("Honda", 2022);

        // Calling methods
        myCar1.displayInfo();
        myCar2.displayInfo();
    }
}