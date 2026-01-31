/**
 * Linked Lists - Learning Path
 * Learn about dynamic data structures with pointers
 */

export const LINKEDLISTS_PATH = {
    id: 'linkedlists',
    title: 'Linked Lists',
    icon: '🔗',
    description: 'Discover how nodes and pointers create flexible data structures that grow dynamically!',
    prerequisites: ['sorting'],  // Unlock after Sorting Algorithms
    lessons: [
        {
            id: 'what-is-linkedlist',
            title: 'What is a Linked List?',
            duration: '6 min',
            explanation: [
                {
                    type: 'text',
                    content: 'A **Linked List** is a data structure where elements (called **nodes**) are connected using **pointers**. Each node contains data and a reference to the next node.'
                },
                {
                    type: 'tip',
                    content: 'Think of a treasure hunt: each clue (node) tells you where to find the next clue, until you reach the treasure (end)!'
                },
                {
                    type: 'text',
                    content: 'Unlike arrays, linked lists don\'t store elements in contiguous memory. This makes insertion/deletion faster but access slower.'
                }
            ],
            keyConcepts: [
                'Nodes contain data + pointer to next node',
                'Head points to the first node',
                'Last node points to null (end)',
                'Dynamic size - grows as needed'
            ],
            code: {
                python: `# Python - Linked List Basics
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None  # Pointer to next node

# Create nodes
node1 = Node(10)
node2 = Node(20)
node3 = Node(30)

# Link them together
node1.next = node2
node2.next = node3

# Traverse the list
print("Linked List:")
current = node1  # Start at head
while current:
    print(f"  Node: {current.data}")
    current = current.next  # Move to next

print("End of list (reached null)")`,
                javascript: `// JavaScript - Linked List Basics
class Node {
    constructor(data) {
        this.data = data;
        this.next = null;  // Pointer to next node
    }
}

// Create nodes
let node1 = new Node(10);
let node2 = new Node(20);
let node3 = new Node(30);

// Link them together
node1.next = node2;
node2.next = node3;

// Traverse the list
console.log("Linked List:");
let current = node1;  // Start at head
while (current) {
    console.log("  Node:", current.data);
    current = current.next;  // Move to next
}

console.log("End of list (reached null)");`
            },
            syntaxDiff: 'Python uses None for null references. JavaScript uses null. Both use classes to define Node structure.',
            quiz: [
                {
                    question: 'What does each node in a linked list contain?',
                    options: [
                        'Only data',
                        'Only a pointer',
                        'Data and a pointer to the next node',
                        'An array of values'
                    ],
                    correct: 2,
                    explanation: 'Each node contains the actual data AND a pointer/reference to the next node in the list.'
                },
                {
                    question: 'What does the last node point to?',
                    options: ['The first node', 'Itself', 'null/None', 'The previous node'],
                    correct: 2,
                    explanation: 'The last node\'s next pointer is null (or None in Python), indicating the end of the list.'
                }
            ]
        },
        {
            id: 'linkedlist-class',
            title: 'Building a LinkedList Class',
            duration: '8 min',
            explanation: [
                {
                    type: 'text',
                    content: 'A proper LinkedList class manages the nodes and provides methods for common operations like adding, removing, and searching.'
                },
                {
                    type: 'tip',
                    content: 'The LinkedList class tracks the "head" - the first node. All operations start from the head!'
                },
                {
                    type: 'text',
                    content: 'Common operations: append (add to end), prepend (add to start), insert (add at position), delete, and search.'
                }
            ],
            keyConcepts: [
                'LinkedList class manages the head pointer',
                'Methods encapsulate common operations',
                'Always update pointers carefully',
                'Handle edge cases (empty list, single node)'
            ],
            code: {
                python: `# Python - LinkedList Class
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None
    
    def append(self, data):
        """Add node to the end"""
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            print(f"Added {data} as head")
            return
        
        current = self.head
        while current.next:
            current = current.next
        current.next = new_node
        print(f"Appended {data}")
    
    def display(self):
        """Print all nodes"""
        elements = []
        current = self.head
        while current:
            elements.append(str(current.data))
            current = current.next
        print(" -> ".join(elements) + " -> None")

# Test it
ll = LinkedList()
ll.append(10)
ll.append(20)
ll.append(30)
ll.display()`,
                javascript: `// JavaScript - LinkedList Class
class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

class LinkedList {
    constructor() {
        this.head = null;
    }
    
    append(data) {
        // Add node to the end
        let newNode = new Node(data);
        if (!this.head) {
            this.head = newNode;
            console.log("Added " + data + " as head");
            return;
        }
        
        let current = this.head;
        while (current.next) {
            current = current.next;
        }
        current.next = newNode;
        console.log("Appended " + data);
    }
    
    display() {
        // Print all nodes
        let elements = [];
        let current = this.head;
        while (current) {
            elements.push(current.data);
            current = current.next;
        }
        console.log(elements.join(" -> ") + " -> null");
    }
}

// Test it
let ll = new LinkedList();
ll.append(10);
ll.append(20);
ll.append(30);
ll.display();`
            },
            syntaxDiff: 'Both use classes with similar structure. Python uses self, JavaScript uses this.',
            quiz: [
                {
                    question: 'What does the LinkedList class track?',
                    options: ['All nodes in an array', 'The head (first node)', 'The size only', 'Nothing'],
                    correct: 1,
                    explanation: 'The LinkedList class keeps a reference to the head node. All operations navigate from there.'
                },
                {
                    question: 'To append (add to end), what must you do?',
                    options: [
                        'Just create a new node',
                        'Traverse to the last node and set its next pointer',
                        'Replace the head',
                        'Delete all nodes first'
                    ],
                    correct: 1,
                    explanation: 'To append, traverse to the last node (where next is null), then set its next to the new node.'
                }
            ]
        },
        {
            id: 'linkedlist-insert',
            title: 'Inserting Nodes',
            duration: '7 min',
            explanation: [
                {
                    type: 'text',
                    content: 'Insertion in a linked list is efficient! You just need to update pointers - no shifting elements like in arrays.'
                },
                {
                    type: 'tip',
                    content: 'Prepend (insert at start) is O(1) - just update the head! Insert at position requires traversal to that position first.'
                },
                {
                    type: 'warning',
                    content: 'Always update pointers in the right order! Connect the new node first, then update the previous node.'
                }
            ],
            keyConcepts: [
                'Prepend: O(1) - new node becomes head',
                'Insert at position: O(n) - traverse then insert',
                'Connect new node to next first',
                'Then update previous node\'s next pointer'
            ],
            code: {
                python: `# Python - Insert Operations
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None
    
    def prepend(self, data):
        """Insert at beginning - O(1)"""
        new_node = Node(data)
        new_node.next = self.head  # Point to old head
        self.head = new_node       # New node is now head
        print(f"Prepended {data}")
    
    def insert_at(self, position, data):
        """Insert at specific position"""
        if position == 0:
            self.prepend(data)
            return
        
        new_node = Node(data)
        current = self.head
        for i in range(position - 1):
            if current is None:
                return
            current = current.next
        
        new_node.next = current.next
        current.next = new_node
        print(f"Inserted {data} at position {position}")
    
    def display(self):
        elements = []
        current = self.head
        while current:
            elements.append(str(current.data))
            current = current.next
        print(" -> ".join(elements))

# Test
ll = LinkedList()
ll.prepend(30)
ll.prepend(10)
ll.insert_at(1, 20)  # Insert 20 between 10 and 30
ll.display()  # 10 -> 20 -> 30`,
                javascript: `// JavaScript - Insert Operations
class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

class LinkedList {
    constructor() {
        this.head = null;
    }
    
    prepend(data) {
        // Insert at beginning - O(1)
        let newNode = new Node(data);
        newNode.next = this.head;  // Point to old head
        this.head = newNode;       // New node is now head
        console.log("Prepended " + data);
    }
    
    insertAt(position, data) {
        // Insert at specific position
        if (position === 0) {
            this.prepend(data);
            return;
        }
        
        let newNode = new Node(data);
        let current = this.head;
        for (let i = 0; i < position - 1; i++) {
            if (!current) return;
            current = current.next;
        }
        
        newNode.next = current.next;
        current.next = newNode;
        console.log("Inserted " + data + " at position " + position);
    }
    
    display() {
        let elements = [];
        let current = this.head;
        while (current) {
            elements.push(current.data);
            current = current.next;
        }
        console.log(elements.join(" -> "));
    }
}

// Test
let ll = new LinkedList();
ll.prepend(30);
ll.prepend(10);
ll.insertAt(1, 20);  // Insert 20 between 10 and 30
ll.display();  // 10 -> 20 -> 30`
            },
            syntaxDiff: 'Python uses snake_case (insert_at), JavaScript uses camelCase (insertAt). Logic is identical.',
            quiz: [
                {
                    question: 'What is the time complexity of prepend (insert at head)?',
                    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
                    correct: 0,
                    explanation: 'Prepend is O(1) - just update the head pointer, no traversal needed!'
                },
                {
                    question: 'When inserting a new node, what must you do first?',
                    options: [
                        'Update the previous node\'s pointer',
                        'Connect the new node to the next node',
                        'Delete the old node',
                        'Traverse to the end'
                    ],
                    correct: 1,
                    explanation: 'First connect the new node to what comes after it, THEN update the previous node. This prevents losing the rest of the list.'
                }
            ]
        },
        {
            id: 'linkedlist-delete',
            title: 'Deleting Nodes',
            duration: '7 min',
            explanation: [
                {
                    type: 'text',
                    content: 'Deletion in a linked list involves finding the node and updating pointers to "skip over" it.'
                },
                {
                    type: 'tip',
                    content: 'To delete a node, make the previous node point to the node after the one being deleted!'
                },
                {
                    type: 'text',
                    content: 'Special case: deleting the head requires updating the head pointer to the second node.'
                }
            ],
            keyConcepts: [
                'Find the node before the one to delete',
                'Update its next to skip the deleted node',
                'Handle deleting head separately',
                'The deleted node gets garbage collected'
            ],
            code: {
                python: `# Python - Delete Operations
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None
    
    def append(self, data):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            return
        current = self.head
        while current.next:
            current = current.next
        current.next = new_node
    
    def delete(self, value):
        """Delete first node with given value"""
        if not self.head:
            return
        
        # Special case: delete head
        if self.head.data == value:
            self.head = self.head.next
            print(f"Deleted {value} (was head)")
            return
        
        # Find node before the one to delete
        current = self.head
        while current.next and current.next.data != value:
            current = current.next
        
        if current.next:
            current.next = current.next.next
            print(f"Deleted {value}")
    
    def display(self):
        elements = []
        current = self.head
        while current:
            elements.append(str(current.data))
            current = current.next
        print(" -> ".join(elements) if elements else "Empty list")

# Test
ll = LinkedList()
for val in [10, 20, 30, 40]:
    ll.append(val)
print("Before:", end=" ")
ll.display()

ll.delete(20)
print("After:", end=" ")
ll.display()`,
                javascript: `// JavaScript - Delete Operations
class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

class LinkedList {
    constructor() {
        this.head = null;
    }
    
    append(data) {
        let newNode = new Node(data);
        if (!this.head) {
            this.head = newNode;
            return;
        }
        let current = this.head;
        while (current.next) {
            current = current.next;
        }
        current.next = newNode;
    }
    
    delete(value) {
        // Delete first node with given value
        if (!this.head) return;
        
        // Special case: delete head
        if (this.head.data === value) {
            this.head = this.head.next;
            console.log("Deleted " + value + " (was head)");
            return;
        }
        
        // Find node before the one to delete
        let current = this.head;
        while (current.next && current.next.data !== value) {
            current = current.next;
        }
        
        if (current.next) {
            current.next = current.next.next;
            console.log("Deleted " + value);
        }
    }
    
    display() {
        let elements = [];
        let current = this.head;
        while (current) {
            elements.push(current.data);
            current = current.next;
        }
        console.log(elements.length ? elements.join(" -> ") : "Empty list");
    }
}

// Test
let ll = new LinkedList();
[10, 20, 30, 40].forEach(val => ll.append(val));
console.log("Before:");
ll.display();

ll.delete(20);
console.log("After:");
ll.display();`
            },
            syntaxDiff: 'Both use the same pointer manipulation logic. The key is updating current.next to skip the deleted node.',
            quiz: [
                {
                    question: 'To delete a node, which pointer do you update?',
                    options: [
                        'The deleted node\'s pointer',
                        'The previous node\'s next pointer',
                        'The head pointer always',
                        'All pointers in the list'
                    ],
                    correct: 1,
                    explanation: 'Update the previous node\'s next to point to the node after the one being deleted, effectively skipping it.'
                },
                {
                    question: 'What special case exists when deleting?',
                    options: [
                        'Deleting the last node',
                        'Deleting the head node',
                        'Deleting from an empty list',
                        'Both B and C'
                    ],
                    correct: 3,
                    explanation: 'Both deleting the head (need to update head pointer) and deleting from an empty list (nothing to delete) are special cases.'
                }
            ]
        }
    ]
};
