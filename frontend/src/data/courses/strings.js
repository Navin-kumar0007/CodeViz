/**
 * Strings - Learning Path
 * String manipulation and pattern problems
 */

export const STRINGS_PATH = {
    id: 'strings',
    title: 'String Manipulation',
    icon: '📝',
    description: 'Master string operations — palindromes, anagrams, pattern matching, and common interview tricks.',
    prerequisites: ['arrays'],
    lessons: [
        {
            id: 'string-basics',
            title: 'String Operations',
            duration: '6 min',
            explanation: [
                { type: 'text', content: '**Strings** are sequences of characters. They support slicing, searching, and many built-in methods. Strings are **immutable** in both Python and JavaScript — you can\'t change a character in place.' },
                { type: 'tip', content: 'Since strings are immutable, operations like replace() or upper() create NEW strings.' }
            ],
            keyConcepts: ['Strings are immutable', 'Slicing extracts substrings', 'Built-in methods create new strings'],
            code: {
                python: `# String Operations
s = "Hello, World!"
print(f"Length: {len(s)}")
print(f"Upper: {s.upper()}")
print(f"Lower: {s.lower()}")
print(f"Slice [0:5]: {s[0:5]}")
print(f"Reverse: {s[::-1]}")
print(f"Replace: {s.replace('World', 'Python')}")
print(f"Split: {s.split(', ')}")
print(f"Find 'World': {s.find('World')}")`,
                javascript: `// String Operations
let s = "Hello, World!";
console.log("Length:", s.length);
console.log("Upper:", s.toUpperCase());
console.log("Lower:", s.toLowerCase());
console.log("Slice 0-5:", s.slice(0, 5));
console.log("Reverse:", s.split("").reverse().join(""));
console.log("Replace:", s.replace("World", "JavaScript"));
console.log("Split:", s.split(", "));
console.log("Find 'World':", s.indexOf("World"));`,
                java: `// String Operations
public class Main {
    public static void main(String[] args) {
        String s = "Hello, World!";
        System.out.println("Length: " + s.length());
        System.out.println("Upper: " + s.toUpperCase());
        System.out.println("Lower: " + s.toLowerCase());
        System.out.println("Slice 0-5: " + s.substring(0, 5));
        System.out.println("Reverse: " + new StringBuilder(s).reverse().toString());
        System.out.println("Replace: " + s.replace("World", "Java"));
        System.out.println("Split: " + java.util.Arrays.toString(s.split(", ")));
        System.out.println("Find 'World': " + s.indexOf("World"));
    }
}`,
                c: `// String Operations
#include <stdio.h>
#include <string.h>
#include <ctype.h>

int main() {
    char s[] = "Hello, World!";
    printf("Length: %lu\\n", strlen(s));
    
    // C doesn't have built-in upper/lower for whole strings
    // Substring in C:
    char sub[6];
    strncpy(sub, s, 5);
    sub[5] = '\\0';
    printf("Slice 0-5: %s\\n", sub);
    
    // Find substring
    char *p = strstr(s, "World");
    if (p) printf("Found 'World' at: %ld\\n", p - s);
    
    return 0;
}`,
                cpp: `// String Operations
#include <iostream>
#include <string>
#include <algorithm>

int main() {
    std::string s = "Hello, World!";
    std::cout << "Length: " << s.length() << "\\n";
    
    std::string upper = s;
    std::transform(upper.begin(), upper.end(), upper.begin(), ::toupper);
    std::cout << "Upper: " << upper << "\\n";
    
    std::cout << "Slice 0-5: " << s.substr(0, 5) << "\\n";
    
    std::string rev = s;
    std::reverse(rev.begin(), rev.end());
    std::cout << "Reverse: " << rev << "\\n";
    
    std::cout << "Find 'World': " << s.find("World") << "\\n";
    return 0;
}`,
                go: `// String Operations
package main
import (
    "fmt"
    "strings"
)

func main() {
    s := "Hello, World!"
    fmt.Println("Length:", len(s))
    fmt.Println("Upper:", strings.ToUpper(s))
    fmt.Println("Lower:", strings.ToLower(s))
    fmt.Println("Slice 0-5:", s[0:5])
    
    // Reverse in Go:
    runes := []rune(s)
    for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
        runes[i], runes[j] = runes[j], runes[i]
    }
    fmt.Println("Reverse:", string(runes))
    
    fmt.Println("Replace:", strings.Replace(s, "World", "Go", 1))
    fmt.Println("Split:", strings.Split(s, ", "))
    fmt.Println("Find 'World':", strings.Index(s, "World"))
}`,
                typescript: `// String Operations
let s: string = "Hello, World!";
console.log("Length:", s.length);
console.log("Upper:", s.toUpperCase());
console.log("Lower:", s.toLowerCase());
console.log("Slice 0-5:", s.slice(0, 5));
console.log("Reverse:", s.split("").reverse().join(""));
console.log("Replace:", s.replace("World", "TypeScript"));
console.log("Split:", s.split(", "));
console.log("Find 'World':", s.indexOf("World"));`
            },
            syntaxDiff: 'Python: len(), .find(), slicing with [::-1]. JavaScript: .length, .indexOf(), .split("").reverse().join("").',
            quiz: [
                { question: '🧠 TRICKY: What does "hello"[1:4] return in Python?', options: ['"ell"', '"hel"', '"ello"', '"llo"'], correct: 0, explanation: 'Slicing [1:4] gives characters at indices 1, 2, 3 → "ell". Start is inclusive, end is exclusive.' },
                { question: 'Can you do s[0] = "X" to change the first character?', options: ['Yes', 'No — strings are immutable', 'Only in Python', 'Only in JavaScript'], correct: 1, explanation: 'Strings are immutable in both languages. You must create a new string instead.' }
            ]
        },
        {
            id: 'palindrome',
            title: 'Palindrome Check',
            duration: '7 min',
            explanation: [
                { type: 'text', content: 'A **palindrome** reads the same forwards and backwards: "racecar", "madam", "level". Checking involves comparing the string with its reverse, or using two pointers.' },
                { type: 'tip', content: 'Two-pointer approach: compare first and last characters, move inward. If all match → palindrome!' }
            ],
            keyConcepts: ['Palindrome = same forwards and backwards', 'Two-pointer technique', 'Clean string before checking (lowercase, remove spaces)'],
            code: {
                python: `# Palindrome Check - Two Pointers
def is_palindrome(s):
    s = s.lower().replace(" ", "")
    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]:
            return False
        left += 1
        right -= 1
    return True

print(is_palindrome("racecar"))
print(is_palindrome("hello"))`,
                javascript: `// Palindrome Check - Two Pointers
function isPalindrome(s) {
    s = s.toLowerCase().replace(/ /g, "");
    let left = 0, right = s.length - 1;
    while (left < right) {
        if (s[left] !== s[right]) return false;
        left++;
        right--;
    }
    return true;
}

console.log(isPalindrome("racecar"));
console.log(isPalindrome("hello"));`,
                java: `// Java - Palindrome Check
public class Main {
    public static boolean isPalindrome(String s) {
        s = s.toLowerCase().replaceAll("\\\\s", "");
        int left = 0, right = s.length() - 1;
        while (left < right) {
            if (s.charAt(left) != s.charAt(right)) return false;
            left++;
            right--;
        }
        return true;
    }
    public static void main(String[] args) {
        System.out.println(isPalindrome("racecar"));
    }
}`,
                c: `// C - Palindrome Check
#include <stdio.h>
#include <string.h>
#include <stdbool.h>
#include <ctype.h>

bool isPalindrome(char *s) {
    int left = 0, right = strlen(s) - 1;
    while (left < right) {
        if (tolower(s[left]) != tolower(s[right])) return false;
        left++;
        right--;
    }
    return true;
}

int main() {
    printf("%d\\n", isPalindrome("racecar"));
    return 0;
}`,
                cpp: `// C++ - Palindrome Check
#include <iostream>
#include <string>
#include <algorithm>

bool isPalindrome(std::string s) {
    int left = 0, right = s.length() - 1;
    while (left < right) {
        if (tolower(s[left]) != tolower(s[right])) return false;
        left++;
        right--;
    }
    return true;
}

int main() {
    std::cout << isPalindrome("racecar") << "\\n";
    return 0;
}`,
                go: `// Go - Palindrome Check
package main
import (
    "fmt"
    "strings"
)

func isPalindrome(s string) bool {
    s = strings.ToLower(s)
    left, right := 0, len(s)-1
    for left < right {
        if s[left] != s[right] {
            return false
        }
        left++
        right--
    }
    return true
}

func main() {
    fmt.Println(isPalindrome("racecar"))
}`,
                typescript: `// TypeScript - Palindrome Check
function isPalindrome(s: string): boolean {
    s = s.toLowerCase().replace(/ /g, "");
    let left = 0, right = s.length - 1;
    while (left < right) {
        if (s[left] !== s[right]) return false;
        left++;
        right--;
    }
    return true;
}
console.log(isPalindrome("racecar"));`
            },
            syntaxDiff: 'Python: .replace(" ", ""). JavaScript: .replace(/ /g, "") with regex for global replace.',
            quiz: [
                { question: '🧠 TRICKY: Is "A man a plan a canal Panama" a palindrome?', options: ['No', 'Yes — after removing spaces and lowercasing', 'Only the first word', 'Error'], correct: 1, explanation: 'After cleaning: "amanaplanacanalpanama" — reads the same both ways!' },
                { question: 'What is the time complexity of the two-pointer palindrome check?', options: ['O(n²)', 'O(n)', 'O(log n)', 'O(1)'], correct: 1, explanation: 'We traverse at most half the string with two pointers — O(n/2) = O(n).' }
            ]
        },
        {
            id: 'anagram',
            title: 'Anagram Detection',
            duration: '6 min',
            explanation: [
                { type: 'text', content: '**Anagrams** are words with the same letters rearranged: "listen" ↔ "silent", "evil" ↔ "vile". To check, compare the character frequency of both strings.' },
                { type: 'tip', content: 'Quick check: sort both strings and compare. Or use a frequency counter (hash map) for O(n) time.' }
            ],
            keyConcepts: ['Same characters, different order', 'Sort-and-compare: O(n log n)', 'Frequency counter: O(n)'],
            code: {
                python: `# Anagram Check
def is_anagram(s1, s2):
    s1, s2 = s1.lower(), s2.lower()
    return sorted(s1) == sorted(s2)

print(is_anagram("listen", "silent"))`,
                javascript: `// Anagram Check
function isAnagram(s1, s2) {
    let sorted1 = s1.toLowerCase().split("").sort().join("");
    let sorted2 = s2.toLowerCase().split("").sort().join("");
    return sorted1 === sorted2;
}

console.log(isAnagram("listen", "silent"));`,
                java: `// Java - Anagram Check
import java.util.Arrays;

public class Main {
    public static boolean isAnagram(String s1, String s2) {
        char[] c1 = s1.toLowerCase().toCharArray();
        char[] c2 = s2.toLowerCase().toCharArray();
        Arrays.sort(c1);
        Arrays.sort(c2);
        return Arrays.equals(c1, c2);
    }
    public static void main(String[] args) {
        System.out.println(isAnagram("listen", "silent"));
    }
}`,
                c: `// C - Anagram Check (Simplified)
#include <stdio.h>
#include <string.h>

void sort(char *s) {
    int n = strlen(s);
    for(int i=0; i<n-1; i++) {
        for(int j=i+1; j<n; j++) {
            if(s[i] > s[j]) {
                char t = s[i]; s[i] = s[j]; s[j] = t;
            }
        }
    }
}

int main() {
    char s1[] = "listen", s2[] = "silent";
    sort(s1); sort(s2);
    printf("%d\\n", strcmp(s1, s2) == 0);
    return 0;
}`,
                cpp: `// C++ - Anagram Check
#include <iostream>
#include <string>
#include <algorithm>

bool isAnagram(std::string s1, std::string s2) {
    std::sort(s1.begin(), s1.end());
    std::sort(s2.begin(), s2.end());
    return s1 == s2;
}

int main() {
    std::cout << isAnagram("listen", "silent") << "\\n";
    return 0;
}`,
                go: `// Go - Anagram Check
package main
import (
    "fmt"
    "sort"
    "strings"
)

func isAnagram(s1, s2 string) bool {
    r1 := strings.Split(s1, "")
    r2 := strings.Split(s2, "")
    sort.Strings(r1)
    sort.Strings(r2)
    return strings.Join(r1, "") == strings.Join(r2, "")
}

func main() {
    fmt.Println(isAnagram("listen", "silent"))
}`,
                typescript: `// TypeScript - Anagram Check
function isAnagram(s1: string, s2: string): boolean {
    let sorted1 = s1.toLowerCase().split("").sort().join("");
    let sorted2 = s2.toLowerCase().split("").sort().join("");
    return sorted1 === sorted2;
}
console.log(isAnagram("listen", "silent"));`
            },
            syntaxDiff: 'Python: sorted(s). JavaScript: s.split("").sort().join("").',
            quiz: [
                { question: 'What\'s the fastest way to check anagrams?', options: ['Sort both strings', 'Frequency counter with hash map', 'Compare each character', 'Reverse one string'], correct: 1, explanation: 'Hash map frequency counter is O(n). Sorting is O(n log n). Both work but hash map is faster.' },
                { question: 'Are "abc" and "abcc" anagrams?', options: ['Yes', 'No — different lengths', 'Yes if we ignore extra', 'Error'], correct: 1, explanation: 'Anagrams must have the EXACT same characters. Different lengths = immediately not anagrams.' }
            ]
        }
    ]
};
