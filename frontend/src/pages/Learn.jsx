import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LearningPath from '../components/Learning/LearningPath';
import LessonList from '../components/Learning/LessonList';
import LessonView from '../components/Learning/LessonView';
import AchievementsPanel from '../components/Learning/AchievementsPanel';
import Leaderboard from '../components/Learning/Leaderboard';
import QuizBrowser from '../components/Learning/QuizBrowser';
import Recommendations from '../components/Learning/Recommendations';
import { COURSES, getPathProgress, getTotalProgress } from '../data/courses';
import { ACHIEVEMENTS, checkAchievements, getAchievement } from '../data/achievements';
import API from '../utils/api';

/**
 * Learn.jsx - Premium Structured Learning Page
 * Features global curriculum controls, language selection, and categorized paths.
 */

const LANGUAGES = [
    { id: 'javascript', name: 'JavaScript', icon: '📜' },
    { id: 'python', name: 'Python', icon: '🐍' },
    { id: 'java', name: 'Java', icon: '☕' },
    { id: 'cpp', name: 'C++', icon: '⚙️' },
    { id: 'c', name: 'C', icon: '🔷' },
    { id: 'go', name: 'Go', icon: '🔵' },
    { id: 'typescript', name: 'TypeScript', icon: '📘' }
];

const CATEGORIES = [
    'Foundations',
    'Data Structures',
    'Algorithm Mastery',
    'Backend Engineering',
    'Artificial Intelligence',
    'Cloud & DevOps'
];

