import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Git Tutorial Content ──
const GIT_LESSONS = [
    {
        id: 'intro', title: 'What is Git?', icon: '📖',
        content: `Git is a distributed version control system that tracks changes in your code. It allows multiple developers to collaborate, revert to previous states, and manage different versions of a project.`,
        commands: [
            { cmd: 'git --version', desc: 'Check if Git is installed' },
            { cmd: 'git config --global user.name "Your Name"', desc: 'Set your name' },
            { cmd: 'git config --global user.email "you@email.com"', desc: 'Set your email' },
        ],
        visual: { type: 'flow', nodes: ['Working Directory', 'Staging Area', 'Local Repository', 'Remote Repository'] }
    },
    {
        id: 'init', title: 'Initialize & Clone', icon: '🏁',
        content: `Every Git project starts with initialization. You can either create a new repository from scratch or clone an existing one from a remote server like GitHub.`,
        commands: [
            { cmd: 'git init', desc: 'Create a new Git repository' },
            { cmd: 'git clone <url>', desc: 'Clone a remote repository' },
            { cmd: 'git remote -v', desc: 'View connected remotes' },
        ],
        visual: { type: 'flow', nodes: ['Empty Folder', 'git init', '.git/ created', 'Ready to track!'] }
    },
    {
        id: 'basics', title: 'Add, Commit, Push', icon: '📦',
        content: `The three core operations: Stage changes (add), create snapshots (commit), and upload to remote (push). This is the daily workflow every developer uses.`,
        commands: [
            { cmd: 'git add .', desc: 'Stage all changes' },
            { cmd: 'git add <file>', desc: 'Stage specific file' },
            { cmd: 'git commit -m "message"', desc: 'Create a snapshot' },
            { cmd: 'git push origin main', desc: 'Upload to remote' },
            { cmd: 'git status', desc: 'Check current state' },
        ],
        visual: { type: 'flow', nodes: ['Edit Files', 'git add', 'Staged', 'git commit', 'Committed', 'git push', 'Remote'] }
    },
    {
        id: 'branch', title: 'Branching', icon: '🌿',
        content: `Branches let you work on features, fixes, or experiments in isolation. The default branch is usually "main" or "master". Creating branches is cheap and fast in Git.`,
        commands: [
            { cmd: 'git branch', desc: 'List all branches' },
            { cmd: 'git branch feature-x', desc: 'Create a new branch' },
            { cmd: 'git checkout feature-x', desc: 'Switch to a branch' },
            { cmd: 'git checkout -b feature-x', desc: 'Create + switch in one step' },
            { cmd: 'git branch -d feature-x', desc: 'Delete a branch' },
        ],
        visual: { type: 'branch', branches: ['main', 'feature-x', 'bugfix'] }
    },
    {
        id: 'merge', title: 'Merging', icon: '🔀',
        content: `Merging combines changes from different branches. Fast-forward merges happen when there's a linear path. Three-way merges create a new "merge commit" when branches have diverged.`,
        commands: [
            { cmd: 'git merge feature-x', desc: 'Merge feature-x into current branch' },
            { cmd: 'git merge --no-ff feature-x', desc: 'Force a merge commit' },
            { cmd: 'git merge --abort', desc: 'Cancel a conflicting merge' },
        ],
        visual: { type: 'merge' }
    },
    {
        id: 'rebase', title: 'Rebasing', icon: '📐',
        content: `Rebasing re-applies your commits on top of another branch's tip. It creates a cleaner, linear history compared to merging. Use it to keep feature branches up-to-date with main.`,
        commands: [
            { cmd: 'git rebase main', desc: 'Rebase current branch onto main' },
            { cmd: 'git rebase -i HEAD~3', desc: 'Interactive rebase (squash/edit last 3 commits)' },
            { cmd: 'git rebase --abort', desc: 'Cancel an ongoing rebase' },
        ],
        visual: { type: 'rebase' }
    },
    {
        id: 'stash', title: 'Stashing', icon: '📋',
        content: `Stash temporarily saves uncommitted changes so you can switch branches without committing incomplete work. Think of it as a clipboard for your code changes.`,
        commands: [
            { cmd: 'git stash', desc: 'Save current changes to stash' },
            { cmd: 'git stash list', desc: 'View all stashed changes' },
            { cmd: 'git stash pop', desc: 'Apply + remove latest stash' },
            { cmd: 'git stash apply', desc: 'Apply stash (keep in list)' },
            { cmd: 'git stash drop', desc: 'Delete a stash entry' },
        ],
        visual: { type: 'flow', nodes: ['Dirty Working Dir', 'git stash', 'Clean State', 'Switch Branch', 'git stash pop', 'Changes Restored'] }
    },
    {
        id: 'log', title: 'History & Diffs', icon: '📜',
        content: `Git maintains a complete history of all changes. You can view commit logs, compare differences between versions, and even search through history.`,
        commands: [
            { cmd: 'git log --oneline', desc: 'Compact commit history' },
            { cmd: 'git log --graph --all', desc: 'Visual branch graph' },
            { cmd: 'git diff', desc: 'Show unstaged changes' },
            { cmd: 'git diff --staged', desc: 'Show staged changes' },
            { cmd: 'git show <hash>', desc: 'View a specific commit' },
        ],
        visual: { type: 'commits' }
    },
    {
        id: 'undo', title: 'Undoing Changes', icon: '⏪',
        content: `Git provides several ways to undo changes at different stages. Understanding when to use reset, revert, or checkout is crucial for safe recovery.`,
        commands: [
            { cmd: 'git checkout -- <file>', desc: 'Discard unstaged file changes' },
            { cmd: 'git reset HEAD <file>', desc: 'Unstage a file' },
            { cmd: 'git reset --soft HEAD~1', desc: 'Undo last commit (keep changes)' },
            { cmd: 'git reset --hard HEAD~1', desc: 'Undo last commit (discard changes)' },
            { cmd: 'git revert <hash>', desc: 'Create a reverse commit' },
        ],
        visual: { type: 'flow', nodes: ['Committed', 'reset --soft', 'Staged', 'reset --mixed', 'Working Dir', 'reset --hard', 'Gone!'] }
    },
    {
        id: 'github', title: 'GitHub Workflows', icon: '🐙',
        content: `GitHub extends Git with pull requests, issues, actions, and more. The Fork-and-PR workflow is the standard for open-source contribution.`,
        commands: [
            { cmd: 'git remote add origin <url>', desc: 'Connect to GitHub' },
            { cmd: 'git push -u origin main', desc: 'Push and set upstream' },
            { cmd: 'git pull origin main', desc: 'Fetch + merge from remote' },
            { cmd: 'git fetch --all', desc: 'Download without merging' },
        ],
        visual: { type: 'flow', nodes: ['Fork Repo', 'Clone Fork', 'Create Branch', 'Make Changes', 'Push to Fork', 'Open PR', 'Review & Merge'] }
    },
];

