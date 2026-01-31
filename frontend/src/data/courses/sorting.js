/**
 * Sorting Algorithms - Learning Path
 * Learn fundamental sorting techniques with visualizations
 */

export const SORTING_PATH = {
    id: 'sorting',
    title: 'Sorting Algorithms',
    icon: '📈',
    description: 'Organize your data efficiently! Master Bubble Sort, Selection Sort, and Insertion Sort.',
    prerequisites: ['searching'],  // Unlock after Searching Algorithms
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
                },
                {
                    type: 'warning',
                    content: 'Bubble Sort is O(n²) - not efficient for large arrays, but great for learning!'
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
        # Track if any swaps happened
        swapped = False
        
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                # Swap elements
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
                print(f"Swapped {arr[j+1]} and {arr[j]}: {arr}")
        
        if not swapped:
            break  # Already sorted!
    
    return arr

# Test it
numbers = [64, 34, 25, 12, 22]
print(f"Original: {numbers}")
sorted_arr = bubble_sort(numbers.copy())
print(f"Sorted: {sorted_arr}")`,
                javascript: `// JavaScript - Bubble Sort
function bubbleSort(arr) {
    let n = arr.length;
    
    for (let i = 0; i < n; i++) {
        // Track if any swaps happened
        let swapped = false;
        
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                // Swap elements
                let temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                swapped = true;
                console.log("Swapped:", arr);
            }
        }
        
        if (!swapped) break;  // Already sorted!
    }
    
    return arr;
}

// Test it
let numbers = [64, 34, 25, 12, 22];
console.log("Original:", numbers);
let sortedArr = bubbleSort([...numbers]);
console.log("Sorted:", sortedArr);`
            },
            syntaxDiff: 'Python swaps in one line (a, b = b, a). JavaScript needs a temporary variable.',
            quiz: [
                {
                    question: 'Why is it called Bubble Sort?',
                    options: [
                        'Because it makes bubble sounds',
                        'Because larger elements bubble up to the end',
                        'Because it uses circular patterns',
                        'Because it was invented with soapy water'
                    ],
                    correct: 1,
                    explanation: 'Larger elements gradually move (bubble up) to the end of the array with each pass.'
                },
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
                    content: '**Selection Sort** divides the array into sorted and unsorted parts. It repeatedly finds the minimum from the unsorted part and puts it at the beginning.'
                },
                {
                    type: 'tip',
                    content: 'Imagine sorting playing cards: pick the smallest card and put it first, then the next smallest, and so on!'
                },
                {
                    type: 'text',
                    content: 'Selection Sort does fewer swaps than Bubble Sort (only one swap per pass), but still has O(n²) complexity.'
                }
            ],
            keyConcepts: [
                'Find minimum in unsorted portion',
                'Swap it with first unsorted element',
                'Move boundary one position right',
                'Time complexity: O(n²), but fewer swaps'
            ],
            code: {
                python: `# Python - Selection Sort
def selection_sort(arr):
    n = len(arr)
    
    for i in range(n):
        # Find minimum in remaining unsorted portion
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        
        # Swap with first unsorted position
        if min_idx != i:
            arr[i], arr[min_idx] = arr[min_idx], arr[i]
            print(f"Placed {arr[i]} at index {i}: {arr}")
    
    return arr

# Test it
numbers = [64, 25, 12, 22, 11]
print(f"Original: {numbers}")
sorted_arr = selection_sort(numbers.copy())
print(f"Sorted: {sorted_arr}")`,
                javascript: `// JavaScript - Selection Sort
function selectionSort(arr) {
    let n = arr.length;
    
    for (let i = 0; i < n; i++) {
        // Find minimum in remaining unsorted portion
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        
        // Swap with first unsorted position
        if (minIdx !== i) {
            let temp = arr[i];
            arr[i] = arr[minIdx];
            arr[minIdx] = temp;
            console.log("Placed " + arr[i] + " at index " + i + ":", arr);
        }
    }
    
    return arr;
}

// Test it
let numbers = [64, 25, 12, 22, 11];
console.log("Original:", numbers);
let sortedArr = selectionSort([...numbers]);
console.log("Sorted:", sortedArr);`
            },
            syntaxDiff: 'Similar logic in both languages. Selection Sort only does one swap per outer loop iteration.',
            quiz: [
                {
                    question: 'What does Selection Sort do in each pass?',
                    options: [
                        'Swaps all elements',
                        'Finds minimum and puts it in sorted position',
                        'Compares adjacent elements',
                        'Reverses the array'
                    ],
                    correct: 1,
                    explanation: 'Selection Sort finds the minimum element from the unsorted portion and places it at the beginning of the unsorted portion.'
                },
                {
                    question: 'How many swaps does Selection Sort make for n elements?',
                    options: ['n²', 'n log n', 'At most n', 'Always n/2'],
                    correct: 2,
                    explanation: 'Selection Sort makes at most n-1 swaps (one per pass), which is more efficient than Bubble Sort.'
                }
            ]
        },
        {
            id: 'insertion-sort',
            title: 'Insertion Sort',
            duration: '7 min',
            explanation: [
                {
                    type: 'text',
                    content: '**Insertion Sort** builds the sorted array one element at a time. It takes each element and inserts it into its correct position among the previously sorted elements.'
                },
                {
                    type: 'tip',
                    content: 'Like sorting cards in your hand - you pick up each new card and slide it into the right spot among the cards you\'re already holding!'
                },
                {
                    type: 'text',
                    content: 'Insertion Sort is efficient for small or nearly-sorted arrays. It\'s O(n²) in worst case, but O(n) for already-sorted arrays!'
                }
            ],
            keyConcepts: [
                'Build sorted portion from left to right',
                'Take next element, insert into correct position',
                'Shift larger elements to make room',
                'Best case O(n) for nearly-sorted arrays'
            ],
            code: {
                python: `# Python - Insertion Sort
