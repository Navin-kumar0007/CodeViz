/**
 * Two Pointers & Sliding Window - Learning Path
 * Learn algorithmic patterns to optimize array and string problems
 */

export const TWOPOINTERS_PATH = {
    id: 'twopointers',
    title: 'Two Pointers',
    icon: '👈👉',
    description: 'Master the Two Pointers and Sliding Window techniques to solve Array/String problems in O(N) time.',
    prerequisites: ['arrays', 'strings'],
    lessons: [
        {
            id: 'two-pointers-opposite',
            title: 'Opposite Ends (Two Pointers)',
            duration: '10 min',
            explanation: [
                {
                    type: 'text',
                    content: 'The **Two Pointers** technique involves using two integer variables (often named `left` and `right`) to point to different indices in an array or string.'
                },
                {
                    type: 'tip',
                    content: 'The "Opposite Ends" variation starts `left` at index 0 and `right` at the last index. They step towards each other until they meet in the middle!'
                },
                {
                    type: 'text',
                    content: 'This is incredibly useful for: Reversing an array in-place, checking Palindromes, or finding a pair of numbers that sum to a target in a **Sorted** array.'
                }
            ],
            keyConcepts: [
                'Initialize left = 0, right = length - 1',
                'Loop runs `while left < right`',
                'Moves one or both pointers inward based on a condition',
                'Reduces O(N²) nested loops down to O(N) linear time'
            ],
            code: {
                python: `# Python - Two Sum II (Sorted Array)
def twoSum(numbers, target):
    left, right = 0, len(numbers) - 1
    
    while left < right:
        current_sum = numbers[left] + numbers[right]
        
        if current_sum == target:
            return [left + 1, right + 1] # 1-indexed
        elif current_sum < target:
            left += 1  # Need a bigger sum, move left pointer right
        else:
            right -= 1 # Need a smaller sum, move right pointer left
            
    return []

print(twoSum([2, 7, 11, 15], 9)) # Output: [1, 2]`,
                javascript: `// JavaScript - Two Sum II (Sorted Array)
function twoSum(numbers, target) {
    let left = 0;
    let right = numbers.length - 1;
    
    while (left < right) {
        const sum = numbers[left] + numbers[right];
        
        if (sum === target) {
            return [left + 1, right + 1];
        } else if (sum < target) {
            left++; // Need a bigger sum
        } else {
            right--; // Need a smaller sum
        }
    }
    return [];
}

console.log(twoSum([2, 7, 11, 15], 9)); // [1, 2]`,
                java: `// Java - Two Sum II
public class Main {
    public static int[] twoSum(int[] numbers, int target) {
        int left = 0;
        int right = numbers.length - 1;
        
        while (left < right) {
            int sum = numbers[left] + numbers[right];
            if (sum == target) return new int[]{left + 1, right + 1};
            if (sum < target) left++;
            else right--;
        }
        return new int[]{};
    }
}`,
                cpp: `// C++ - Two Sum II
#include <vector>
using namespace std;

vector<int> twoSum(vector<int>& numbers, int target) {
    int left = 0, right = numbers.size() - 1;
    
    while (left < right) {
        int sum = numbers[left] + numbers[right];
        if (sum == target) return {left + 1, right + 1};
        if (sum < target) left++;
        else right--;
    }
    return {};
}`,
                c: `// C - Two Sum II
#include <stdlib.h>

int* twoSum(int* numbers, int numbersSize, int target, int* returnSize) {
    int left = 0, right = numbersSize - 1;
    int* res = (int*)malloc(2 * sizeof(int));
    *returnSize = 2;
    
    while (left < right) {
        int sum = numbers[left] + numbers[right];
        if (sum == target) {
            res[0] = left + 1; res[1] = right + 1;
            return res;
        }
        if (sum < target) left++;
        else right--;
    }
    *returnSize = 0;
    return NULL;
}`,
                go: `// Go - Two Sum II
func twoSum(numbers []int, target int) []int {
    left, right := 0, len(numbers)-1
    
    for left < right {
        sum := numbers[left] + numbers[right]
        if sum == target {
            return []int{left + 1, right + 1}
        }
        if sum < target {
            left++
        } else {
            right--
        }
    }
    return []int{}
}`,
                typescript: `// TypeScript - Two Sum II
function twoSum(numbers: number[], target: number): number[] {
    let left = 0, right = numbers.length - 1;
    
    while (left < right) {
        const sum = numbers[left] + numbers[right];
        if (sum === target) return [left + 1, right + 1];
        if (sum < target) left++;
        else right--;
    }
    return [];
}`
            },
            syntaxDiff: 'Opposite-ends pointer logic (while left < right) uses basic integers across all languages. The only difference is how arrays/slices are returned.',
            quiz: [
                {
                    question: 'If you want to find two numbers that sum up to a target using the opposite-ends pointer trick, what MUST be true about the array?',
                    options: [
                        'It must contain negative numbers',
                        'It must be sorted mathematically',
                        'It must have an even length',
                        'It must not have duplicates'
                    ],
                    correct: 1,
                    explanation: 'The trick explicitly relies on the array being sorted! If the sum is too small, you move `left` to get a strictly larger number. If the sum is too big, you move `right` to get a strictly smaller number.'
                },
                {
                    question: 'When reversing an array using two pointers (left and right), when does the loop terminate?',
                    options: [
                        'When right reaches 0',
                        'When left crosses or equals right',
                        'When left reaches the end of the array',
                        'When a temporary variable equals left'
                    ],
                    correct: 1,
                    explanation: 'The loop condition is `while (left < right)`. Once `left` meets or crosses `right` in the middle of the array, the entire array has been safely swapped and reversed.'
                }
            ]
        },
        {
            id: 'sliding-window',
            title: 'Sliding Window',
            duration: '12 min',
            explanation: [
                {
                    type: 'text',
                    content: 'The **Sliding Window** technique is a specialized version of Two Pointers. Instead of tracking two single elements, the two pointers (`left` and `right`) form a "window" that bounds a continuous subarray.'
                },
                {
                    type: 'tip',
                    content: 'If a problem asks for finding the longest/shortest "substring", "subarray", or "continuous sequence", there is a 99% chance it is a Sliding Window problem!'
                },
                {
                    type: 'text',
                    content: 'There are two types: **Fixed** windows (where right - left is always a specified length K) and **Variable** windows (where the right pointer expands the window until a condition breaks, then the left pointer shrinks it).'
                }
            ],
            keyConcepts: [
                'Right pointer EXPANDS the window (adds elements)',
                'Left pointer SHRINKS the window (removes elements)',
                'Maintains a running sum, product, or frequency map inside the window boundaries',
                'Changes an O(N²) double loop strictly into an O(N) loop'
            ],
            code: {
                python: `# Python - Variable Sliding Window
# Longest Substring Without Repeating Characters
def lengthOfLongestSubstring(s: str) -> int:
    char_set = set()
    left = 0
    max_len = 0
    
    for right in range(len(s)):
        # Shrink the window if a duplicate is found
        while s[right] in char_set:
            char_set.remove(s[left])
            left += 1
            
        # Add the new character into the window
        char_set.add(s[right])
        
        # Calculate new max window size
        max_len = max(max_len, right - left + 1)
        
    return max_len

print(lengthOfLongestSubstring("abcabcbb")) # 3`,
                javascript: `// JavaScript - Variable Sliding Window
function lengthOfLongestSubstring(s) {
    const charSet = new Set();
    let left = 0;
    let maxLen = 0;
    
    for (let right = 0; right < s.length; right++) {
        while (charSet.has(s[right])) {
            charSet.delete(s[left]);
            left++;
        }
        charSet.add(s[right]);
        maxLen = Math.max(maxLen, right - left + 1);
    }
    return maxLen;
}`,
                java: `// Java - Variable Sliding Window
public int lengthOfLongestSubstring(String s) {
    Set<Character> charSet = new HashSet<>();
    int left = 0, maxLen = 0;
    
    for (int right = 0; right < s.length(); right++) {
        while (charSet.contains(s.charAt(right))) {
            charSet.remove(s.charAt(left));
            left++;
        }
        charSet.add(s.charAt(right));
        maxLen = Math.max(maxLen, right - left + 1);
    }
    return maxLen;
}`,
                cpp: `// C++ - Variable Sliding Window
int lengthOfLongestSubstring(string s) {
    unordered_set<char> charSet;
    int left = 0, maxLen = 0;
    
    for (int right = 0; right < s.length(); right++) {
        while (charSet.count(s[right])) {
            charSet.erase(s[left]);
            left++;
        }
        charSet.insert(s[right]);
        maxLen = max(maxLen, right - left + 1);
    }
    return maxLen;
}`,
                c: `// C - Variable Sliding Window using ASCII array lookup
int lengthOfLongestSubstring(char * s) {
    int chars[128] = {0};
    int left = 0, right = 0, maxLen = 0;
    
    while (s[right] != '\\0') {
        char r = s[right];
        chars[r]++;
        
        while (chars[r] > 1) {
            char l = s[left];
            chars[l]--;
            left++;
        }
        
        int window = right - left + 1;
        if (window > maxLen) maxLen = window;
        right++;
    }
    return maxLen;
}`,
                go: `// Go - Variable Sliding Window
func lengthOfLongestSubstring(s string) int {
    charSet := make(map[byte]bool)
    left, maxLen := 0, 0
    
    for right := 0; right < len(s); right++ {
        for charSet[s[right]] {
            delete(charSet, s[left])
            left++
        }
        charSet[s[right]] = true
        if right-left+1 > maxLen {
            maxLen = right - left + 1
        }
    }
    return maxLen
}`,
                typescript: `// TypeScript - Variable Sliding Window
function lengthOfLongestSubstring(s: string): number {
    const charSet: Set<string> = new Set();
    let left = 0, maxLen = 0;
    
    for (let right = 0; right < s.length; right++) {
        while (charSet.has(s[right])) {
            charSet.delete(s[left]);
            left++;
        }
        charSet.add(s[right]);
        maxLen = Math.max(maxLen, right - left + 1);
    }
    return maxLen;
}`
            },
            syntaxDiff: 'Since finding substrings usually relies on HashSets for O(1) duplicate lookups, Python and JS use `set()` and `new Set()`, Java uses `HashSet`. C uses a fast 128-length array representing every ASCII character count.',
            quiz: [
                {
                    question: 'If solving a Variable Sliding Window problem, what role does the `while` loop nested inside the `for` loop play?',
                    options: [
                        'It iterates through the array a second time completely',
                        'It shrinks the trailing `left` pointer as long as the window is currently invalid',
                        'It expands the right pointer instantly to the end',
                        'It stops the program from throwing an exception'
                    ],
                    correct: 1,
                    explanation: 'The outer loop expands the `right` pointer (making the window bigger). When an invalidating condition is met (like a repeating character), the inner `while` loop aggressively inches the `left` pointer forward (shrinking the window) until the condition is valid again.'
                },
                {
                    question: 'Wait, a `while` loop inside a `for` loop looks like O(N²) time complexity. Why is Sliding Window actually O(N) time complexity overall?',
                    options: [
                        'Because both pointers only ever move forward',
                        'Because the inner loop breaks early',
                        'Because compilers optimize out nested loops',
                        'It actually IS O(N²) time complexity'
                    ],
                    correct: 0,
                    explanation: 'The `left` and `right` indices only ever advance purely from index 0 to N. They NEVER step backwards. Thus, every element in the array is processed (added and removed from the window) exactly twice at most. O(2N) evaluates to an incredibly fast O(N) time complexity!'
                }
            ]
        }
    ]
};