const CHEAT_SHEET = {
    'Setup': [
        { cmd: 'git init', desc: 'Initialize a new repo' },
        { cmd: 'git clone <url>', desc: 'Clone a remote repo' },
        { cmd: 'git config --list', desc: 'View all settings' },
    ],
    'Daily Workflow': [
        { cmd: 'git status', desc: 'Check file states' },
        { cmd: 'git add .', desc: 'Stage everything' },
        { cmd: 'git commit -m "msg"', desc: 'Commit staged changes' },
        { cmd: 'git push', desc: 'Push to remote' },
        { cmd: 'git pull', desc: 'Fetch + merge remote' },
    ],
    'Branching': [
        { cmd: 'git branch', desc: 'List branches' },
        { cmd: 'git checkout -b <name>', desc: 'Create + switch branch' },
        { cmd: 'git merge <branch>', desc: 'Merge branch into current' },
        { cmd: 'git branch -d <name>', desc: 'Delete branch' },
    ],
    'History': [
        { cmd: 'git log --oneline', desc: 'Compact log' },
        { cmd: 'git diff', desc: 'View unstaged changes' },
        { cmd: 'git blame <file>', desc: 'Who changed what' },
        { cmd: 'git reflog', desc: 'Recovery history' },
    ],
    'Undo': [
        { cmd: 'git reset --soft HEAD~1', desc: 'Undo commit, keep changes' },
        { cmd: 'git stash', desc: 'Temporarily save changes' },
        { cmd: 'git revert <hash>', desc: 'Reverse a commit safely' },
        { cmd: 'git clean -fd', desc: 'Remove untracked files' },
    ],
};

