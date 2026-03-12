/**
 * Arrays & Lists - Learning Path
 * Second path - requires Basics as prerequisite
 */

export const ARRAYS_PATH = {
    id: 'arrays',
    title: 'Arrays & Lists',
    icon: '📊',
    description: 'Learn how to store and manipulate collections of data - essential for any programmer!',
    prerequisites: ['basics'],
    lessons: [
        {
            id: 'what-is-array',
            title: 'What is an Array?',
            duration: '5 min',
            explanation: [
                {
                    type: 'text',
                    content: 'An **array** (called a **list** in Python) is a collection that stores multiple values in a single variable. Each value has an **index** (position number).'
                },
                {
                    type: 'tip',
                    content: 'Think of an array like a row of mailboxes. Each box has a number (index) and can hold a value.'
                },
                {
                    type: 'warning',
                    content: 'Important: Array indexes start at 0, not 1! The first element is at index 0.'
                }
            ],
            keyConcepts: [
                'Arrays store multiple values in one variable',
                'Each element has an index (starting from 0)',
                'Elements can be accessed by their index'
            ],
            code: {
                python: `# Python Lists (Arrays)
fruits = ["apple", "banana", "cherry", "date"]

# Arrays start at index 0!
print(f"Index 0: {fruits[0]}")  # apple
print(f"Index 1: {fruits[1]}")  # banana
print(f"Index 2: {fruits[2]}")  # cherry

# Check how many items
print(f"Total items: {len(fruits)}")`,
                javascript: `// JavaScript Arrays
let fruits = ["apple", "banana", "cherry", "date"];

// Arrays start at index 0!
console.log("Index 0:", fruits[0]);  // apple
console.log("Index 1:", fruits[1]);  // banana
console.log("Index 2:", fruits[2]);  // cherry

// Check how many items
console.log("Total items:", fruits.length);`,
                java: `// Java Arrays
public class Main {
    public static void main(String[] args) {
        String[] fruits = {"apple", "banana", "cherry", "date"};

        // Arrays start at index 0!
        System.out.println("Index 0: " + fruits[0]); // apple
        System.out.println("Index 1: " + fruits[1]); // banana
        System.out.println("Index 2: " + fruits[2]); // cherry

        // Check how many items
        System.out.println("Total items: " + fruits.length);
    }
}`,
                c: `// C Arrays
#include <stdio.h>

int main() {
    // Array of string pointers
    char *fruits[] = {"apple", "banana", "cherry", "date"};

    // Arrays start at index 0!
    printf("Index 0: %s\\n", fruits[0]);
    printf("Index 1: %s\\n", fruits[1]);
    printf("Index 2: %s\\n", fruits[2]);

    // Calculate length (size of array / size of one pointer)
    int length = sizeof(fruits) / sizeof(fruits[0]);
    printf("Total items: %d\\n", length);
    return 0;
}`,
                cpp: `// C++ Arrays (using std::vector for dynamic arrays)
#include <iostream>
#include <vector>
#include <string>

int main() {
    std::vector<std::string> fruits = {"apple", "banana", "cherry", "date"};

    // Arrays start at index 0!
    std::cout << "Index 0: " << fruits[0] << "\\n";
    std::cout << "Index 1: " << fruits[1] << "\\n";
    std::cout << "Index 2: " << fruits[2] << "\\n";

    // Check how many items
    std::cout << "Total items: " << fruits.size() << "\\n";
    return 0;
}`,
                go: `// Go Arrays/Slices
package main
import "fmt"

func main() {
    // Using a slice (dynamic array)
    fruits := []string{"apple", "banana", "cherry", "date"}

    // Arrays start at index 0!
    fmt.Println("Index 0:", fruits[0])
    fmt.Println("Index 1:", fruits[1])
    fmt.Println("Index 2:", fruits[2])

    // Check how many items
    fmt.Println("Total items:", len(fruits))
}`,
                typescript: `// TypeScript Arrays
let fruits: string[] = ["apple", "banana", "cherry", "date"];

// Arrays start at index 0!
console.log("Index 0:", fruits[0]);  // apple
console.log("Index 1:", fruits[1]);  // banana
console.log("Index 2:", fruits[2]);  // cherry

// Check how many items
console.log("Total items:", fruits.length);`
            },
            syntaxDiff: 'Python uses len(arr) for length, JavaScript uses arr.length. Both count from index 0!',
            quiz: [
                {
                    question: 'What index does the FIRST element of an array have?',
                    options: ['1', '0', '-1', 'first'],
                    correct: 1,
                    explanation: 'Arrays always start counting from 0. The first element is at index 0, second at index 1, etc.'
                },
                {
                    question: 'In ["a", "b", "c"], what is at index 2?',
                    options: ['"a"', '"b"', '"c"', 'Error'],
                    correct: 2,
                    explanation: 'Index 0="a", Index 1="b", Index 2="c". Remember, counting starts at 0!'
                }
            ]
        },
        {
            id: 'access-elements',
            title: 'Accessing Array Elements',
            duration: '6 min',
            explanation: [
                {
                    type: 'text',
                    content: 'To access an element, use its **index** in square brackets: array[index]. You can also access from the end using negative indices.'
                },
                {
                    type: 'tip',
                    content: 'Use -1 to get the LAST element, -2 for second-to-last, and so on!'
                },
                {
                    type: 'text',
                    content: 'You can also **change** values by assigning to a specific index: array[1] = "new value"'
                }
            ],
            keyConcepts: [
                'Use brackets [index] to access elements',
                'Negative indices count from the end',
                'You can modify elements by assigning to an index'
            ],
            code: {
                python: `# Python - Accessing Elements
numbers = [10, 20, 30, 40, 50]

# Access by index
first = numbers[0]    # 10
third = numbers[2]    # 30
last = numbers[-1]    # 50 (negative index!)

print(f"First: {first}")
print(f"Third: {third}")
print(f"Last: {last}")

# Modify an element
numbers[1] = 25
print(f"After change: {numbers}")`,
                javascript: `// JavaScript - Accessing Elements
let numbers = [10, 20, 30, 40, 50];

// Access by index
let first = numbers[0];              // 10
let third = numbers[2];              // 30
let last = numbers[numbers.length-1]; // 50

console.log("First:", first);
console.log("Third:", third);
console.log("Last:", last);

// Modify an element
numbers[1] = 25;
console.log("After change:", numbers);`,
                java: `// Java - Accessing Elements
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] numbers = {10, 20, 30, 40, 50};

        // Access by index
        int first = numbers[0];
        int third = numbers[2];
        int last = numbers[numbers.length - 1];

        System.out.println("First: " + first);
        System.out.println("Third: " + third);
        System.out.println("Last: " + last);

        // Modify an element
        numbers[1] = 25;
        System.out.println("After change: " + Arrays.toString(numbers));
    }
}`,
                c: `// C - Accessing Elements
#include <stdio.h>

int main() {
    int numbers[] = {10, 20, 30, 40, 50};
    int length = sizeof(numbers) / sizeof(numbers[0]);

    // Access by index
    int first = numbers[0];
    int third = numbers[2];
    int last = numbers[length - 1];

    printf("First: %d\\n", first);
    printf("Third: %d\\n", third);
    printf("Last: %d\\n", last);

    // Modify an element
    numbers[1] = 25;
    printf("Second item is now: %d\\n", numbers[1]);
    return 0;
}`,
                cpp: `// C++ - Accessing Elements
#include <iostream>
#include <vector>

int main() {
    std::vector<int> numbers = {10, 20, 30, 40, 50};

    // Access by index
    int first = numbers[0];
    int third = numbers[2];
    int last = numbers.back(); // Or numbers[numbers.size() - 1]

    std::cout << "First: " << first << "\\n";
    std::cout << "Third: " << third << "\\n";
    std::cout << "Last: " << last << "\\n";

    // Modify an element
    numbers[1] = 25;
    std::cout << "Second item is now: " << numbers[1] << "\\n";
    return 0;
}`,
                go: `// Go - Accessing Elements
package main
import "fmt"

func main() {
    numbers := []int{10, 20, 30, 40, 50}

    // Access by index
    first := numbers[0]
    third := numbers[2]
    last := numbers[len(numbers)-1]

    fmt.Println("First:", first)
    fmt.Println("Third:", third)
    fmt.Println("Last:", last)

    // Modify an element
    numbers[1] = 25
    fmt.Println("After change:", numbers)
}`,
                typescript: `// TypeScript - Accessing Elements
let numbers: number[] = [10, 20, 30, 40, 50];

// Access by index
let first = numbers[0];              // 10
let third = numbers[2];              // 30
let last = numbers[numbers.length-1]; // 50

console.log("First:", first);
console.log("Third:", third);
console.log("Last:", last);

// Modify an element
numbers[1] = 25;
console.log("After change:", numbers);`
            },
            syntaxDiff: 'Python supports negative indices directly (arr[-1]). JavaScript needs arr[arr.length-1] for the last element.',
            quiz: [
                {
                    question: 'What does numbers[-1] return in Python for [10, 20, 30]?',
                    options: ['10', '20', '30', 'Error'],
                    correct: 2,
                    explanation: '-1 means the LAST element. In [10, 20, 30], the last element is 30.'
                },
                {
                    question: 'How do you change the second element to 99?',
                    options: [
                        'array[1] = 99',
                        'array[2] = 99',
                        'array.set(1, 99)',
                        'array = 99'
                    ],
                    correct: 0,
                    explanation: 'The second element is at index 1 (remember, counting starts at 0). Use array[1] = 99.'
                }
            ]
        },
        {
            id: 'modify-arrays',
            title: 'Adding & Removing Elements',
            duration: '7 min',
            explanation: [
                {
                    type: 'text',
                    content: 'Arrays can be dynamic - you can **add** new elements and **remove** existing ones. The most common operations are adding/removing from the end.'
                },
                {
                    type: 'tip',
                    content: 'append/push adds to the END. pop removes from the END. Think of a stack of plates!'
                },
                {
                    type: 'text',
                    content: 'You can also add/remove from specific positions using insert and remove/splice methods.'
                }
            ],
            keyConcepts: [
                'append/push adds to the end',
                'pop removes from the end',
                'insert adds at a specific position'
            ],
            code: {
                python: `# Python - Modifying Lists
fruits = ["apple", "banana"]
print(f"Start: {fruits}")

# Add to end
fruits.append("cherry")
print(f"After append: {fruits}")

# Remove from end
removed = fruits.pop()
print(f"Popped: {removed}")
print(f"After pop: {fruits}")

# Insert at specific position
fruits.insert(1, "grape")
print(f"After insert at 1: {fruits}")`,
                javascript: `// JavaScript - Modifying Arrays
let fruits = ["apple", "banana"];
console.log("Start:", fruits);

// Add to end
fruits.push("cherry");
console.log("After push:", fruits);

// Remove from end
let removed = fruits.pop();
console.log("Popped:", removed);
console.log("After pop:", fruits);

// Insert at specific position
fruits.splice(1, 0, "grape");
console.log("After insert at 1:", fruits);`,
                java: `// Java - Modifying Arrays (using ArrayList)
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<String> fruits = new ArrayList<>();
        fruits.add("apple");
        fruits.add("banana");
        System.out.println("Start: " + fruits);

        // Add to end
        fruits.add("cherry");
        System.out.println("After add: " + fruits);

        // Remove from end
        String removed = fruits.remove(fruits.size() - 1);
        System.out.println("Removed: " + removed);
        System.out.println("After remove: " + fruits);

        // Insert at specific position
        fruits.add(1, "grape");
        System.out.println("After insert at 1: " + fruits);
    }
}`,
                c: `// C - Modifying Arrays
#include <stdio.h>
#include <string.h>

int main() {
    // Array with max capacity 10
    char fruits[10][20] = {"apple", "banana"};
    int count = 2;

    // Add to end
    strcpy(fruits[count], "cherry");
    count++;
    printf("Added cherry. Count is now %d\\n", count);

    // Remove from end
    count--;
    printf("Removed last item. Count is now %d\\n", count);

    return 0;
}`,
                cpp: `// C++ - Modifying Arrays (std::vector)
#include <iostream>
#include <vector>
#include <string>

int main() {
    std::vector<std::string> fruits = {"apple", "banana"};

    // Add to end
    fruits.push_back("cherry");

    // Remove from end
    std::string removed = fruits.back();
    fruits.pop_back();

    // Insert at specific position
    fruits.insert(fruits.begin() + 1, "grape");

    std::cout << "Second item is now: " << fruits[1] << "\\n";
    return 0;
}`,
                go: `// Go - Modifying Slices
package main
import "fmt"

func main() {
    fruits := []string{"apple", "banana"}
    fmt.Println("Start:", fruits)

    // Add to end
    fruits = append(fruits, "cherry")
    fmt.Println("After append:", fruits)

    // Remove from end
    removed := fruits[len(fruits)-1]
    fruits = fruits[:len(fruits)-1]
    fmt.Println("Removed:", removed)

    // Insert at specific position
    fruits = append(fruits[:1+1], fruits[1:]...)
    fruits[1] = "grape"
    fmt.Println("After insert at 1:", fruits)
}`,
                typescript: `// TypeScript - Modifying Arrays
let fruits: string[] = ["apple", "banana"];
console.log("Start:", fruits);

// Add to end
fruits.push("cherry");
console.log("After push:", fruits);

// Remove from end
let removed = fruits.pop();
console.log("Popped:", removed);
console.log("After pop:", fruits);

// Insert at specific position
fruits.splice(1, 0, "grape");
console.log("After insert at 1:", fruits);`
            },
            syntaxDiff: 'Python uses append(), JavaScript uses push(). For inserting, Python uses insert(index, value), JavaScript uses splice(index, 0, value).',
            quiz: [
                {
                    question: 'Which method adds an element to the END of an array?',
                    options: ['insert', 'append/push', 'add', 'extend'],
                    correct: 1,
                    explanation: 'append() in Python and push() in JavaScript both add to the END of the array.'
                },
                {
                    question: 'What does pop() remove?',
                    options: [
                        'The first element',
                        'The last element',
                        'A random element',
                        'All elements'
                    ],
                    correct: 1,
                    explanation: 'pop() removes and returns the LAST element from the array.'
                }
            ]
        },
        {
            id: 'traverse-array',
            title: 'Traversing Arrays (Loops)',
            duration: '6 min',
            explanation: [
                {
                    type: 'text',
                    content: 'To process every element in an array, we **traverse** (loop through) it. You can use a for loop to visit each element one by one.'
                },
                {
                    type: 'tip',
                    content: 'There are two main ways: loop through indices (0, 1, 2...) or loop directly through values.'
                },
                {
                    type: 'text',
                    content: 'Looping through indices is useful when you need to know the position. Looping through values is cleaner when you only need the data.'
                }
            ],
            keyConcepts: [
                'Use loops to visit every element',
                'Index loops give you position information',
                'Value loops are cleaner for simple iteration'
            ],
            code: {
                python: `# Python - Traversing Lists
fruits = ["apple", "banana", "cherry"]

# Method 1: Loop through values
print("Loop through values:")
for fruit in fruits:
    print(f"  {fruit}")

# Method 2: Loop through indices
print("Loop with indices:")
for i in range(len(fruits)):
    print(f"  Index {i}: {fruits[i]}")`,
                javascript: `// JavaScript - Traversing Arrays
let fruits = ["apple", "banana", "cherry"];

// Method 1: Loop through values
console.log("Loop through values:");
for (let fruit of fruits) {
    console.log("  " + fruit);
}

// Method 2: Loop through indices
console.log("Loop with indices:");
for (let i = 0; i < fruits.length; i++) {
    console.log("  Index " + i + ": " + fruits[i]);
}`,
                java: `// Java - Traversing Arrays
public class Main {
    public static void main(String[] args) {
        String[] fruits = {"apple", "banana", "cherry"};

        // Method 1: Enhanced for loop (foreach)
        System.out.println("Loop through values:");
        for (String fruit : fruits) {
            System.out.println("  " + fruit);
        }

        // Method 2: Standard for loop (indices)
        System.out.println("Loop with indices:");
        for (int i = 0; i < fruits.length; i++) {
            System.out.println("  Index " + i + ": " + fruits[i]);
        }
    }
}`,
                c: `// C - Traversing Arrays
#include <stdio.h>

int main() {
    char *fruits[] = {"apple", "banana", "cherry"};
    int length = sizeof(fruits) / sizeof(fruits[0]);

    printf("Loop with indices:\\n");
    for (int i = 0; i < length; i++) {
        printf("  Index %d: %s\\n", i, fruits[i]);
    }

    return 0;
}`,
                cpp: `// C++ - Traversing Arrays (std::vector)
#include <iostream>
#include <vector>
#include <string>

int main() {
    std::vector<std::string> fruits = {"apple", "banana", "cherry"};

    // Method 1: Range-based for loop (values)
    std::cout << "Loop through values:\\n";
    for (const std::string& fruit : fruits) {
        std::cout << "  " << fruit << "\\n";
    }

    // Method 2: Loop through indices
    std::cout << "Loop with indices:\\n";
    for (size_t i = 0; i < fruits.size(); i++) {
        std::cout << "  Index " << i << ": " << fruits[i] << "\\n";
    }

    return 0;
}`,
                go: `// Go - Traversing Slices
package main
import "fmt"

func main() {
    fruits := []string{"apple", "banana", "cherry"}

    // Method 1: Loop through values
    fmt.Println("Loop through values:")
    for _, fruit := range fruits {
        fmt.Println("  ", fruit)
    }

    // Method 2: Loop through indices
    fmt.Println("Loop with indices:")
    for i, fruit := range fruits {
        fmt.Printf("  Index %d: %s\\n", i, fruit)
    }
}`,
                typescript: `// TypeScript - Traversing Arrays
let fruits: string[] = ["apple", "banana", "cherry"];

// Method 1: Loop through values
console.log("Loop through values:");
for (let fruit of fruits) {
    console.log("  " + fruit);
}

// Method 2: Loop through indices
console.log("Loop with indices:");
for (let i: number = 0; i < fruits.length; i++) {
    console.log("  Index " + i + ": " + fruits[i]);
}`
            },
            syntaxDiff: 'Python uses "for x in list". JavaScript uses "for (let x of array)" for values or classic for loop for indices.',
            quiz: [
                {
                    question: 'What does "for fruit in fruits" do?',
                    options: [
                        'Creates new fruits',
                        'Visits each element in the list one by one',
                        'Sorts the fruits',
                        'Counts the fruits'
                    ],
                    correct: 1,
                    explanation: 'This loop visits each element one by one, assigning it to the variable "fruit" each time.'
                }
            ]
        },
        {
            id: 'find-max',
            title: 'Finding Maximum Value',
            duration: '6 min',
            explanation: [
                {
                    type: 'text',
                    content: 'A common task is finding the **maximum (largest) value** in an array. The algorithm: assume the first is biggest, then check each element.'
                },
                {
                    type: 'tip',
                    content: 'Start with max = first element. For each other element, if it\'s bigger than max, update max!'
                }
            ],
            keyConcepts: [
                'Initialize with the first element',
                'Compare each element to the current max',
                'Update max when you find a bigger value'
            ],
            code: {
                python: `# Python - Find Maximum
numbers = [10, 50, 30, 90, 20]
max_value = numbers[0]

for num in numbers:
    if num > max_value:
        max_value = num

print(f"Maximum is: {max_value}")`,
                javascript: `// JavaScript - Find Maximum
let numbers = [10, 50, 30, 90, 20];
let maxValue = numbers[0];

for (let num of numbers) {
    if (num > maxValue) {
        maxValue = num;
    }
}
console.log("Maximum is:", maxValue);`,
                java: `// Java - Find Maximum
public class Main {
    public static void main(String[] args) {
        int[] numbers = {10, 50, 30, 90, 20};
        int maxValue = numbers[0];

        for (int num : numbers) {
            if (num > maxValue) maxValue = num;
        }
        System.out.println("Maximum is: " + maxValue);
    }
}`,
                c: `// C - Find Maximum
#include <stdio.h>

int main() {
    int numbers[] = {10, 50, 30, 90, 20};
    int max = numbers[0];
    for(int i = 0; i < 5; i++) {
        if(numbers[i] > max) max = numbers[i];
    }
    printf("Max: %d\\n", max);
    return 0;
}`,
                cpp: `// C++ - Find Maximum
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> numbers = {10, 50, 30, 90, 20};
    int max_val = numbers[0];
    for(int num : numbers) {
        if(num > max_val) max_val = num;
    }
    std::cout << "Max: " << max_val << "\\n";
    return 0;
}`,
                go: `// Go - Find Maximum
package main
import "fmt"

func main() {
    numbers := []int{10, 50, 30, 90, 20}
    max := numbers[0]
    for _, num := range numbers {
        if num > max {
            max = num
        }
    }
    fmt.Println("Max:", max)
}`,
                typescript: `// TypeScript - Find Maximum
let numbers: number[] = [10, 50, 30, 90, 20];
let maxValue: number = numbers[0];

for (let num of numbers) {
    if (num > maxValue) {
        maxValue = num;
    }
}
console.log("Maximum is:", maxValue);`
            },
            syntaxDiff: 'The algorithm is identical across languages: store first element, loop and compare.',
            quiz: [
                {
                    question: 'Why start with the first element?',
                    options: ['Standard practice', 'Guarantees comparison with valid element', 'Faster', 'Saves memory'],
                    correct: 1,
                    explanation: 'Starting with numbers[0] ensures your initial max value actually exists in the array.'
                }
            ]
        },
        {
            id: 'multi-dimensional',
            title: '2D Arrays (Grids)',
            duration: '10 min',
            explanation: [
                {
                    type: 'text',
                    content: 'A **2D array** is an array of arrays, forming a grid with rows and columns.'
                }
            ],
            keyConcepts: [
                'Rows and columns',
                'Access with arr[row][col]',
                'Used for grids, games, and matrices'
            ],
            code: {
                python: `matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]
print(matrix[0][1]) # 2 (Row 0, Col 1)`,
                javascript: `let matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];
console.log(matrix[0][1]); // 2`,
                java: `int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};
System.out.println(matrix[0][1]);`,
                c: `int matrix[3][3] = {{1,2,3},{4,5,6},{7,8,9}};
printf("%d", matrix[0][1]);`,
                cpp: `std::vector<std::vector<int>> matrix = {{1,2,3},{4,5,6},{7,8,9}};
std::cout << matrix[0][1];`,
                go: `matrix := [][]int{{1,2,3},{4,5,6},{7,8,9}}
fmt.Println(matrix[0][1])`,
                typescript: `let matrix: number[][] = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];
console.log(matrix[0][1]);`
            },
            syntaxDiff: 'Most languages use [row][col] syntax.',
            quiz: [
                {
                    question: 'What is matrix[1][0] in [[1,2],[3,4]]?',
                    options: ['1', '2', '3', '4'],
                    correct: 2,
                    explanation: 'Row 1 is [3, 4], Col 0 is 3.'
                }
            ]
        }
    ]
};
