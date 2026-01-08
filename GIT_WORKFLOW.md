# Git Workflow Guide for CodeViz

Complete guide for GitHub backup and professional branch workflow.

---

## 📋 Table of Contents
1. [Initial Setup](#initial-setup)
2. [Daily Workflow](#daily-workflow)
3. [Branch Strategy](#branch-strategy)
4. [Quick Commands](#quick-commands)
5. [Troubleshooting](#troubleshooting)

---

## 🚀 Initial Setup

### Step 1: Create .gitignore

```bash
# Navigate to project root
cd /Users/navin/CodeViz

# Create .gitignore file
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
__pycache__/
*.pyc
.Python
env/
venv/

# Build outputs
frontend/dist/
frontend/build/
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo
.DS_Store

# Environment variables (CRITICAL - never commit these!)
.env
.env.local
.env.*.local
backend/.env

# Testing
coverage/
.pytest_cache/

# Miscellaneous
*.bak
*.tmp
.cache/
.gemini/
EOF
```

### Step 2: Initialize Git Repository

```bash
# Initialize git (if not already done)
git init

# Check status
git status

# Add all files (respects .gitignore)
git add .

# Create initial commit
git commit -m "Initial commit: CodeViz with Phase 4 performance optimizations

- Complete visualization system for arrays, stacks, queues, trees, graphs
- Performance optimizations with useMemo, RAF, virtual scrolling
- Dark/Light theme system
- Code highlighting and step-by-step execution
- User authentication and snippet management"

# Verify commit
git log --oneline
```

### Step 3: Create GitHub Repository

**Via GitHub Website:**
1. Go to https://github.com
2. Click **"New"** button (green button, top right)
3. Repository name: `CodeViz`
4. Description: `Interactive code visualization tool with step-by-step execution`
5. Visibility: **Private** (recommended) or Public
6. **DO NOT** check "Initialize with README" (you already have code!)
7. Click **"Create repository"**

### Step 4: Connect Local to GitHub

```bash
# Add GitHub as remote (replace YOUR_USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/CodeViz.git

# Verify remote is added
git remote -v

# Rename branch to main (if it's 'master')
git branch -M main

# Push to GitHub for the first time
git push -u origin main
```

### Step 5: Set Up Branch Structure

```bash
# Create development branch
git checkout -b development

# Push development branch to GitHub
git push -u origin development

# You're now on 'development' branch
git branch  # Should show * development
```

---

## 🔄 Daily Workflow

### Starting a New Feature

```bash
# 1. Switch to development branch
git checkout development

# 2. Pull latest changes from GitHub
git pull origin development

# 3. Create feature branch (use descriptive names)
git checkout -b feature/keyboard-shortcuts

# 4. Work on your code...
# (make changes, test thoroughly)

# 5. Check what changed
git status
git diff

# 6. Stage changes
git add .

# 7. Commit with meaningful message
git commit -m "feat: Add keyboard shortcuts for play/pause and navigation"

# 8. Push feature branch to GitHub
git push -u origin feature/keyboard-shortcuts
```

### Merging Feature to Development

```bash
# 1. Make sure all changes are committed
git status

# 2. Switch to development
git checkout development

# 3. Pull latest changes
git pull origin development

# 4. Merge your feature
git merge feature/keyboard-shortcuts

# 5. Resolve conflicts if any (VS Code has good merge tools)

# 6. Push updated development
git push origin development

# 7. Delete feature branch locally (optional)
git branch -d feature/keyboard-shortcuts

# 8. Delete feature branch on GitHub (optional)
git push origin --delete feature/keyboard-shortcuts
```

### Releasing to Main (Production)

```bash
# Only when development is STABLE and TESTED

# 1. Switch to main
git checkout main

# 2. Pull latest
git pull origin main

# 3. Merge development into main
git merge development

# 4. Tag the release
git tag -a v1.0.0 -m "Release v1.0: Complete Phase 4 with performance optimizations"

# 5. Push main branch
git push origin main

# 6. Push tags
git push origin --tags
```

---

## 🌿 Branch Strategy

### Branch Hierarchy

```
main (production-ready, stable)
  ↑
development (integration branch, active development)
  ↑
feature/keyboard-shortcuts     (your work in progress)
feature/expanded-examples      (your work in progress)
bugfix/virtual-scroll-import   (bug fixes)
hotfix/critical-security-fix   (urgent fixes for main)
```

### Branch Naming Conventions

**Format:** `<type>/<description>`

**Types:**
- `feature/` - New features (e.g., `feature/export-to-png`)
- `bugfix/` - Bug fixes (e.g., `bugfix/theme-toggle-crash`)
- `hotfix/` - Urgent production fixes (e.g., `hotfix/security-patch`)
- `refactor/` - Code improvements (e.g., `refactor/optimize-canvas`)
- `docs/` - Documentation (e.g., `docs/update-readme`)
- `test/` - Testing (e.g., `test/add-performance-benchmarks`)

**Examples:**
```bash
git checkout -b feature/virtual-scrolling
git checkout -b bugfix/monaco-theme-sync
git checkout -b docs/add-contributing-guide
git checkout -b refactor/split-canvas-component
```

---

## ⚡ Quick Commands Reference

### Check Status

```bash
# See which branch you're on and what changed
git status

# See all branches (local and remote)
git branch -a

# See commit history
git log --oneline --graph --all

# See what changed in detail
git diff
```

### Switching Branches

```bash
# Switch to existing branch
git checkout development

# Create and switch to new branch
git checkout -b feature/my-feature

# Quickly switch to previous branch
git checkout -
```

### Staging & Committing

```bash
# Stage all changes
git add .

# Stage specific file
git add frontend/src/components/Canvas.jsx

# Commit staged changes
git commit -m "feat: Add new feature"

# Stage and commit in one command
git commit -am "fix: Quick bug fix"
```

### Pushing & Pulling

```bash
# Push current branch
git push

# Push and set upstream (first time)
git push -u origin feature/my-feature

# Pull latest changes
git pull

# Pull from specific branch
git pull origin development
```

### Undoing Changes

```bash
# Discard changes in working directory (CAREFUL!)
git checkout -- filename.js

# Unstage file (keep changes)
git reset HEAD filename.js

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes) (CAREFUL!)
git reset --hard HEAD~1

# Revert a commit (creates new commit)
git revert abc123
```

### Stashing (Temporary Save)

```bash
# Save work in progress temporarily
git stash

# See stashed changes
git stash list

# Apply most recent stash
git stash pop

# Apply specific stash
git stash apply stash@{0}

# Clear all stashes
git stash clear
```

---

## 📝 Commit Message Best Practices

### Format

```
<type>: <short description>

[optional body]

[optional footer]
```

### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code change that neither fixes a bug nor adds a feature
- `style:` - Formatting, missing semicolons, etc.
- `docs:` - Documentation only changes
- `test:` - Adding or updating tests
- `chore:` - Updating dependencies, build tasks, etc.
- `perf:` - Performance improvements

### Examples

```bash
git commit -m "feat: Add virtual scrolling for large arrays"

git commit -m "fix: Resolve theme toggle crash on Safari

- Add null check for localStorage
- Handle missing theme preference
- Add fallback to dark theme"

git commit -m "refactor: Extract array rendering to separate component"

git commit -m "docs: Update README with installation instructions"

git commit -m "perf: Optimize resize handler with requestAnimationFrame"
```

---

## 🛡️ Protecting Main Branch (GitHub Settings)

### Enable Branch Protection

1. Go to your GitHub repository
2. Click **Settings** (top navigation)
3. Click **Branches** (left sidebar)
4. Under "Branch protection rules", click **Add rule**
5. Branch name pattern: `main`
6. Enable these settings:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (1 approval)
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require status checks to pass before merging (if you set up CI/CD)
7. Click **Create** or **Save changes**

Now you **cannot** accidentally push directly to main!

---

## 🔧 Working with Pull Requests

### Creating a Pull Request

1. Push your feature branch to GitHub
   ```bash
   git push -u origin feature/my-feature
   ```

2. Go to your GitHub repository
3. GitHub will show **"Compare & pull request"** button - click it
4. Fill in:
   - Base: `development` (usually)
   - Compare: `feature/my-feature`
   - Title: Clear description
   - Description: What changed and why
5. Click **Create pull request**
6. Review, get approval, then **Merge**

---

## 🚨 Troubleshooting

### Accidentally Committed to Wrong Branch

```bash
# If you haven't pushed yet
git reset --soft HEAD~1  # Undo commit, keep changes
git stash                # Save changes
git checkout correct-branch
git stash pop            # Apply changes
git add .
git commit -m "Your message"
```

### Merge Conflicts

```bash
# When merge shows conflicts
git merge feature/my-feature
# CONFLICT (content): Merge conflict in file.js

# 1. Open conflicted files in VS Code
# 2. Look for conflict markers:
#    <<<<<<< HEAD
#    your code
#    =======
#    their code
#    >>>>>>> feature/my-feature

# 3. Edit to resolve, remove markers
# 4. Stage resolved files
git add file.js

# 5. Complete merge
git commit
```

### Forgot to Pull Before Starting Work

```bash
# You have local commits but remote has new commits
git pull origin development --rebase

# If conflicts, resolve them, then:
git add .
git rebase --continue
```

### Need to Update Feature Branch with Latest Development

```bash
# You're on feature branch and development has new changes
git checkout development
git pull origin development
git checkout feature/my-feature
git merge development
# Or use rebase for cleaner history:
git rebase development
```

### Pushed Secret/Password by Mistake

```bash
# IMMEDIATELY rotate/change the secret!

# Remove from history (CAREFUL!)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/.env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (notify team first!)
git push origin --force --all
```

---

## 📊 Useful Aliases (Optional)

Add to `~/.gitconfig`:

```ini
[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    cm = commit -m
    pl = pull
    ps = push
    lg = log --oneline --graph --all --decorate
    unstage = reset HEAD --
    last = log -1 HEAD
    visual = log --oneline --graph --all --decorate --color
```

Usage:
```bash
git st          # Instead of git status
git co main     # Instead of git checkout main
git cm "message" # Instead of git commit -m "message"
git lg          # Beautiful commit graph
```

---

## 🎯 Common Workflows Cheat Sheet

### "I want to start a new feature"
```bash
git checkout development
git pull
git checkout -b feature/my-feature
```

### "I finished my feature"
```bash
git add .
git commit -m "feat: Description"
git push -u origin feature/my-feature
# Then create PR on GitHub
```

### "I need to fix a bug quickly"
```bash
git checkout development
git pull
git checkout -b bugfix/issue-description
# Fix bug, commit, push, PR
```

### "I want to update my local repository"
```bash
git fetch --all
git checkout development
git pull origin development
```

### "I made a mistake in my last commit message"
```bash
git commit --amend -m "New correct message"
git push --force-with-lease  # If already pushed
```

---

## 📚 Learning Resources

- **Official Git Documentation:** https://git-scm.com/doc
- **GitHub Guides:** https://guides.github.com/
- **Interactive Git Tutorial:** https://learngitbranching.js.org/
- **Git Cheat Sheet:** https://education.github.com/git-cheat-sheet-education.pdf

---

## ✅ Pre-Push Checklist

Before pushing to GitHub:

- [ ] Code works and is tested locally
- [ ] No console errors or warnings
- [ ] Removed any `console.log()` debugging statements
- [ ] Updated relevant documentation
- [ ] `.env` files are in `.gitignore`
- [ ] No sensitive data (passwords, API keys) in code
- [ ] Commit messages are clear and descriptive
- [ ] Code follows project style guidelines

---

**Created:** January 2026  
**Last Updated:** January 8, 2026  
**Project:** CodeViz  
**Author:** Navin

---

## 💡 Pro Tips

1. **Commit often** - Small, focused commits are better than huge ones
2. **Write clear messages** - Your future self will thank you
3. **Pull before push** - Avoid merge conflicts
4. **Test before merging** - Never merge broken code
5. **Use branches** - Never work directly on main
6. **Review your diffs** - Use `git diff` before committing
7. **Keep .gitignore updated** - Essential for clean repository

**Happy Coding! 🚀**