// ── Visual Components ──
const FlowVisual = ({ nodes }) => (
    <div style={V.flowContainer}>
        {nodes.map((n, i) => (
            <React.Fragment key={i}>
                <div style={V.flowNode}>{n}</div>
                {i < nodes.length - 1 && <div style={V.flowArrow}>→</div>}
            </React.Fragment>
        ))}
    </div>
);

const BranchVisual = () => (
    <div style={V.branchContainer}>
        <div style={V.branchLine}>
            <span style={V.branchLabel}>main</span>
            {['C1', 'C2', 'C3', 'C4', 'C5'].map(c => (
                <span key={c} style={{ ...V.commit, background: '#48bb78' }}>{c}</span>
            ))}
        </div>
        <div style={{ ...V.branchLine, marginLeft: '60px' }}>
            <span style={V.branchLabel}>feature</span>
            <span style={V.branchFork}>↗</span>
            {['F1', 'F2', 'F3'].map(c => (
                <span key={c} style={{ ...V.commit, background: '#667eea' }}>{c}</span>
            ))}
        </div>
        <div style={{ ...V.branchLine, marginLeft: '100px' }}>
            <span style={V.branchLabel}>bugfix</span>
            <span style={V.branchFork}>↗</span>
            {['B1', 'B2'].map(c => (
                <span key={c} style={{ ...V.commit, background: '#f56565' }}>{c}</span>
            ))}
        </div>
    </div>
);

const MergeVisual = () => (
    <div style={V.mergeContainer}>
        <div style={V.mergeRow}>
            <span style={V.branchLabel}>main</span>
            {['C1', 'C2', 'C3'].map(c => <span key={c} style={{ ...V.commit, background: '#48bb78' }}>{c}</span>)}
            <span style={{ ...V.commit, background: '#d69e2e', border: '2px solid #ffd700' }}>M</span>
            <span style={{ ...V.commit, background: '#48bb78' }}>C4</span>
        </div>
        <div style={{ ...V.mergeRow, marginLeft: '60px' }}>
            <span style={V.branchLabel}>feature</span>
            <span style={V.branchFork}>↗</span>
            {['F1', 'F2'].map(c => <span key={c} style={{ ...V.commit, background: '#667eea' }}>{c}</span>)}
            <span style={{ ...V.branchFork, transform: 'scaleY(-1)' }}>↗</span>
        </div>
        <div style={{ textAlign: 'center', color: '#888', fontSize: '11px', marginTop: '8px' }}>
            Merge creates commit M that combines both histories
        </div>
    </div>
);

