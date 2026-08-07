/**
 * Git & GitHub - Learning Path
 * Version control fundamentals every developer needs.
 */

export const GIT_PATH = {
    id: 'git',
    title: 'Git & GitHub',
    icon: '🔀',
    category: 'Cloud & DevOps',
    description: 'Track changes, branch fearlessly, and collaborate with Git and GitHub.',
    prerequisites: [],
    lessons: [
        {
            id: 'git-basics',
            title: 'Tracking Changes',
            duration: '7 min',
            explanation: [
                { type: 'text', content: '**Git** is a version control system: it records snapshots of your project so you can review history and undo mistakes.' },
                { type: 'text', content: 'A file moves through three areas: the **working directory** (your edits), the **staging area** (`git add`), and the **repository** (`git commit`).' },
                { type: 'tip', content: 'Commit small and often, with a clear message describing *why* the change was made.' },
            ],
            keyConcepts: [
                'git init creates a new repository',
                'git add stages changes for the next commit',
                'git commit records a snapshot with a message',
                'git status and git log show state and history',
            ],
            code: {
                bash: `# Start tracking a project
git init

# See what changed
git status

# Stage and commit
git add index.js
git commit -m "Add homepage script"

# Review history
git log --oneline`,
            },
            quiz: [
                {
                    question: 'Which command records a snapshot of your staged changes?',
                    options: ['git add', 'git commit', 'git status', 'git init'],
                    correct: 1,
                    explanation: 'git commit saves the staged changes as a new snapshot in history.',
                },
                {
                    question: 'What does the staging area hold?',
                    options: ['Deleted files only', 'Changes selected for the next commit', 'Remote branches', 'Your commit history'],
                    correct: 1,
                    explanation: 'git add moves changes into the staging area, ready to be committed.',
                },
            ],
        },
        {
            id: 'branching-merging',
            title: 'Branching & Merging',
            duration: '8 min',
            explanation: [
                { type: 'text', content: 'A **branch** is an independent line of work. You can build a feature on its own branch without disturbing `main`.' },
                { type: 'text', content: '**Merging** brings the changes from one branch into another. If two branches changed the same lines, Git reports a **merge conflict** for you to resolve.' },
                { type: 'warning', content: 'Always create a feature branch instead of committing directly to main on a shared project.' },
            ],
            keyConcepts: [
                'git branch lists or creates branches',
                'git checkout -b creates and switches in one step',
                'git merge combines another branch into the current one',
                'Conflicts happen when the same lines changed in both branches',
            ],
            code: {
                bash: `# Create and switch to a feature branch
git checkout -b feature/login

# ...make commits on the branch...
git add .
git commit -m "Add login form"

# Merge it back into main
git checkout main
git merge feature/login`,
            },
            quiz: [
                {
                    question: 'What does "git checkout -b feature/x" do?',
                    options: ['Deletes a branch', 'Creates a branch and switches to it', 'Merges two branches', 'Pushes to GitHub'],
                    correct: 1,
                    explanation: 'The -b flag creates the new branch and checks it out in one step.',
                },
                {
                    question: 'When does a merge conflict occur?',
                    options: ['Every merge', 'When two branches changed the same lines', 'When a branch is empty', 'Never'],
                    correct: 1,
                    explanation: 'Git can auto-merge unless both branches edited the same lines — then you resolve manually.',
                },
            ],
        },
        {
            id: 'remotes-github',
            title: 'Remotes & GitHub',
            duration: '8 min',
            explanation: [
                { type: 'text', content: 'A **remote** is a copy of your repo hosted elsewhere — usually **GitHub**. It lets you back up work and collaborate.' },
                { type: 'text', content: 'Use `git push` to send commits to the remote and `git pull` to fetch and merge others’ commits.' },
                { type: 'text', content: 'A **Pull Request (PR)** proposes merging your branch — teammates review and discuss before it lands.' },
                { type: 'tip', content: 'Pull before you start work to reduce conflicts with your teammates.' },
            ],
            keyConcepts: [
                'git remote links your repo to a hosted copy',
                'git push uploads local commits',
                'git pull downloads and merges remote commits',
                'Pull Requests enable review before merging',
            ],
            code: {
                bash: `# Connect to a GitHub repo
git remote add origin https://github.com/you/project.git

# Push your main branch
git push -u origin main

# Later: get teammates' changes
git pull

# Push a feature branch, then open a PR on GitHub
git push -u origin feature/login`,
            },
            quiz: [
                {
                    question: 'Which command uploads your local commits to GitHub?',
                    options: ['git pull', 'git push', 'git add', 'git log'],
                    correct: 1,
                    explanation: 'git push sends your local commits to the remote repository.',
                },
                {
                    question: 'What is the purpose of a Pull Request?',
                    options: ['To delete a repo', 'To propose and review changes before merging', 'To create a branch', 'To install Git'],
                    correct: 1,
                    explanation: 'A PR lets teammates review and discuss changes before they are merged.',
                },
            ],
        },
    ],
};
