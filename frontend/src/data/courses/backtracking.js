/**
 * Backtracking - Learning Path
 * Learn to systematically search for all possible solutions
 */

export const BACKTRACKING_PATH = {
    id: 'backtracking',
    title: 'Backtracking',
    icon: '🔙',
    description: 'Master recursive choice generators for permutations, combinations, and puzzle-solving.',
    prerequisites: ['recursion', 'trees'],
    lessons: [
        {
            id: 'what-is-backtracking',
            title: 'Intro to Backtracking',
            duration: '10 min',
            explanation: [
                {
                    type: 'text',
                    content: '**Backtracking** is a general algorithm for finding all (or some) solutions to computational problems by incrementally building candidates, and abandoning a candidate ("backtracking") as soon as you determine it cannot possibly lead to a valid solution.'
                },
                {
                    type: 'tip',
                    content: 'Think of walking through a maze. You pick a path, follow it until you hit a dead end, and then BACKTRACK to the previous intersection to pick a different path. This is fundamentally a Depth-First Search (DFS) on an imaginary "Choice Tree"!'
                },
                {
                    type: 'text',
                    content: 'Backtracking is explicitly used for combinatorial problems: Finding all Permutations, Subsets/Combinations, solving Sudoku, and the N-Queens problem.'
                }
            ],
            keyConcepts: [
                'Choose (add a choice to your current slate)',
                'Explore (recursively call your function down that path)',
                'Un-Choose (remove the choice from the slate before the next loop iterations)'
            ],
            code: {
                python: `# Python - Generating Subsets
def subsets(nums):
    result = []
    
    def backtrack(start_idx, current_path):
        # 1. Base Case: Add the current built path to the result
        result.append(list(current_path))
        
        # 2. Iterate through all remaining possible choices
        for i in range(start_idx, len(nums)):
            # CHOOSE
            current_path.append(nums[i])
            
            # EXPLORE
            backtrack(i + 1, current_path)
            
            # UN-CHOOSE (Backtrack)
            current_path.pop()
            
    backtrack(0, [])
    return result

print(subsets([1, 2, 3]))
# Out: [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]`,
                javascript: `// JavaScript - Generating Subsets
function subsets(nums) {
    const result = [];
    
    function backtrack(startIdx, currentPath) {
        // 1. Snapshot the current path and add to results
        result.push([...currentPath]);
        
        // 2. Iterate through choices
        for (let i = startIdx; i < nums.length; i++) {
            // CHOOSE
            currentPath.push(nums[i]);
            
            // EXPLORE
            backtrack(i + 1, currentPath);
            
            // UN-CHOOSE
            currentPath.pop();
        }
    }
    
    backtrack(0, []);
    return result;
}

console.log(subsets([1, 2, 3]));`,
                java: `// Java - Generating Subsets
public List<List<Integer>> subsets(int[] nums) {
    List<List<Integer>> list = new ArrayList<>();
    backtrack(list, new ArrayList<>(), nums, 0);
    return list;
}

private void backtrack(List<List<Integer>> list, List<Integer> tempList, int [] nums, int start){
    list.add(new ArrayList<>(tempList)); // Deep copy
    for(int i = start; i < nums.length; i++){
        tempList.add(nums[i]); // CHOOSE
        backtrack(list, tempList, nums, i + 1); // EXPLORE
        tempList.remove(tempList.size() - 1); // UNCHOOSE
    }
}`,
                cpp: `// C++ - Generating Subsets
vector<vector<int>> subsets(vector<int>& nums) {
    vector<vector<int>> res;
    vector<int> current;
    backtrack(nums, 0, current, res);
    return res;
}

void backtrack(vector<int>& nums, int start, vector<int>& current, vector<vector<int>>& res) {
    res.push_back(current); 
    for (int i = start; i < nums.size(); i++) {
        current.push_back(nums[i]); // Choose
        backtrack(nums, i + 1, current, res); // Explore
        current.pop_back(); // Un-choose
    }
}`,
                c: `// C - Generating Subsets (Requires manual array memory tracking)
void backtrack(int* nums, int numsSize, int start, int* current, int currentSize, int** result, int* returnSize, int** returnColumnSizes) {
    result[*returnSize] = (int*)malloc(currentSize * sizeof(int));
    for (int i = 0; i < currentSize; i++) result[*returnSize][i] = current[i];
    (*returnColumnSizes)[*returnSize] = currentSize;
    (*returnSize)++;
    
    for (int i = start; i < numsSize; i++) {
        current[currentSize] = nums[i]; // Choose
        backtrack(nums, numsSize, i + 1, current, currentSize + 1, result, returnSize, returnColumnSizes); // Explore
        // Un-choose happens implicitly by not incrementing currentSize reference
    }
}`,
                go: `// Go - Generating Subsets
func subsets(nums []int) [][]int {
    var res [][]int
    var backtrack func(int, []int)
    
    backtrack = func(start int, current []int) {
        // Deep copy the slice in Go to avoid mutation bugs
        temp := make([]int, len(current))
        copy(temp, current)
        res = append(res, temp)
        
        for i := start; i < len(nums); i++ {
            current = append(current, nums[i])
            backtrack(i+1, current)
            current = current[:len(current)-1] // Pop last
        }
    }
    
    backtrack(0, []int{})
    return res
}`,
                typescript: `// TypeScript - Generating Subsets
function subsets(nums: number[]): number[][] {
    const result: number[][] = [];
    
    function backtrack(startIdx: number, currentPath: number[]) {
        result.push([...currentPath]); 
        
        for (let i = startIdx; i < nums.length; i++) {
            currentPath.push(nums[i]);
            backtrack(i + 1, currentPath);
            currentPath.pop();
        }
    }
    
    backtrack(0, []);
    return result;
}`
            },
            syntaxDiff: 'Subsets rely heavily on deep-copying arrays/lists. In Python, `list(path)` or `path[:]` is used. JS/TS use spread syntax `[...path]`. Java explicitly creates a `new ArrayList<>(path)`. Go requires a manual `make()` and `copy()`.',
            quiz: [
                {
                    question: 'Why must we create a copy of the "current_path" before appending it to our results array?',
                    options: [
                        'To prevent infinite recursion',
                        'Because the final UN-CHOOSE will empty the array, wiping it out if passed by reference',
                        'To prevent memory leaks',
                        'To force the program to stop early'
                    ],
                    correct: 1,
                    explanation: 'Languages like JS, Python, and Java pass arrays entirely by memory reference. If you add `currentPath` to your `results` array without cloning it, you will just have an array of 8 identical references to an empty array by the time the backtracking completes all of its `.pop()` maneuvers.'
                },
                {
                    question: 'If generating all possible sub-combinations of a string using backtracking, what is the fundamental time complexity?',
                    options: ['O(N)', 'O(N²)', 'O(N log N)', 'O(2^N)'],
                    correct: 3,
                    explanation: 'Combinatorics are inherently exponential. Generating all subsets creates 2^N possible unique combinations. Permutations take O(N!). Backtracking does not escape this time complexity.'
                }
            ]
        }
    ]
};