const RebaseVisual = () => (
    <div style={V.mergeContainer}>
        <div style={{ color: '#888', fontSize: '11px', marginBottom: '8px', fontWeight: 600 }}>Before rebase:</div>
        <div style={V.mergeRow}>
            <span style={V.branchLabel}>main</span>
            {['C1', 'C2', 'C3'].map(c => <span key={c} style={{ ...V.commit, background: '#48bb78' }}>{c}</span>)}
        </div>
        <div style={{ ...V.mergeRow, marginLeft: '40px' }}>
            <span style={V.branchLabel}>feature</span>
            <span style={V.branchFork}>↗</span>
            {['F1', 'F2'].map(c => <span key={c} style={{ ...V.commit, background: '#667eea' }}>{c}</span>)}
        </div>
        <div style={{ color: '#888', fontSize: '11px', margin: '12px 0 8px', fontWeight: 600 }}>After rebase:</div>
        <div style={V.mergeRow}>
            <span style={V.branchLabel}>main</span>
            {['C1', 'C2', 'C3'].map(c => <span key={c} style={{ ...V.commit, background: '#48bb78' }}>{c}</span>)}
            {["F1'", "F2'"].map(c => <span key={c} style={{ ...V.commit, background: '#667eea', borderStyle: 'dashed' }}>{c}</span>)}
        </div>
        <div style={{ textAlign: 'center', color: '#888', fontSize: '11px', marginTop: '8px' }}>
            Rebase moves feature commits on top of main — linear history!
        </div>
    </div>
);

const CommitsVisual = () => (
    <div style={V.commitsContainer}>
        {[
            { hash: 'a1b2c3d', msg: 'feat: add user auth', time: '2 hours ago', color: '#48bb78' },
            { hash: 'e4f5g6h', msg: 'fix: resolve login bug', time: '5 hours ago', color: '#f56565' },
            { hash: 'i7j8k9l', msg: 'refactor: clean up API', time: '1 day ago', color: '#667eea' },
            { hash: 'm0n1o2p', msg: 'docs: update README', time: '2 days ago', color: '#d69e2e' },
        ].map((c, i) => (
            <div key={i} style={V.commitRow}>
                <span style={{ ...V.commitDot, background: c.color }} />
                <code style={V.commitHash}>{c.hash}</code>
                <span style={V.commitMsg}>{c.msg}</span>
                <span style={V.commitTime}>{c.time}</span>
            </div>
        ))}
    </div>
);

const VisualRenderer = ({ visual }) => {
    if (!visual) return null;
    switch (visual.type) {
        case 'flow': return <FlowVisual nodes={visual.nodes} />;
        case 'branch': return <BranchVisual />;
        case 'merge': return <MergeVisual />;
        case 'rebase': return <RebaseVisual />;
        case 'commits': return <CommitsVisual />;
        default: return null;
    }
};

