/**
 * Sorting Algorithms - Learning Path
 * Learn fundamental sorting techniques with visualizations
 */

export const SORTING_PATH = {
    id: 'sorting',
    title: 'Sorting Algorithms',
    icon: '📈',
    description: 'Organize your data efficiently! Master Bubble Sort, Selection Sort, and Insertion Sort.',
    prerequisites: ['searching'],
    lessons: [
        {
            id: 'bubble-sort',
            title: 'Bubble Sort',
            duration: '7 min',
            explanation: [
                {
                    type: 'text',
                    content: '**Bubble Sort** is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements, and swaps them if they\'re in the wrong order.'
                },
                {
                    type: 'tip',
                    content: 'It\'s called "Bubble" Sort because larger elements "bubble up" to the end of the array like bubbles rising in water!'
                }
            ],
            keyConcepts: [
                'Compare adjacent elements',
                'Swap if in wrong order',
                'Repeat until no swaps needed',
                'Time complexity: O(n²)'
            ],
            code: {
                python: `# Python - Bubble Sort
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
                swapped = True
        if not swapped: break
    return arr`,
                javascript: `// JavaScript - Bubble Sort
function bubbleSort(arr) {
    let n = arr.length;
    for (let i = 0; i < n; i++) {
        let swapped = false;
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swapped = true;
            }
        }
        if (!swapped) break;
    }
    return arr;
}`,
                java: `// Java - Bubble Sort
public class Main {
    public static void bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n; i++) {
            boolean swapped = false;
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    swapped = true;
                }
            }
            if (!swapped) break;
        }
    }
}`,
                c: `// C - Bubble Sort
void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n; i++) {
        int swapped = 0;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                swapped = 1;
            }
        }
        if (!swapped) break;
    }
}`,
                cpp: `// C++ - Bubble Sort
#include <vector>
#include <algorithm>

void bubbleSort(std::vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n; i++) {
        bool swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                std::swap(arr[j], arr[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) break;
    }
}`,
                go: `// Go - Bubble Sort
func bubbleSort(arr []int) {
    n := len(arr)
    for i := 0; i < n; i++ {
        swapped := false
        for j := 0; j < n-i-1; j++ {
            if arr[j] > arr[j+1] {
                arr[j], arr[j+1] = arr[j+1], arr[j]
                swapped = true
            }
        }
        if !swapped { break }
    }
}`,
                typescript: `// TypeScript - Bubble Sort
function bubbleSort(arr: number[]): number[] {
    let n: number = arr.length;
    for (let i: number = 0; i < n; i++) {
        let swapped: boolean = false;
        for (let j: number = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swapped = true;
            }
        }
        if (!swapped) break;
    }
    return arr;
}`
            },
            syntaxDiff: 'Python and Go support multi-variable swap `a, b = b, a`. JavaScript/TypeScript use destructuring `[a, b] = [b, a]`.',
            quiz: [
                {
                    question: 'What is the time complexity of Bubble Sort?',
                    options: ['O(1)', 'O(n)', 'O(n log n)', 'O(n²)'],
                    correct: 3,
                    explanation: 'Bubble Sort has O(n²) time complexity due to the nested loops.'
                }
            ]
        },
        {
            id: 'selection-sort',
            title: 'Selection Sort',
            duration: '7 min',
            explanation: [
                {
                    type: 'text',
                    content: '**Selection Sort** repeatedly finds the minimum element and moves it to the sorted part.'
                }
            ],
            keyConcepts: [
                'Find minimum in unsorted portion',
                'Swap it with first unsorted element',
                'Time complexity: O(n²)'
            ],
            code: {
                python: `# Python - Selection Sort
def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr`,
                javascript: `// JavaScript - Selection Sort
function selectionSort(arr) {
    let n = arr.length;
    for (let i = 0; i < n; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
    return arr;
}`,
                java: `// Java - Selection Sort
public class Main {
    public static void selectionSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n; i++) {
            int minIdx = i;
            for (int j = i + 1; j < n; j++) {
                if (arr[j] < arr[minIdx]) minIdx = j;
            }
            int temp = arr[i];
            arr[i] = arr[minIdx];
            arr[minIdx] = temp;
        }
    }
}`,
                c: `// C - Selection Sort
void selectionSort(int arr[], int n) {
    for (int i = 0; i < n; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        int temp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = temp;
    }
}`,
                cpp: `// C++ - Selection Sort
#include <vector>
#include <algorithm>

void selectionSort(std::vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n; i++) {
        int min_idx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[min_idx]) min_idx = j;
        }
        std::swap(arr[i], arr[min_idx]);
    }
}`,
                go: `// Go - Selection Sort
func selectionSort(arr []int) {
    n := len(arr)
    for i := 0; i < n; i++ {
        minIdx := i
        for j := i+1; j < n; j++ {
            if arr[j] < arr[minIdx] { minIdx = j }
        }
        arr[i], arr[minIdx] = arr[minIdx], arr[i]
    }
}`,
                typescript: `// TypeScript - Selection Sort
function selectionSort(arr: number[]): number[] {
    let n: number = arr.length;
    for (let i: number = 0; i < n; i++) {
        let minIdx: number = i;
        for (let j: number = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
    return arr;
}`
            },
            syntaxDiff: 'Selection sort makes exactly n swaps, regardless of the initial order.',
            quiz: [
                {
                    question: 'How many swaps does Selection Sort make for n elements?',
                    options: ['n²', 'n log n', 'At most n', 'Always n/2'],
                    correct: 2,
                    explanation: 'Selection Sort makes exactly one swap per pass through the array, totaling O(n) swaps.'
                }
            ]
        }
    ]
};
