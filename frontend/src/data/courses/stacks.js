/**
 * Stacks - Learning Path
 * Learn about LIFO data structure and its applications
 */

export const STACKS_PATH = {
    id: 'stacks',
    title: 'Stacks',
    icon: '📚',
    description: 'Master the LIFO principle! Learn push, pop, and practical applications of stacks.',
    prerequisites: ['linkedlists'],  // Unlock after Linked Lists
    lessons: [
        {
            id: 'what-is-stack',
            title: 'What is a Stack?',
            duration: '5 min',
            explanation: [
                {
                    type: 'text',
                    content: 'A **Stack** is a linear data structure that follows the **LIFO** principle: Last In, First Out. The last element added is the first one removed.'
                },
                {
                    type: 'tip',
                    content: 'Think of a stack of plates: you can only add or remove from the TOP. The last plate you put on is the first you take off!'
                },
                {
                    type: 'text',
                    content: 'Stacks have two main operations: **push** (add to top) and **pop** (remove from top). Both are O(1) operations!'
                }
            ],
            keyConcepts: [
                'LIFO: Last In, First Out',
                'push: Add element to top',
                'pop: Remove element from top',
                'peek/top: View top element without removing'
            ],
            code: {
                python: `# Python - Stack Basics
# Arrays/lists work great as stacks!

stack = []

# Push elements (add to top)
stack.append(10)
print(f"Pushed 10: {stack}")
stack.append(20)
print(f"Pushed 20: {stack}")
stack.append(30)
print(f"Pushed 30: {stack}")

# Peek (view top without removing)
top = stack[-1]
print(f"Top element: {top}")

# Pop elements (remove from top)
popped = stack.pop()
print(f"Popped {popped}: {stack}")
popped = stack.pop()
print(f"Popped {popped}: {stack}")`,
                javascript: `// JavaScript - Stack Basics
// Arrays work great as stacks!

let stack = [];

// Push elements (add to top)
stack.push(10);
console.log("Pushed 10:", stack);
stack.push(20);
console.log("Pushed 20:", stack);
stack.push(30);
console.log("Pushed 30:", stack);

// Peek (view top without removing)
let top = stack[stack.length - 1];
console.log("Top element:", top);

// Pop elements (remove from top)
let popped = stack.pop();
console.log("Popped " + popped + ":", stack);
popped = stack.pop();
console.log("Popped " + popped + ":", stack);`
            },
            syntaxDiff: 'Both languages use arrays with push/pop. Python uses append() instead of push(). Python accesses top with [-1], JavaScript uses [length-1].',
            quiz: [
                {
                    question: 'What does LIFO stand for?',
                    options: ['Last In First Out', 'Left In Front Out', 'List Input First Output', 'Loop In For Output'],
                    correct: 0,
                    explanation: 'LIFO = Last In, First Out. The most recently added element is the first to be removed.'
                },
                {
                    question: 'What is the time complexity of push and pop?',
                    options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
                    correct: 2,
                    explanation: 'Both push and pop are O(1) - they only operate on the top of the stack, no traversal needed.'
                }
            ]
        },
        {
            id: 'stack-class',
            title: 'Building a Stack Class',
            duration: '6 min',
            explanation: [
                {
                    type: 'text',
                    content: 'While arrays can be used as stacks, creating a Stack class provides a clean interface and prevents invalid operations.'
                },
                {
                    type: 'tip',
                    content: 'A good Stack class includes: push, pop, peek, isEmpty, and size methods.'
                },
                {
                    type: 'text',
                    content: 'The class encapsulates the underlying array and only exposes stack operations, enforcing the LIFO principle.'
                }
            ],
            keyConcepts: [
                'Encapsulate array in a class',
                'push(): Add to top',
                'pop(): Remove and return top',
                'peek(): Return top without removing',
                'isEmpty(): Check if stack is empty'
            ],
            code: {
                python: `# Python - Stack Class
class Stack:
    def __init__(self):
        self.items = []
    
    def push(self, item):
        """Add item to top of stack"""
        self.items.append(item)
        print(f"Pushed {item}")
    
    def pop(self):
        """Remove and return top item"""
        if self.is_empty():
            return None
        return self.items.pop()
    
    def peek(self):
        """Return top item without removing"""
        if self.is_empty():
            return None
        return self.items[-1]
    
    def is_empty(self):
        """Check if stack is empty"""
        return len(self.items) == 0
    
    def size(self):
        """Return number of items"""
        return len(self.items)

# Test it
stack = Stack()
stack.push(1)
stack.push(2)
stack.push(3)
print(f"Top: {stack.peek()}")
print(f"Size: {stack.size()}")
print(f"Popped: {stack.pop()}")
print(f"Popped: {stack.pop()}")`,
                javascript: `// JavaScript - Stack Class
class Stack {
    constructor() {
        this.items = [];
    }
    
    push(item) {
        // Add item to top of stack
        this.items.push(item);
        console.log("Pushed " + item);
    }
    
    pop() {
        // Remove and return top item
        if (this.isEmpty()) return null;
        return this.items.pop();
    }
    
    peek() {
        // Return top item without removing
        if (this.isEmpty()) return null;
        return this.items[this.items.length - 1];
    }
    
    isEmpty() {
        // Check if stack is empty
        return this.items.length === 0;
    }
    
    size() {
        // Return number of items
        return this.items.length;
    }
}

// Test it
let stack = new Stack();
stack.push(1);
stack.push(2);
stack.push(3);
console.log("Top:", stack.peek());
console.log("Size:", stack.size());
console.log("Popped:", stack.pop());
console.log("Popped:", stack.pop());`
            },
            syntaxDiff: 'Python uses snake_case (is_empty), JavaScript uses camelCase (isEmpty). Both wrap an array with stack methods.',
            quiz: [
                {
                    question: 'What should peek() do if the stack is empty?',
                    options: ['Throw an error', 'Return null/None', 'Return 0', 'Add a new element'],
                    correct: 1,
                    explanation: 'A safe implementation returns null/None for an empty stack. Some implementations throw an error instead.'
                },
                {
                    question: 'Why create a Stack class instead of using an array directly?',
                    options: [
                        'Arrays don\'t support push/pop',
                        'For cleaner code and enforcing LIFO operations',
                        'Classes are faster',
                        'Arrays can\'t be resized'
                    ],
                    correct: 1,
                    explanation: 'A Stack class provides a clean interface, hides implementation details, and prevents non-stack operations.'
                }
            ]
        },
        {
            id: 'balanced-parentheses',
            title: 'Application: Balanced Parentheses',
            duration: '8 min',
            explanation: [
                {
                    type: 'text',
                    content: 'A classic stack application: checking if parentheses in an expression are balanced. Every opening bracket must have a matching closing bracket.'
                },
                {
                    type: 'tip',
                    content: 'Push opening brackets onto the stack. When you see a closing bracket, pop and check if it matches!'
                },
                {
                    type: 'text',
                    content: 'This algorithm is used in compilers, text editors, and IDEs to validate code syntax.'
                }
            ],
            keyConcepts: [
                'Push opening brackets: (, [, {',
                'On closing bracket: pop and verify match',
                'If mismatch or empty stack on pop: unbalanced',
                'At end: stack should be empty'
            ],
            code: {
                python: `# Python - Balanced Parentheses Checker
def is_balanced(expression):
    stack = []
    # Matching pairs
    pairs = {')': '(', ']': '[', '}': '{'}
    
    for char in expression:
        if char in '([{':
            stack.append(char)
            print(f"Push '{char}': {stack}")
        elif char in ')]}':
            if not stack:
                print(f"No match for '{char}' - UNBALANCED")
                return False
            top = stack.pop()
            if top != pairs[char]:
                print(f"Mismatch: '{top}' vs '{char}' - UNBALANCED")
                return False
            print(f"Matched '{top}' with '{char}': {stack}")
    
    balanced = len(stack) == 0
    print(f"Final stack: {stack} - {'BALANCED' if balanced else 'UNBALANCED'}")
    return balanced

# Test cases
print("Test 1: {[()]}")
is_balanced("{[()]}")

print("\\nTest 2: {[(])}")
is_balanced("{[(])}")

print("\\nTest 3: (()")
is_balanced("(()")`,
                javascript: `// JavaScript - Balanced Parentheses Checker
function isBalanced(expression) {
    let stack = [];
    // Matching pairs
    let pairs = {')': '(', ']': '[', '}': '{'};
    
    for (let char of expression) {
        if ('([{'.includes(char)) {
            stack.push(char);
            console.log("Push '" + char + "':", stack);
        } else if (')]}'.includes(char)) {
            if (stack.length === 0) {
                console.log("No match for '" + char + "' - UNBALANCED");
                return false;
            }
            let top = stack.pop();
            if (top !== pairs[char]) {
                console.log("Mismatch: '" + top + "' vs '" + char + "' - UNBALANCED");
                return false;
            }
            console.log("Matched '" + top + "' with '" + char + "':", stack);
        }
    }
    
    let balanced = stack.length === 0;
    console.log("Final stack:", stack, balanced ? "- BALANCED" : "- UNBALANCED");
    return balanced;
}

// Test cases
console.log("Test 1: {[()]}");
isBalanced("{[()]}");

console.log("\\nTest 2: {[(])}");
isBalanced("{[(])}");

console.log("\\nTest 3: (()");
isBalanced("(()");`
            },
            syntaxDiff: 'Python uses "in" for string containment, JavaScript uses includes(). Both use a dictionary/object for matching pairs.',
            quiz: [
                {
                    question: 'What do we push onto the stack?',
                    options: ['Closing brackets', 'Opening brackets', 'All brackets', 'Numbers only'],
                    correct: 1,
                    explanation: 'We push opening brackets. When we see a closing bracket, we pop to check if it matches.'
                },
                {
                    question: 'When is an expression balanced?',
                    options: [
                        'When the stack has one element left',
                        'When stack is empty after processing all characters',
                        'When all brackets are the same type',
                        'When there are equal brackets'
                    ],
                    correct: 1,
                    explanation: 'An expression is balanced when every opening bracket has been matched with a closing bracket, leaving the stack empty.'
                }
            ]
        },
        {
            id: 'undo-redo',
            title: 'Application: Undo/Redo',
            duration: '6 min',
            explanation: [
                {
                    type: 'text',
                    content: 'Undo/Redo functionality in applications (like text editors) is built using stacks! Each action is pushed onto an undo stack.'
                },
                {
                    type: 'tip',
                    content: 'Undo: Pop from undo stack, push to redo stack. Redo: Pop from redo stack, push to undo stack.'
                },
                {
                    type: 'text',
                    content: 'New actions clear the redo stack (you can\'t redo after making a new change).'
                }
            ],
            keyConcepts: [
                'Undo stack: stores performed actions',
                'Redo stack: stores undone actions',
                'Undo: move from undo to redo stack',
                'New action clears redo stack'
            ],
            code: {
                python: `# Python - Undo/Redo System
class TextEditor:
    def __init__(self):
        self.text = ""
        self.undo_stack = []
        self.redo_stack = []
    
    def type_text(self, new_text):
        """Type new text (action)"""
        self.undo_stack.append(self.text)
        self.redo_stack.clear()  # Clear redo on new action
        self.text += new_text
        print(f"Typed '{new_text}': '{self.text}'")
    
    def undo(self):
        """Undo last action"""
        if not self.undo_stack:
            print("Nothing to undo")
            return
        self.redo_stack.append(self.text)
        self.text = self.undo_stack.pop()
        print(f"Undo: '{self.text}'")
    
    def redo(self):
        """Redo last undone action"""
        if not self.redo_stack:
            print("Nothing to redo")
            return
        self.undo_stack.append(self.text)
        self.text = self.redo_stack.pop()
        print(f"Redo: '{self.text}'")

# Test it
editor = TextEditor()
editor.type_text("Hello")
editor.type_text(" World")
editor.type_text("!")
editor.undo()
editor.undo()
editor.redo()`,
                javascript: `// JavaScript - Undo/Redo System
class TextEditor {
    constructor() {
        this.text = "";
        this.undoStack = [];
        this.redoStack = [];
    }
    
    typeText(newText) {
        // Type new text (action)
        this.undoStack.push(this.text);
        this.redoStack = [];  // Clear redo on new action
        this.text += newText;
        console.log("Typed '" + newText + "': '" + this.text + "'");
    }
    
    undo() {
        // Undo last action
        if (this.undoStack.length === 0) {
            console.log("Nothing to undo");
            return;
        }
        this.redoStack.push(this.text);
        this.text = this.undoStack.pop();
        console.log("Undo: '" + this.text + "'");
    }
    
    redo() {
        // Redo last undone action
        if (this.redoStack.length === 0) {
            console.log("Nothing to redo");
            return;
        }
        this.undoStack.push(this.text);
        this.text = this.redoStack.pop();
        console.log("Redo: '" + this.text + "'");
    }
}

// Test it
let editor = new TextEditor();
editor.typeText("Hello");
editor.typeText(" World");
editor.typeText("!");
editor.undo();
editor.undo();
editor.redo();`
            },
            syntaxDiff: 'Same logic in both. Python uses clear(), JavaScript reassigns to empty array. Both demonstrate practical stack usage.',
            quiz: [
                {
                    question: 'What happens to the redo stack when you perform a new action?',
                    options: ['Nothing', 'It gets cleared', 'It doubles in size', 'It becomes the undo stack'],
                    correct: 1,
                    explanation: 'New actions clear the redo stack because you can\'t redo to a future that no longer exists.'
                },
                {
                    question: 'How does undo work with stacks?',
                    options: [
                        'Delete from undo stack only',
                        'Pop from undo, push to redo',
                        'Push to both stacks',
                        'Clear both stacks'
                    ],
                    correct: 1,
                    explanation: 'Undo pops the previous state from undo stack (reverting) and pushes current state to redo stack (for possible redo).'
                }
            ]
        }
    ]
};