// ── Main GitLearn Component ──
const GitLearn = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('tutorial');
    const [activeLessonIdx, setActiveLessonIdx] = useState(0);
    const [completedLessons, setCompletedLessons] = useState(new Set());

    const lesson = GIT_LESSONS[activeLessonIdx];

    const markComplete = useCallback(() => {
        setCompletedLessons(prev => {
            const next = new Set(prev);
            next.add(lesson.id);
            return next;
        });
        if (activeLessonIdx < GIT_LESSONS.length - 1) {
            setActiveLessonIdx(i => i + 1);
        }
    // eslint-disable-next-line react-hooks/preserve-manual-memoization, react-hooks/exhaustive-deps
    }, [lesson?.id, activeLessonIdx]);

    return (
        <div style={S.page}>
            {/* Header */}
            <header style={S.header}>
                <button onClick={() => navigate('/')} style={S.backBtn}>← Dashboard</button>
                <h2 style={S.title}>🐙 Git & GitHub Learning</h2>
                <div style={S.progress}>
                    {completedLessons.size}/{GIT_LESSONS.length} completed
                    <div style={S.progressBar}>
                        <div style={{ ...S.progressFill, width: `${(completedLessons.size / GIT_LESSONS.length) * 100}%` }} />
                    </div>
                </div>
            </header>

            {/* Section Tabs */}
            <div style={S.sectionTabs}>
                {[
                    { id: 'tutorial', label: '📖 Interactive Tutorial' },
                    { id: 'cheatsheet', label: '📋 Cheat Sheet' },
                ].map(s => (
                    <button key={s.id} onClick={() => setActiveSection(s.id)}
                        style={{ ...S.sectionTab, ...(activeSection === s.id ? S.sectionTabActive : {}) }}>
                        {s.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeSection === 'tutorial' ? (
                <div style={S.tutorialLayout}>
                    {/* Sidebar - Lesson List */}
                    <div style={S.lessonSidebar}>
                        {GIT_LESSONS.map((l, i) => (
                            <button key={l.id} onClick={() => setActiveLessonIdx(i)}
                                style={{
                                    ...S.lessonItem,
                                    ...(i === activeLessonIdx ? S.lessonItemActive : {}),
                                    ...(completedLessons.has(l.id) ? S.lessonItemDone : {}),
                                }}>
                                <span style={S.lessonIcon}>{completedLessons.has(l.id) ? '✅' : l.icon}</span>
                                <span style={S.lessonTitle}>{l.title}</span>
                            </button>
                        ))}
                    </div>

                    {/* Main Content */}
                    <div style={S.lessonContent}>
                        <div style={S.lessonHeader}>
                            <h3 style={S.lessonName}>{lesson.icon} {lesson.title}</h3>
                            <span style={S.lessonStep}>Step {activeLessonIdx + 1} of {GIT_LESSONS.length}</span>
                        </div>

                        {/* Explanation */}
                        <p style={S.lessonText}>{lesson.content}</p>

                        {/* Visual */}
                        <div style={S.visualBox}>
                            <h4 style={S.visualTitle}>🎨 Visual Explanation</h4>
                            <VisualRenderer visual={lesson.visual} />
                        </div>

                        {/* Commands */}
                        <div style={S.commandsSection}>
                            <h4 style={S.commandsTitle}>💻 Key Commands</h4>
                            {lesson.commands.map((c, i) => (
                                <div key={i} style={S.commandRow}>
                                    <code style={S.commandCode}>{c.cmd}</code>
                                    <span style={S.commandDesc}>{c.desc}</span>
                                </div>
                            ))}
                        </div>

                        {/* Navigation */}
                        <div style={S.navRow}>
                            <button onClick={() => setActiveLessonIdx(i => Math.max(0, i - 1))}
                                disabled={activeLessonIdx === 0} style={S.navBtn}>
                                ← Previous
                            </button>
                            <button onClick={markComplete}
                                style={{ ...S.navBtn, ...S.navBtnPrimary }}>
                                {completedLessons.has(lesson.id) ? '✅ Completed' :
                                    activeLessonIdx < GIT_LESSONS.length - 1 ? 'Mark Complete & Next →' : 'Mark Complete ✓'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                /* Cheat Sheet */
                <div style={S.cheatSheet}>
                    {Object.entries(CHEAT_SHEET).map(([category, commands]) => (
                        <div key={category} style={S.cheatCategory}>
                            <h3 style={S.cheatCategoryTitle}>{category}</h3>
                            {commands.map((c, i) => (
                                <div key={i} style={S.cheatRow}>
                                    <code style={S.cheatCmd}>{c.cmd}</code>
                                    <span style={S.cheatDesc}>{c.desc}</span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ── Visual Styles ──
const V = {
    flowContainer: { display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', padding: '16px' },
    flowNode: {
        padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
        background: 'rgba(102,126,234,0.15)', color: '#a5b4fc', border: '1px solid rgba(102,126,234,0.3)',
    },
    flowArrow: { color: '#555', fontSize: '16px', fontWeight: 'bold' },
    branchContainer: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' },
    branchLine: { display: 'flex', alignItems: 'center', gap: '8px' },
    branchLabel: { fontSize: '11px', fontWeight: 700, color: '#888', minWidth: '50px', fontFamily: 'monospace' },
    commit: {
        width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: '#fff', border: '2px solid transparent',
    },
    branchFork: { color: '#555', fontSize: '14px' },
    mergeContainer: { padding: '16px' },
    mergeRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
    commitsContainer: { padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' },
    commitRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' },
    commitDot: { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0 },
    commitHash: { fontSize: '11px', fontFamily: 'monospace', color: '#667eea', background: 'rgba(102,126,234,0.1)', padding: '2px 6px', borderRadius: '4px' },
    commitMsg: { fontSize: '13px', color: '#d1d5db', flex: 1 },
    commitTime: { fontSize: '11px', color: '#666', whiteSpace: 'nowrap' },
};

// ── Page Styles ──
const S = {
    page: { padding: '24px 32px', maxWidth: '1200px', margin: '0 auto', color: '#e4e4e7' },
    header: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' },
    backBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#888', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' },
    title: { margin: 0, fontSize: '24px', fontWeight: 800, flex: 1 },
    progress: { fontSize: '12px', color: '#888', display: 'flex', alignItems: 'center', gap: '10px' },
    progressBar: { width: '120px', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' },
    progressFill: { height: '100%', background: 'linear-gradient(90deg, #48bb78, #38a169)', borderRadius: '3px', transition: 'width 0.3s' },

    sectionTabs: { display: 'flex', gap: '8px', marginBottom: '20px' },
    sectionTab: {
        padding: '10px 20px', border: 'none', borderRadius: '10px',
        background: 'rgba(255,255,255,0.04)', color: '#888', fontSize: '13px', fontWeight: 600,
        cursor: 'pointer', transition: 'all 0.2s',
    },
    sectionTabActive: { background: 'rgba(102,126,234,0.15)', color: '#a5b4fc', border: '1px solid rgba(102,126,234,0.3)' },

    tutorialLayout: { display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px' },
    lessonSidebar: { display: 'flex', flexDirection: 'column', gap: '4px' },
    lessonItem: {
        display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
        border: 'none', borderRadius: '10px', background: 'rgba(255,255,255,0.03)',
        color: '#888', fontSize: '13px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
    },
    lessonItemActive: { background: 'rgba(102,126,234,0.15)', color: '#a5b4fc' },
    lessonItemDone: { opacity: 0.7 },
    lessonIcon: { fontSize: '16px' },
    lessonTitle: { fontWeight: 600 },

    lessonContent: {
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px', padding: '24px',
    },
    lessonHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    lessonName: { margin: 0, fontSize: '20px', fontWeight: 700, color: '#e4e4e7' },
    lessonStep: { fontSize: '12px', color: '#666' },
    lessonText: { fontSize: '14px', lineHeight: 1.8, color: '#a0aec0', marginBottom: '20px' },

    visualBox: {
        background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '16px',
        border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px',
    },
    visualTitle: { margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: '#888' },

    commandsSection: { marginBottom: '20px' },
    commandsTitle: { margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: '#888' },
    commandRow: {
        display: 'flex', gap: '12px', alignItems: 'center', padding: '8px 12px',
        borderRadius: '8px', marginBottom: '4px', background: 'rgba(255,255,255,0.02)',
    },
    commandCode: {
        fontFamily: 'monospace', fontSize: '12px', fontWeight: 600, color: '#48bb78',
        background: 'rgba(72,187,120,0.1)', padding: '4px 10px', borderRadius: '6px', minWidth: '220px',
    },
    commandDesc: { fontSize: '12px', color: '#888' },

    navRow: { display: 'flex', justifyContent: 'space-between', gap: '12px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' },
    navBtn: {
        padding: '10px 20px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
        background: 'rgba(255,255,255,0.04)', color: '#888', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
    },
    navBtnPrimary: {
        background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none',
        boxShadow: '0 4px 20px rgba(102,126,234,0.3)',
    },

    cheatSheet: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px',
    },
    cheatCategory: {
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '14px', padding: '20px',
    },
    cheatCategoryTitle: { margin: '0 0 14px', fontSize: '16px', fontWeight: 700, color: '#e4e4e7' },
    cheatRow: {
        display: 'flex', gap: '10px', alignItems: 'center', padding: '8px 0',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
    },
    cheatCmd: {
        fontFamily: 'monospace', fontSize: '12px', color: '#48bb78',
        background: 'rgba(72,187,120,0.08)', padding: '3px 10px', borderRadius: '6px', minWidth: '180px',
    },
    cheatDesc: { fontSize: '12px', color: '#888' },
};

export default GitLearn;
