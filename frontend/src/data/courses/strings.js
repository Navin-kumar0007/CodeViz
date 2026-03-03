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
            print(f"'{s[left]}' != '{s[right]}' → NOT palindrome")
            return False
        print(f"'{s[left]}' == '{s[right]}' ✓")
        left += 1
        right -= 1
    return True

print(is_palindrome("racecar"))
print(is_palindrome("hello"))
print(is_palindrome("A man a plan a canal Panama"))`,
                javascript: `// Palindrome Check - Two Pointers
function isPalindrome(s) {
    s = s.toLowerCase().replace(/ /g, "");
    let left = 0, right = s.length - 1;
    while (left < right) {
        if (s[left] !== s[right]) {
            console.log("'" + s[left] + "' != '" + s[right] + "' → NOT palindrome");
            return false;
        }
        console.log("'" + s[left] + "' == '" + s[right] + "' ✓");
        left++;
        right--;
    }
    return true;
}

console.log(isPalindrome("racecar"));
console.log(isPalindrome("hello"));
console.log(isPalindrome("A man a plan a canal Panama"));`
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
    s1 = s1.lower().replace(" ", "")
    s2 = s2.lower().replace(" ", "")
    if len(s1) != len(s2):
        return False
    freq = {}
    for c in s1:
        freq[c] = freq.get(c, 0) + 1
    for c in s2:
        freq[c] = freq.get(c, 0) - 1
        if freq[c] < 0:
            return False
    return True

print(is_anagram("listen", "silent"))
print(is_anagram("hello", "world"))
print(is_anagram("evil", "vile"))`,
                javascript: `// Anagram Check
function isAnagram(s1, s2) {
    s1 = s1.toLowerCase().replace(/ /g, "");
    s2 = s2.toLowerCase().replace(/ /g, "");
    if (s1.length !== s2.length) return false;
    let freq = {};
    for (let c of s1) freq[c] = (freq[c] || 0) + 1;
    for (let c of s2) {
        freq[c] = (freq[c] || 0) - 1;
        if (freq[c] < 0) return false;
    }
    return true;
}

console.log(isAnagram("listen", "silent"));
console.log(isAnagram("hello", "world"));
console.log(isAnagram("evil", "vile"));`
            },
            syntaxDiff: 'Python: dict.get(key, default). JavaScript: (obj[key] || 0).',
            quiz: [
                { question: 'What\'s the fastest way to check anagrams?', options: ['Sort both strings', 'Frequency counter with hash map', 'Compare each character', 'Reverse one string'], correct: 1, explanation: 'Hash map frequency counter is O(n). Sorting is O(n log n). Both work but hash map is faster.' },
                { question: '🧠 EDGE CASE: Are "abc" and "abcc" anagrams?', options: ['Yes', 'No — different lengths', 'Yes if we ignore extra', 'Error'], correct: 1, explanation: 'Anagrams must have the EXACT same characters. Different lengths = immediately not anagrams.' }
            ]
        },
        {
            id: 'string-compression',
            title: 'String Compression',
            duration: '7 min',
            explanation: [
                { type: 'text', content: '**Run-Length Encoding**: Compress "aaabbbcc" → "a3b3c2". Count consecutive characters. If the compressed string isn\'t shorter, return the original.' },
                { type: 'tip', content: 'This is a real compression technique used in image formats (BMP) and data transmission.' }
            ],
            keyConcepts: ['Count consecutive characters', 'Build compressed string', 'Return original if not shorter'],
            code: {
                python: `# String Compression
def compress(s):
    if not s:
        return s
    result = []
    count = 1
    for i in range(1, len(s)):
        if s[i] == s[i-1]:
            count += 1
        else:
            result.append(f"{s[i-1]}{count}")
            count = 1
    result.append(f"{s[-1]}{count}")
    compressed = "".join(result)
    print(f"'{s}' → '{compressed}'")
    return compressed if len(compressed) < len(s) else s

compress("aaabbbcc")
compress("abcdef")`,
                javascript: `// String Compression
function compress(s) {
    if (!s) return s;
    let result = [];
    let count = 1;
    for (let i = 1; i < s.length; i++) {
        if (s[i] === s[i-1]) {
            count++;
        } else {
            result.push(s[i-1] + count);
            count = 1;
        }
    }
    result.push(s[s.length-1] + count);
    let compressed = result.join("");
    console.log("'" + s + "' → '" + compressed + "'");
    return compressed.length < s.length ? compressed : s;
}

compress("aaabbbcc");
compress("abcdef");`
            },
            syntaxDiff: 'Same logic. Python uses f-strings, JavaScript uses concatenation.',
            quiz: [
                { question: '🧠 OUTPUT: What does compress("abcdef") return?', options: ['"a1b1c1d1e1f1"', '"abcdef"', '""', 'Error'], correct: 1, explanation: '"a1b1c1d1e1f1" is LONGER than "abcdef", so we return the original string.' },
                { question: '🧠 EDGE CASE: What does compress("") return?', options: ['""', 'null', '"0"', 'Error'], correct: 0, explanation: 'Empty string check at the start returns the empty string immediately.' }
            ]
        },
        {
            id: 'string-patterns',
            title: 'Common String Patterns',
            duration: '6 min',
            explanation: [
                { type: 'text', content: 'Key patterns: **Reverse words** (split, reverse, join), **Check substring** (sliding window), **Count vowels/consonants**, **Remove duplicates while preserving order**.' },
                { type: 'tip', content: 'Most string problems can be solved with: two pointers, hash maps, or sliding window.' }
            ],
            keyConcepts: ['Reverse words in a sentence', 'Sliding window for substrings', 'Hash set for duplicate removal'],
            code: {
                python: `# Common String Patterns

# 1. Reverse words
sentence = "Hello World Python"
reversed_words = " ".join(sentence.split()[::-1])
print(f"Reverse words: {reversed_words}")

# 2. Count vowels
def count_vowels(s):
    vowels = set("aeiouAEIOU")
    count = sum(1 for c in s if c in vowels)
    return count
print(f"Vowels in 'Hello World': {count_vowels('Hello World')}")

# 3. Remove duplicate chars (keep order)
def remove_dupes(s):
    seen = set()
    result = []
    for c in s:
        if c not in seen:
            seen.add(c)
            result.append(c)
    return "".join(result)
print(f"Remove dupes 'aabbcc': {remove_dupes('aabbcc')}")`,
                javascript: `// Common String Patterns

// 1. Reverse words
let sentence = "Hello World JavaScript";
let reversedWords = sentence.split(" ").reverse().join(" ");
console.log("Reverse words:", reversedWords);

// 2. Count vowels
function countVowels(s) {
    let vowels = new Set("aeiouAEIOU");
    let count = 0;
    for (let c of s) if (vowels.has(c)) count++;
    return count;
}
console.log("Vowels in 'Hello World':", countVowels("Hello World"));

// 3. Remove duplicate chars (keep order)
function removeDupes(s) {
    let seen = new Set();
    let result = [];
    for (let c of s) {
        if (!seen.has(c)) {
            seen.add(c);
            result.push(c);
        }
    }
    return result.join("");
}
console.log("Remove dupes 'aabbcc':", removeDupes("aabbcc"));`
            },
            syntaxDiff: 'Python: set(), "in" operator, join(). JavaScript: new Set(), .has(), .join().',
            quiz: [
                { question: '🧠 OUTPUT: "Hello World"[::-1] in Python gives?', options: ['"dlroW olleH"', '"olleH dlroW"', 'Error', '"World Hello"'], correct: 0, explanation: '[::-1] reverses the entire string character by character, not word by word.' },
                { question: 'What data structure helps remove duplicates in O(n)?', options: ['Array', 'Hash Set', 'Stack', 'Queue'], correct: 1, explanation: 'A Hash Set tracks seen characters in O(1) per lookup, giving O(n) total.' }
            ]
        }
    ]
};
