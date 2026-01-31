import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LearningPath from '../components/Learning/LearningPath';
import LessonList from '../components/Learning/LessonList';
import LessonView from '../components/Learning/LessonView';
import AchievementsPanel from '../components/Learning/AchievementsPanel';
import Leaderboard from '../components/Learning/Leaderboard';
import QuizBrowser from '../components/Learning/QuizBrowser';
import { COURSES, getPathProgress, getTotalProgress } from '../data/courses';
import { ACHIEVEMENTS, checkAchievements, getAchievement } from '../data/achievements';

/**
 * Learn.jsx - Main Structured Learning Page
 * Displays learning paths, lessons, and handles navigation
 */

const Learn = () => {
    const navigate = useNavigate();
    const [selectedPath, setSelectedPath] = useState(null);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [progress, setProgress] = useState({});
    const [achievements, setAchievements] = useState([]);
    const [showAchievements, setShowAchievements] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [showQuizBrowser, setShowQuizBrowser] = useState(false);
    const [newAchievement, setNewAchievement] = useState(null);
    const [syncInProgress, setSyncInProgress] = useState(false);

    // Get user info for backend sync
    const getUserInfo = () => {
        try {
            const userInfo = localStorage.getItem('userInfo');
            return userInfo ? JSON.parse(userInfo) : null;
        } catch {
            return null;
        }
    };

    // Sync progress with backend
    const syncWithServer = async (localProgress, localAchievements) => {
        const user = getUserInfo();
        if (!user || !user.token) return null;

        try {
            const res = await fetch('http://localhost:5001/api/progress/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    localProgress,
                    localAchievements
                })
            });
            if (res.ok) {
                return await res.json();
            }
        } catch (error) {
            console.error('Sync error:', error);
        }
        return null;
    };

    // Load progress and achievements from localStorage, then sync with server
    useEffect(() => {
        const loadAndSync = async () => {
            // Load from localStorage first
            const savedProgress = localStorage.getItem('learningProgress');
            const savedAchievements = localStorage.getItem('achievements');

            let localProgress = savedProgress ? JSON.parse(savedProgress) : {};
            let localAchievements = savedAchievements ? JSON.parse(savedAchievements) : [];

            setProgress(localProgress);
            setAchievements(localAchievements);

            // If user is logged in, sync with server
            const user = getUserInfo();
            if (user && user.token) {
                setSyncInProgress(true);
                const serverData = await syncWithServer(localProgress, localAchievements);
                if (serverData && serverData.synced) {
                    // Merge server data back to local
                    setProgress(serverData.pathProgress || {});
                    setAchievements(serverData.achievements || []);
                    localStorage.setItem('learningProgress', JSON.stringify(serverData.pathProgress || {}));
                    localStorage.setItem('achievements', JSON.stringify(serverData.achievements || []));
                }
                setSyncInProgress(false);
            }
        };

        loadAndSync();
    }, []);

    // Save progress to localStorage
    const saveProgress = (newProgress) => {
        setProgress(newProgress);
        localStorage.setItem('learningProgress', JSON.stringify(newProgress));
    };

    // Save achievements to localStorage
    const saveAchievements = (newAchievements) => {
        setAchievements(newAchievements);
        localStorage.setItem('achievements', JSON.stringify(newAchievements));
    };

    // Unlock achievement and show notification
    const unlockAchievement = (achievementId) => {
        if (achievements.includes(achievementId)) return;

        const newAchievements = [...achievements, achievementId];
        saveAchievements(newAchievements);

        // Show achievement popup
        const achievement = getAchievement(achievementId);
        if (achievement) {
            setNewAchievement(achievement);
            setTimeout(() => setNewAchievement(null), 3000);
        }
    };

    // Check for new achievements
    const checkForAchievements = (newProgress) => {
        const newlyUnlocked = checkAchievements(newProgress, achievements);
        newlyUnlocked.forEach(id => unlockAchievement(id));
    };

    // Mark lesson as complete
    const completeLesson = (pathId, lessonId, quizScore) => {
        const newProgress = { ...progress };
        if (!newProgress[pathId]) {
            newProgress[pathId] = { completed: [], quizScores: {} };
        }
        if (!newProgress[pathId].completed.includes(lessonId)) {
            newProgress[pathId].completed.push(lessonId);
        }
        newProgress[pathId].quizScores[lessonId] = quizScore;
        saveProgress(newProgress);

        // Check for milestone achievements
        checkForAchievements(newProgress);

        // Check for course completion achievement
        const path = COURSES.find(c => c.id === pathId);
        if (path && newProgress[pathId].completed.length === path.lessons.length) {
            // Course completed - find matching achievement
            const courseAchievement = ACHIEVEMENTS.find(
                a => a.category === 'course' && a.courseId === pathId
            );
            if (courseAchievement) {
                unlockAchievement(courseAchievement.id);
            }
        }

        // Check for perfect quiz achievement
        if (quizScore === 100 && !achievements.includes('perfect_quiz')) {
            unlockAchievement('perfect_quiz');
        }
    };

    // Check if a path is unlocked (prerequisites met)
    const isPathUnlocked = (path) => {
        if (!path.prerequisites || path.prerequisites.length === 0) return true;
        return path.prerequisites.every(prereq => {
            const prereqPath = COURSES.find(c => c.id === prereq);
            if (!prereqPath) return true;
            const pathProgress = getPathProgress(prereq, progress);
            return pathProgress >= 100;
        });
    };

    // Handle back navigation
    const handleBack = () => {
        if (selectedLesson) {
            setSelectedLesson(null);
        } else if (selectedPath) {
            setSelectedPath(null);
        } else {
            navigate('/');
        }
    };

    // Render lesson view
    if (selectedLesson && selectedPath) {
        return (
            <LessonView
                path={selectedPath}
                lesson={selectedLesson}
                onBack={handleBack}
                onComplete={(quizScore) => {
                    completeLesson(selectedPath.id, selectedLesson.id, quizScore);
                    // Move to next lesson or back to list
                    const lessonIndex = selectedPath.lessons.findIndex(l => l.id === selectedLesson.id);
                    if (lessonIndex < selectedPath.lessons.length - 1) {
                        setSelectedLesson(selectedPath.lessons[lessonIndex + 1]);
                    } else {
                        setSelectedLesson(null);
                    }
                }}
                progress={progress}
            />
        );
    }

    // Render lesson list for selected path
    if (selectedPath) {
        return (
            <div style={styles.container}>
                <header style={styles.header}>
                    <button onClick={handleBack} style={styles.backBtn}>← Back</button>
                    <h2 style={styles.title}>{selectedPath.icon} {selectedPath.title}</h2>
                    <div style={styles.progressBadge}>
                        {getPathProgress(selectedPath.id, progress)}% Complete
                    </div>
                </header>

                <p style={styles.pathDescription}>{selectedPath.description}</p>

                <LessonList
                    lessons={selectedPath.lessons}
                    progress={progress[selectedPath.id] || { completed: [], quizScores: {} }}
                    onSelectLesson={(lesson) => setSelectedLesson(lesson)}
                />
            </div>
        );
    }

    // Render path grid (main view)
    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <button onClick={() => navigate('/')} style={styles.backBtn}>← Dashboard</button>
                <h2 style={styles.title}>📚 Structured Learning</h2>
                <div style={styles.headerActions}>
                    <button
                        onClick={() => setShowLeaderboard(true)}
                        style={styles.leaderboardBtn}
                        title="View Leaderboard"
                    >
                        📊
                    </button>
                    <button
                        onClick={() => setShowQuizBrowser(true)}
                        style={styles.quizBrowserBtn}
                        title="Community Quizzes"
                    >
                        📝
                    </button>
                    <button
                        onClick={() => setShowAchievements(true)}
                        style={styles.achievementsBtn}
                        title="View Achievements"
                    >
                        🏆 {achievements.length}/{ACHIEVEMENTS.length}
                    </button>
                    <div style={styles.progressBadge}>
                        Overall: {getTotalProgress(progress)}%
                    </div>
                </div>
            </header>

            <p style={styles.subtitle}>
                Learn programming concepts step-by-step with visual explanations
            </p>

            <div style={styles.pathGrid}>
                <AnimatePresence>
                    {COURSES.map((path, index) => (
                        <motion.div
                            key={path.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
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

            {/* Onboarding tip for new users */}
            {getTotalProgress(progress) === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={styles.onboardingTip}
                >
                    💡 <strong>New here?</strong> Start with "Programming Basics" - it's unlocked and ready!
                </motion.div>
            )}

            {/* Achievement unlock notification */}
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

            {/* Achievements Panel */}
            <AnimatePresence>
                {showAchievements && (
                    <AchievementsPanel
                        unlockedAchievements={achievements}
                        onClose={() => setShowAchievements(false)}
                    />
                )}
            </AnimatePresence>

            {/* Leaderboard Panel */}
            <AnimatePresence>
                {showLeaderboard && (
                    <Leaderboard
                        onClose={() => setShowLeaderboard(false)}
                        currentUserId={getUserInfo()?._id}
                    />
                )}
            </AnimatePresence>

            {/* Quiz Browser Panel */}
            <AnimatePresence>
                {showQuizBrowser && (
                    <QuizBrowser
                        onClose={() => setShowQuizBrowser(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        color: '#fff',
        padding: '20px'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
    },
    headerActions: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    backBtn: {
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.2)',
        color: '#fff',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'all 0.2s'
    },
    achievementsBtn: {
        background: 'rgba(255, 215, 0, 0.15)',
        border: '1px solid rgba(255, 215, 0, 0.3)',
        color: '#ffd700',
        padding: '8px 14px',
        borderRadius: '20px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 'bold',
        transition: 'all 0.2s'
    },
    leaderboardBtn: {
        background: 'rgba(102, 126, 234, 0.15)',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        color: '#667eea',
        padding: '8px 12px',
        borderRadius: '20px',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'all 0.2s'
    },
    quizBrowserBtn: {
        background: 'rgba(76, 175, 80, 0.15)',
        border: '1px solid rgba(76, 175, 80, 0.3)',
        color: '#4caf50',
        padding: '8px 12px',
        borderRadius: '20px',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'all 0.2s'
    },
    title: {
        margin: 0,
        fontSize: '24px',
        fontWeight: 'bold'
    },
    progressBadge: {
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold'
    },
    subtitle: {
        color: '#888',
        textAlign: 'center',
        marginBottom: '30px'
    },
    pathGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        maxWidth: '1200px',
        margin: '0 auto'
    },
    pathDescription: {
        color: '#aaa',
        textAlign: 'center',
        marginBottom: '30px',
        fontSize: '14px'
    },
    onboardingTip: {
        textAlign: 'center',
        marginTop: '40px',
        padding: '15px 25px',
        background: 'rgba(102, 126, 234, 0.15)',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        borderRadius: '10px',
        maxWidth: '500px',
        margin: '40px auto 0'
    },
    achievementPopup: {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
        border: '2px solid #ffd700',
        borderRadius: '16px',
        padding: '15px 25px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        zIndex: 999
    },
    achievementIcon: {
        fontSize: '40px'
    },
    achievementText: {
        display: 'flex',
        flexDirection: 'column'
    },
    achievementUnlocked: {
        fontSize: '12px',
        color: '#ffd700',
        marginBottom: '3px'
    },
    achievementTitle: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#fff'
    }
};

export default Learn;