def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]  # Element to insert
        j = i - 1
        
        # Shift larger elements to the right
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        
        # Insert the key
        arr[j + 1] = key
        print(f"Inserted {key}: {arr}")
    
    return arr

# Test it
numbers = [12, 11, 13, 5, 6]
print(f"Original: {numbers}")
sorted_arr = insertion_sort(numbers.copy())
print(f"Sorted: {sorted_arr}")`,
                javascript: `// JavaScript - Insertion Sort
function insertionSort(arr) {
    for (let i = 1; i < arr.length; i++) {
        let key = arr[i];  // Element to insert
        let j = i - 1;
        
        // Shift larger elements to the right
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        
        // Insert the key
        arr[j + 1] = key;
        console.log("Inserted " + key + ":", arr);
    }
    
    return arr;
}

// Test it
let numbers = [12, 11, 13, 5, 6];
console.log("Original:", numbers);
let sortedArr = insertionSort([...numbers]);
console.log("Sorted:", sortedArr);`
            },
            syntaxDiff: 'Both use the same shifting logic. The key is stored, elements shift right, then key is placed.',
            quiz: [
                {
                    question: 'What is the best-case time complexity of Insertion Sort?',
                    options: ['O(1)', 'O(n)', 'O(n log n)', 'O(n²)'],
                    correct: 1,
                    explanation: 'For an already-sorted array, Insertion Sort only needs one comparison per element - O(n)!'
                },
                {
                    question: 'Insertion Sort is most efficient for:',
                    options: [
                        'Large random arrays',
                        'Small or nearly-sorted arrays',
                        'Reverse-sorted arrays',
                        'Arrays with many duplicates'
                    ],
                    correct: 1,
                    explanation: 'Insertion Sort excels with small arrays and nearly-sorted data, where it approaches O(n) performance.'
                }
            ]
        },
        {
            id: 'sort-comparison',
            title: 'Comparing Sorting Algorithms',
            duration: '5 min',
            explanation: [
                {
                    type: 'text',
                    content: 'Each sorting algorithm has strengths and weaknesses. Understanding when to use each is key to efficient programming!'
                },
                {
                    type: 'tip',
                    content: 'In practice, languages use optimized algorithms like QuickSort or MergeSort. These simple sorts are great for learning!'
                }
            ],
            keyConcepts: [
                'Bubble: Simple but slow, good for education',
                'Selection: Fewer swaps, good when memory writes are expensive',
                'Insertion: Great for small/nearly-sorted data',
                'All are O(n²) - not ideal for large datasets'
            ],
            code: {
                python: `# Python - Comparing Sort Algorithms
# All three sorts on the same array

arr = [64, 34, 25, 12, 22]

# Built-in sort (uses Timsort - O(n log n))
sorted_builtin = sorted(arr)
print(f"Built-in sorted: {sorted_builtin}")

# When to use each:
# Bubble Sort: Educational purposes
# Selection Sort: When minimizing swaps matters
# Insertion Sort: Small arrays or nearly sorted data

print("\\nRecommendations:")
print("• < 10 elements: Any works fine")
print("• Nearly sorted: Insertion Sort")
print("• General use: Built-in sort functions")`,
                javascript: `// JavaScript - Comparing Sort Algorithms
// All three sorts on the same array

let arr = [64, 34, 25, 12, 22];

// Built-in sort (implementation varies by engine)
let sortedBuiltin = [...arr].sort((a, b) => a - b);
console.log("Built-in sorted:", sortedBuiltin);

// When to use each:
// Bubble Sort: Educational purposes
// Selection Sort: When minimizing swaps matters
// Insertion Sort: Small arrays or nearly sorted data

console.log("\\nRecommendations:");
console.log("• < 10 elements: Any works fine");
console.log("• Nearly sorted: Insertion Sort");
console.log("• General use: Built-in sort functions");`
            },
            syntaxDiff: 'Python\'s sorted() returns a new sorted list. JavaScript\'s sort() requires a comparator function for numbers.',
            quiz: [
                {
                    question: 'Which sort is best for a nearly-sorted array?',
                    options: ['Bubble Sort', 'Selection Sort', 'Insertion Sort', 'All are equal'],
                    correct: 2,
                    explanation: 'Insertion Sort achieves O(n) performance on nearly-sorted arrays, much better than the others.'
                },
                {
                    question: 'Why should you use built-in sort functions in production?',
                    options: [
                        'They are simpler',
                        'They are optimized (O(n log n)) and well-tested',
                        'They use Bubble Sort',
                        'They are required by law'
                    ],
                    correct: 1,
                    explanation: 'Built-in sorts use optimized algorithms like Timsort or QuickSort with O(n log n) complexity and are thoroughly tested.'
                }
            ]
        }
    ]
};
