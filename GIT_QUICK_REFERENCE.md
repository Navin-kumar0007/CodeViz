# Quick Git Commands - CodeViz

Essential commands for daily use. Keep this handy!

---

## 🚀 Setup (One-Time)

```bash
cd /Users/navin/CodeViz
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/CodeViz.git
git branch -M main
git push -u origin main
git checkout -b development
git push -u origin development
```

---

## 📅 Daily Use

### Start New Feature
```bash
git checkout development
git pull
git checkout -b feature/my-feature-name
```

### Save Your Work
```bash
git add .
git commit -m "feat: What you did"
git push
```

### Finish Feature
```bash
git checkout development
git merge feature/my-feature-name
git push origin development
```

---

## 🆘 Emergency Commands

### Undo Last Commit (Keep Changes)
```bash
git reset --soft HEAD~1
```

### Discard All Local Changes
```bash
git reset --hard
```

### See What Changed
```bash
git status
git diff
```

### Fix Wrong Branch
```bash
git stash
git checkout correct-branch
git stash pop
```

---

## 📋 Commit Message Templates

```bash
feat: Add new feature
fix: Fix bug
refactor: Improve code
docs: Update docs
style: Format code
perf: Improve performance
test: Add tests
chore: Update dependencies
```

---

**Need more details? See GIT_WORKFLOW.md**