const Learn = () => {
    const navigate = useNavigate();
    const [selectedPath, setSelectedPath] = useState(null);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [progress, setProgress] = useState({});
    const [achievements, setAchievements] = useState([]);
    const [newAchievement, setNewAchievement] = useState(null);
    
    // Global Curriculum State
    const [selectedLang, setSelectedLang] = useState(() => {
        return localStorage.getItem('preferredLanguage') || 'javascript';
    });
    const [activeCategory, setActiveCategory] = useState('All');

    // Group courses by category
    const categorizedCourses = useMemo(() => {
        const groups = {};
        CATEGORIES.forEach(cat => groups[cat] = []);
        
        COURSES.forEach(course => {
            const cat = course.category || 'Foundations';
            if (groups[cat]) {
                groups[cat].push(course);
            } else {
                groups[cat] = [course];
            }
        });
        return groups;
    }, []);

    // Get user info and handle auth
    useEffect(() => {
        const loadAndSync = async () => {
            const userInfo = localStorage.getItem('userInfo');
            if (!userInfo) {
                navigate('/login');
                return;
            }

            const savedProgress = localStorage.getItem('learningProgress');
            const savedAchievements = localStorage.getItem('achievements');
            if (savedProgress) setProgress(JSON.parse(savedProgress));
            if (savedAchievements) setAchievements(JSON.parse(savedAchievements));

            try {
                const res = await API.post('/api/progress/sync', {
                    localProgress: savedProgress ? JSON.parse(savedProgress) : {},
                    localAchievements: savedAchievements ? JSON.parse(savedAchievements) : []
                });
                if (res.data?.synced) {
                    setProgress(res.data.pathProgress || {});
                    setAchievements(res.data.achievements || []);
                    localStorage.setItem('learningProgress', JSON.stringify(res.data.pathProgress));
                    localStorage.setItem('achievements', JSON.stringify(res.data.achievements));
                }
            } catch (err) {
                console.error('Sync failed:', err.message);
            }
        };

        loadAndSync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Save language preference
    useEffect(() => {
        localStorage.setItem('preferredLanguage', selectedLang);
    }, [selectedLang]);

    const completeLesson = (pathId, lessonId, quizScore) => {
        const newProgress = { ...progress };
        if (!newProgress[pathId]) newProgress[pathId] = { completed: [], quizScores: {} };
        if (!newProgress[pathId].completed.includes(lessonId)) {
            newProgress[pathId].completed.push(lessonId);
        }
        newProgress[pathId].quizScores[lessonId] = quizScore;
        
        setProgress(newProgress);
        localStorage.setItem('learningProgress', JSON.stringify(newProgress));

        // Achievements check
        const newlyUnlocked = checkAchievements(newProgress, achievements);
        newlyUnlocked.forEach(id => {
            if (!achievements.includes(id)) {
                const newA = [...achievements, id];
                setAchievements(newA);
                localStorage.setItem('achievements', JSON.stringify(newA));
                const ach = getAchievement(id);
                if (ach) {
                    setNewAchievement(ach);
                    setTimeout(() => setNewAchievement(null), 3000);
                }
            }
        });
    };

    const isPathUnlocked = (path) => {
        if (!path.prerequisites || path.prerequisites.length === 0) return true;
        return path.prerequisites.every(prereq => {
            const p = COURSES.find(c => c.id === prereq);
            if (!p) return true;
            return getPathProgress(prereq, progress) >= 100;
        });
    };

    const handleBack = () => {
        if (selectedLesson) setSelectedLesson(null);
        else if (selectedPath) setSelectedPath(null);
        else navigate('/');
    };

    if (selectedLesson && selectedPath) {
        return (
            <LessonView
                path={selectedPath}
                lesson={selectedLesson}
                preferredLanguage={selectedLang}
                onBack={handleBack}
                onComplete={(score) => {
                    completeLesson(selectedPath.id, selectedLesson.id, score);
                    const idx = selectedPath.lessons.findIndex(l => l.id === selectedLesson.id);
                    if (idx < selectedPath.lessons.length - 1) {
                        setSelectedLesson(selectedPath.lessons[idx + 1]);
                    } else {
                        setSelectedLesson(null);
                    }
                }}
                progress={progress}
            />
        );
    }

    if (selectedPath) {
        return (
            <div style={styles.container}>
                <header style={styles.header}>
                    <button onClick={handleBack} style={styles.backBtn}>← Back to Curriculum</button>
                    <h2 style={styles.title}>{selectedPath.icon} {selectedPath.title}</h2>
                    <div style={styles.progressBadge}>
                        {getPathProgress(selectedPath.id, progress)}% Complete
                    </div>
                </header>
                <div style={styles.pathHero}>
                    <p style={styles.pathDescription}>{selectedPath.description}</p>
                </div>
                <LessonList
                    lessons={selectedPath.lessons}
                    progress={progress[selectedPath.id] || { completed: [], quizScores: {} }}
                    onSelectLesson={setSelectedLesson}
                />
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Premium Curriculum Header */}
            <div style={styles.curriculumControls}>
                <div style={styles.controlsLeft}>
                    <h1 style={styles.mainHeading}>
                        <span style={styles.headingIcon}>📚</span> Structured Learning
                    </h1>
                    <p style={styles.subHeading}>Master computer science and backend engineering from zero to hero.</p>
                </div>

                <div style={styles.controlsRight}>
                    {/* Language Dropdown */}
                    <div style={styles.controlGroup}>
                        <label style={styles.controlLabel}>Target Language</label>
                        <select 
                            value={selectedLang} 
                            onChange={(e) => setSelectedLang(e.target.value)}
                            style={styles.dropdown}
                        >
                            {LANGUAGES.map(lang => (
                                <option key={lang.id} value={lang.id}>
                                    {lang.icon} {lang.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Topic/Category Dropdown */}
                    <div style={styles.controlGroup}>
                        <label style={styles.controlLabel}>Curriculum Section</label>
                        <select 
                            value={activeCategory} 
                            onChange={(e) => setActiveCategory(e.target.value)}
                            style={styles.dropdown}
                        >
                            <option value="All">🌐 All Topics</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.globalStats}>
                        <span style={styles.statLabel}>Overall Mastery</span>
                        <div style={styles.statValue}>{getTotalProgress(progress)}%</div>
                    </div>
                </div>
            </div>

            {/* Categorized Course Sections */}
            <div style={styles.sectionsContainer}>
                {CATEGORIES.filter(cat => activeCategory === 'All' || activeCategory === cat).map(category => (
                    <section key={category} style={styles.categorySection}>
                        <div style={styles.sectionHeader}>
                            <h2 style={styles.sectionTitle}>{category}</h2>
                            <div style={styles.sectionLine} />
                        </div>
                        
                        <div style={styles.pathGrid}>
                            <AnimatePresence>
                                {categorizedCourses[category].map((path, index) => (
                                    <motion.div
                                        key={path.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <LearningPath
                                            path={path}
                                            progress={getPathProgress(path.id, progress)}
                                            isLocked={!isPathUnlocked(path)}
                                            onClick={() => isPathUnlocked(path) && setSelectedPath(path)}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </section>
                ))}
            </div>

            {/* Achievements & Recommendations */}
            <div style={styles.lowerContent}>
                <Recommendations onNavigate={(topic) => {
                    const path = COURSES.find(c => c.id === topic);
                    if (path && isPathUnlocked(path)) setSelectedPath(path);
                }} />
            </div>

            {/* Floating Achievement Notification */}
            <AnimatePresence>
                {newAchievement && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50 }}
                        style={styles.achievementPopup}
                    >
                        <div style={styles.achievementIcon}>{newAchievement.icon}</div>
                        <div style={styles.achievementText}>
                            <div style={styles.achievementUnlocked}>🎉 Achievement Unlocked!</div>
                            <div style={styles.achievementTitle}>{newAchievement.title}</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        color: '#E8E8ED',
        padding: '30px 40px',
        background: 'transparent',
    },
    curriculumControls: {
        background: 'rgba(10, 10, 15, 0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
    },
    mainHeading: {
        fontSize: '32px',
        fontWeight: 900,
        margin: '0 0 10px 0',
        letterSpacing: '-0.03em',
        background: 'linear-gradient(to right, #fff, #A5A5B2)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    headingIcon: {
        marginRight: '12px',
    },
    subHeading: {
        color: '#9898A6',
        fontSize: '15px',
        margin: 0,
    },
    controlsRight: {
        display: 'flex',
        gap: '24px',
        alignItems: 'center',
    },
    controlGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    controlLabel: {
        fontSize: '10px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'var(--accent-cyan)',
        opacity: 0.8,
    },
    dropdown: {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '10px 16px',
        color: '#fff',
        fontSize: '13px',
        fontWeight: 600,
        minWidth: '180px',
        cursor: 'pointer',
        outline: 'none',
        transition: 'all 0.2s',
    },
    globalStats: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
        padding: '10px 20px',
        borderRadius: '16px',
        minWidth: '100px',
    },
    statLabel: {
        fontSize: '9px',
        fontWeight: 800,
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.8)',
    },
    statValue: {
        fontSize: '20px',
        fontWeight: 900,
        color: '#fff',
    },
    sectionsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '60px',
    },
    categorySection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
    },
    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
    },
    sectionTitle: {
        fontSize: '14px',
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        color: '#5A5A6A',
        whiteSpace: 'nowrap',
    },
    sectionLine: {
        flex: 1,
        height: '1px',
        background: 'rgba(255,255,255,0.05)',
    },
    pathGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '30px',
    },
    backBtn: {
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '10px 20px',
        borderRadius: '100px',
        color: '#E8E8ED',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
    },
    title: {
        fontSize: '24px',
        fontWeight: 800,
    },
    progressBadge: {
        background: 'var(--accent-cyan)',
        padding: '8px 16px',
        borderRadius: '100px',
        fontSize: '12px',
        fontWeight: 700,
    },
    pathHero: {
        textAlign: 'center',
        marginBottom: '40px',
    },
    pathDescription: {
        fontSize: '16px',
        color: '#9898A6',
        maxWidth: '700px',
        margin: '0 auto',
    },
    achievementPopup: {
        position: 'fixed',
        bottom: '30px',
        right: '40px',
        background: 'rgba(15,15,20,0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--accent-cyan)',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        gap: '15px',
        zIndex: 1000,
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
    },
    achievementIcon: { fontSize: '40px' },
    achievementText: { display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    achievementUnlocked: { fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 800 },
    achievementTitle: { fontSize: '18px', fontWeight: 800 },
    lowerContent: { marginTop: '80px', maxWidth: '600px', margin: '80px auto 0' }
};

export default Learn;
