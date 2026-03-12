/**
 * Tries - Learning Path
 * Learn about Prefix Trees for ultra-fast string and path searching
 */

export const TRIES_PATH = {
    id: 'tries',
    title: 'Tries (Prefix Trees)',
    icon: '🔤',
    description: 'Learn how Autocomplete and Spellcheck work under the hood using Tries.',
    prerequisites: ['trees', 'strings'],
    lessons: [
        {
            id: 'what-is-a-trie',
            title: 'Introduction to Tries',
            duration: '10 min',
            explanation: [
                {
                    type: 'text',
                    content: 'A **Trie** (pronounced "try", and short for reTRIEval) is a specialized tree data structure used specifically for storing and quickly retrieving strings.'
                },
                {
                    type: 'tip',
                    content: 'In a Standard Tree, a node holds a whole object. In a Trie, each node represents a SINGLE letter (like "A", "P", "P", "L", "E").'
                },
                {
                    type: 'text',
                    content: 'Because words share prefixes (e.g., "App", "Apple", "Ape"), they share the exact same nodes for their starting characters! This makes them insanely space-efficient and blazing fast for searching.'
                }
            ],
            keyConcepts: [
                'Node Contains: A map of Children characters and an isEndOfWord boolean',
                'Searching takes O(L) time, where L is the length of the word',
                'Insertion takes O(L) time',
                'Core data structure for Autocomplete implementations'
            ],
            code: {
                python: `# Python - Basic Trie Implementation
class TrieNode:
    def __init__(self):
        self.children = {}  # Char -> TrieNode
        self.is_end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        curr = self.root
        for char in word:
            if char not in curr.children:
                curr.children[char] = TrieNode()
            curr = curr.children[char]
        curr.is_end = True

    def search(self, word):
        curr = self.root
        for char in word:
            if char not in curr.children:
                return False
            curr = curr.children[char]
        return curr.is_end

t = Trie()
t.insert("apple")
print(t.search("apple"))  # True
print(t.search("app"))    # False (Not end of word)`,
                javascript: `// JavaScript - Basic Trie Implementation
class TrieNode {
    constructor() {
        this.children = new Map(); // Char -> TrieNode
        this.isEnd = false;
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(word) {
        let curr = this.root;
        for (const char of word) {
            if (!curr.children.has(char)) {
                curr.children.set(char, new TrieNode());
            }
            curr = curr.children.get(char);
        }
        curr.isEnd = true;
    }

    search(word) {
        let curr = this.root;
        for (const char of word) {
            if (!curr.children.has(char)) return false;
            curr = curr.children.get(char);
        }
        return curr.isEnd;
    }
}

const t = new Trie();
t.insert("apple");
console.log(t.search("apple")); // true
console.log(t.search("app"));   // false`,
                java: `// Java - Basic Trie Implementation
class TrieNode {
    TrieNode[] children = new TrieNode[26];
    boolean isEnd = false;
}

public class Trie {
    TrieNode root;

    public Trie() {
        root = new TrieNode();
    }

    public void insert(String word) {
        TrieNode curr = root;
        for (char c : word.toCharArray()) {
            if (curr.children[c - 'a'] == null) {
                curr.children[c - 'a'] = new TrieNode();
            }
            curr = curr.children[c - 'a'];
        }
        curr.isEnd = true;
    }

    public boolean search(String word) {
        TrieNode curr = root;
        for (char c : word.toCharArray()) {
            if (curr.children[c - 'a'] == null) return false;
            curr = curr.children[c - 'a'];
        }
        return curr.isEnd;
    }
}`,
                cpp: `// C++ - Basic Trie Implementation
#include <iostream>
#include <unordered_map>
using namespace std;

class TrieNode {
public:
    unordered_map<char, TrieNode*> children;
    bool isEnd = false;
};

class Trie {
    TrieNode* root;
public:
    Trie() { root = new TrieNode(); }

    void insert(string word) {
        TrieNode* curr = root;
        for (char c : word) {
            if (!curr->children.count(c)) {
                curr->children[c] = new TrieNode();
            }
            curr = curr->children[c];
        }
        curr->isEnd = true;
    }

    bool search(string word) {
        TrieNode* curr = root;
        for (char c : word) {
            if (!curr->children.count(c)) return false;
            curr = curr->children[c];
        }
        return curr->isEnd;
    }
};`,
                c: `// C - Basic Trie Implementation
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

typedef struct TrieNode {
    struct TrieNode* children[26];
    bool isEnd;
} TrieNode;

TrieNode* createNode() {
    TrieNode* node = (TrieNode*)malloc(sizeof(TrieNode));
    node->isEnd = false;
    for(int i = 0; i < 26; i++) node->children[i] = NULL;
    return node;
}

void insert(TrieNode* root, const char* word) {
    TrieNode* curr = root;
    for (int i = 0; word[i] != '\\0'; i++) {
        int idx = word[i] - 'a';
        if (!curr->children[idx]) {
            curr->children[idx] = createNode();
        }
        curr = curr->children[idx];
    }
    curr->isEnd = true;
}`,
                go: `// Go - Basic Trie Implementation
package main
import "fmt"

type TrieNode struct {
    children map[rune]*TrieNode
    isEnd    bool
}

type Trie struct {
    root *TrieNode
}

func Constructor() Trie {
    return Trie{root: &TrieNode{children: make(map[rune]*TrieNode)}}
}

func (this *Trie) Insert(word string) {
    curr := this.root
    for _, ch := range word {
        if curr.children[ch] == nil {
            curr.children[ch] = &TrieNode{children: make(map[rune]*TrieNode)}
        }
        curr = curr.children[ch]
    }
    curr.isEnd = true
}

func (this *Trie) Search(word string) bool {
    curr := this.root
    for _, ch := range word {
        if curr.children[ch] == nil {
            return false
        }
        curr = curr.children[ch]
    }
    return curr.isEnd
}`,
                typescript: `// TypeScript - Basic Trie Implementation
class TrieNode {
    children: Map<string, TrieNode>;
    isEnd: boolean;
    constructor() {
        this.children = new Map();
        this.isEnd = false;
    }
}

class Trie {
    root: TrieNode;
    constructor() {
        this.root = new TrieNode();
    }

    insert(word: string): void {
        let curr = this.root;
        for (const char of word) {
            if (!curr.children.has(char)) {
                curr.children.set(char, new TrieNode());
            }
            curr = curr.children.get(char)!;
        }
        curr.isEnd = true;
    }

    search(word: string): boolean {
        let curr = this.root;
        for (const char of word) {
            if (!curr.children.has(char)) return false;
            curr = curr.children.get(char)!;
        }
        return curr.isEnd;
    }
}`
            },
            syntaxDiff: 'Java and C typically use an array of size 26 (`TrieNode[26]`) representing \'a\'-\'z\' because it is slightly faster than HashMap hashing. Python, JS, and C++ typically use HashMaps/Dictionaries mapping character -> node, which supports unbounded alphabets (like Symbols/Unicode).',
            quiz: [
                {
                    question: 'If you want to check if the prefix "App" exists inside a Dictionary tree, how fast will it execute using a Trie?',
                    options: [
                        'O(1)',
                        'O(Length of "App")',
                        'O(Total Words in Dictionary)',
                        'O(Total Letters in Dictionary)'
                    ],
                    correct: 1,
                    explanation: 'A Trie searches by just walking down the nodes character by character. If "App" is length 3, it literally just takes 3 tiny constant-time hops down the tree to see if it exists!'
                },
                {
                    question: 'Why do we need an `isEnd` boolean on the Trie Nodes?',
                    options: [
                        'To prevent infinite loops',
                        'To distinguish between a full word ("app") versus just a prefix ("app" inside "apple")',
                        'To identify root nodes',
                        'To know when to delete nodes'
                    ],
                    correct: 1,
                    explanation: 'If we insert "apple", the nodes a-p-p-l-e are created. If we search for "app", we successfully find the a-p-p nodes, but it isn\'t a valid word until we actually explicitly insert "app" and flip that node\'s isEnd flag to True.'
                }
            ]
        }
    ]
};
