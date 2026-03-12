/**
 * Hash Maps / Dictionaries - Learning Path
 * Essential data structure for real-world programming
 */

export const HASHMAPS_PATH = {
    id: 'hashmaps',
    title: 'Hash Maps & Dictionaries',
    icon: '🗂️',
    description: 'Learn key-value storage — the most practical data structure used in almost every real-world application.',
    prerequisites: ['recursion'],
    lessons: [
        {
            id: 'hashmap-concept',
            title: 'What is a Hash Map?',
            duration: '6 min',
            explanation: [
                {
                    type: 'text',
                    content: 'A **Hash Map** (called **Dictionary** in Python, **Map** in JavaScript) stores data as **key-value pairs**. You look up values using unique keys — like a phone book where the name is the key and the number is the value.'
                },
                {
                    type: 'tip',
                    content: 'Hash maps give O(1) average lookup time! Arrays need O(n) to find an item, but hash maps find it instantly by key.'
                }
            ],
            keyConcepts: [
                'Stores key-value pairs',
                'O(1) average lookup time',
                'Keys must be unique'
            ],
            code: {
                python: `# Python Dictionary
student = {
    "name": "Alice",
    "age": 20
}

# Access
print(student["name"])

# Add/Update
student["email"] = "alice@example.com"

# Check existence
print("name" in student)`,
                javascript: `// JavaScript Object/Map
let student = {
    name: "Alice",
    age: 20
};

// Access
console.log(student.name);

// Add/Update
student.email = "alice@example.com";

// Check existence
console.log("name" in student);`,
                java: `// Java HashMap
import java.util.HashMap;

public class Main {
    public static void main(String[] args) {
        HashMap<String, String> student = new HashMap<>();
        student.put("name", "Alice");
        
        // Access
        System.out.println(student.get("name"));
        
        // Check existence
        System.out.println(student.containsKey("name"));
    }
}`,
                c: `// C - Simple Hash Map (Concept)
#include <stdio.h>
#include <string.h>

// In C, you usually need a library or custom implementation
// For this lesson, we use a simple array-based approach
int main() {
    printf("C requires custom Hash Map implementation.\\n");
    return 0;
}`,
                cpp: `// C++ unordered_map
#include <iostream>
#include <unordered_map>
#include <string>

int main() {
    std::unordered_map<std::string, int> student;
    student["age"] = 20;
    
    // Access
    std::cout << student["age"] << "\\n";
    
    // Check existence
    if (student.find("age") != student.end()) {
        std::cout << "Found!\\n";
    }
    return 0;
}`,
                go: `// Go Maps
package main
import "fmt"

func main() {
    student := make(map[string]int)
    student["age"] = 20
    
    // Access
    fmt.Println(student["age"])
    
    // Check existence
    age, exists := student["age"]
    fmt.Println("Exists:", exists)
}`,
                typescript: `// TypeScript Map
let student: { [key: string]: any } = {
    name: "Alice",
    age: 20
};

// Access
console.log(student.name);

// Check existence
console.log(student.hasOwnProperty("name"));`
            },
            syntaxDiff: 'Python uses `in`, JavaScript uses `in` or `hasOwnProperty`. C++ uses `find()`. Go uses the comma-ok idiom.',
            quiz: [
                {
                    question: 'What is the average time to look up a value in a hash map?',
                    options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
                    correct: 2,
                    explanation: 'Hash maps use a hash function to directly compute where the value is stored — O(1) average time!'
                }
            ]
        }
    ]
};
