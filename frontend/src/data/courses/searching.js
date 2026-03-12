/**
 * Searching Algorithms - Learning Path
 * Learn how to find elements in arrays efficiently
 */

export const SEARCHING_PATH = {
    id: 'searching',
    title: 'Searching Algorithms',
    icon: '🔍',
    description: 'Master the art of finding elements - from simple linear search to efficient binary search!',
    prerequisites: ['strings'],
    lessons: [
        {
            id: 'linear-search',
            title: 'Linear Search',
            duration: '6 min',
            explanation: [
                {
                    type: 'text',
                    content: '**Linear Search** is the simplest search algorithm. You check each element one by one until you find what you\'re looking for.'
                },
                {
                    type: 'tip',
                    content: 'Think of it like looking for a book on a shelf - you start from one end and check each book until you find it!'
                },
                {
                    type: 'text',
                    content: 'Linear search works on ANY array (sorted or unsorted). Its time complexity is O(n) - in the worst case, you check every element.'
                }
            ],
            keyConcepts: [
                'Check each element from start to end',
                'Return index when found, -1 if not found',
                'Works on unsorted arrays',
                'Time complexity: O(n)'
            ],
            code: {
                python: `# Python - Linear Search
def linear_search(arr, target):
    """Find target in array, return index or -1"""
    for i in range(len(arr)):
        if arr[i] == target:
            return i  # Found it!
    return -1  # Not found

# Test it
numbers = [10, 25, 30, 45, 50]
print(f"Index: {linear_search(numbers, 30)}")`,
                javascript: `// JavaScript - Linear Search
function linearSearch(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) return i;
    }
    return -1;
}

let numbers = [10, 25, 30, 45, 50];
console.log("Index:", linearSearch(numbers, 30));`,
                java: `// Java - Linear Search
public class Main {
    public static int linearSearch(int[] arr, int target) {
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] == target) return i;
        }
        return -1;
    }
    public static void main(String[] args) {
        int[] numbers = {10, 25, 30, 45, 50};
        System.out.println("Index: " + linearSearch(numbers, 30));
    }
}`,
                c: `// C - Linear Search
#include <stdio.h>

int linearSearch(int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}

int main() {
    int numbers[] = {10, 25, 30, 45, 50};
    printf("Index: %d\\n", linearSearch(numbers, 5, 30));
    return 0;
}`,
                cpp: `// C++ - Linear Search
#include <iostream>
#include <vector>

int linearSearch(const std::vector<int>& arr, int target) {
    for (int i = 0; i < arr.size(); i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}

int main() {
    std::vector<int> numbers = {10, 25, 30, 45, 50};
    std::cout << "Index: " << linearSearch(numbers, 30) << "\\n";
    return 0;
}`,
                go: `// Go - Linear Search
package main
import "fmt"

func linearSearch(arr []int, target int) int {
    for i, val := range arr {
        if val == target {
            return i
        }
    }
    return -1
}

func main() {
    numbers := []int{10, 25, 30, 45, 50}
    fmt.Println("Index:", linearSearch(numbers, 30))
}`,
                typescript: `// TypeScript - Linear Search
function linearSearch(arr: number[], target: number): number {
    for (let i: number = 0; i < arr.length; i++) {
        if (arr[i] === target) return i;
    }
    return -1;
}

let numbers: number[] = [10, 25, 30, 45, 50];
console.log("Index:", linearSearch(numbers, 30));`
            },
            syntaxDiff: 'Linear search is straightforward in all languages. Go uses the "range" keyword for easy iteration.',
            quiz: [
                {
                    question: 'What is the time complexity of linear search?',
                    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
                    correct: 2,
                    explanation: 'Linear search is O(n) because in the worst case, you check every single element in the array.'
                }
            ]
        },
        {
            id: 'binary-search',
            title: 'Binary Search',
            duration: '8 min',
            explanation: [
                {
                    type: 'text',
                    content: '**Binary Search** is a fast search algorithm for **sorted arrays**. It repeatedly divides the search space in half.'
                },
                {
                    type: 'warning',
                    content: 'Binary search ONLY works on sorted arrays! If the array is unsorted, you must sort it first or use linear search.'
                }
            ],
            keyConcepts: [
                'Requires a SORTED array',
                'Compare with middle element',
                'Search range is halved each step',
                'Time complexity: O(log n)'
            ],
            code: {
                python: `# Python - Binary Search
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

numbers = [10, 20, 30, 40, 50, 60]
print(f"Index: {binary_search(numbers, 40)}")`,
                javascript: `// JavaScript - Binary Search
function binarySearch(arr, target) {
    let left = 0, right = arr.length - 1;
    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

let numbers = [10, 20, 30, 40, 50, 60];
console.log("Index:", binarySearch(numbers, 40));`,
                java: `// Java - Binary Search
public class Main {
    public static int binarySearch(int[] arr, int target) {
        int left = 0, right = arr.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (arr[mid] == target) return mid;
            else if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
    public static void main(String[] args) {
        int[] numbers = {10, 20, 30, 40, 50, 60};
        System.out.println("Index: " + binarySearch(numbers, 40));
    }
}`,
                c: `// C - Binary Search
#include <stdio.h>

int binarySearch(int arr[], int n, int target) {
    int left = 0, right = n - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

int main() {
    int numbers[] = {10, 20, 30, 40, 50, 60};
    printf("Index: %d\\n", binarySearch(numbers, 6, 40));
    return 0;
}`,
                cpp: `// C++ - Binary Search
#include <iostream>
#include <vector>

int binarySearch(const std::vector<int>& arr, int target) {
    int left = 0, right = arr.size() - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

int main() {
    std::vector<int> numbers = {10, 20, 30, 40, 50, 60};
    std::cout << "Index: " << binarySearch(numbers, 40) << "\\n";
    return 0;
}`,
                go: `// Go - Binary Search
package main
import "fmt"

func binarySearch(arr []int, target int) int {
    left, right := 0, len(arr)-1
    for left <= right {
        mid := left + (right-left)/2
        if arr[mid] == target {
            return mid
        } else if arr[mid] < target {
            left = mid + 1
        } else {
            right = mid - 1
        }
    }
    return -1
}

func main() {
    numbers := []int{10, 20, 30, 40, 50, 60}
    fmt.Println("Index:", binarySearch(numbers, 40))
}`,
                typescript: `// TypeScript - Binary Search
function binarySearch(arr: number[], target: number): number {
    let left: number = 0, right: number = arr.length - 1;
    while (left <= right) {
        let mid: number = Math.floor((left + right) / 2);
        if (arr[mid] === target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

let numbers: number[] = [10, 20, 30, 40, 50, 60];
console.log("Index:", binarySearch(numbers, 40));`
            },
            syntaxDiff: 'Python uses // for integer division. Java/C/C++ perform integer division by default on ints.',
            quiz: [
                {
                    question: 'What is required for binary search to work?',
                    options: ['An unsorted array', 'A sorted array', 'An array of strings', 'An empty array'],
                    correct: 1,
                    explanation: 'Binary search requires a SORTED array to determine which direction to move.'
                }
            ]
        }
    ]
};
