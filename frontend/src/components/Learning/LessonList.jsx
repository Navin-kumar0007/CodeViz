import React from 'react';
import { motion as Motion } from 'framer-motion';

/**
 * LessonList - Displays list of lessons in a learning path
 * Shows completion status and duration for each lesson
 */

const LessonList = ({ lessons, progress, onSelectLesson }) => {
    const isCompleted = (lessonId) => progress.completed?.includes(lessonId);
    const getQuizScore = (lessonId) => progress.quizScores?.[lessonId];

    return (
        <div style={styles.container}>
            {lessons.map((lesson, index) => {
                const completed = isCompleted(lesson.id);
                const score = getQuizScore(lesson.id);
                // Removed unused isFirst
                const previousCompleted = index === 0 || isCompleted(lessons[index - 1].id);

                return (
                    <Motion.div
                        key={lesson.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={previousCompleted ? { x: 5 } : {}}
                        onClick={() => previousCompleted && onSelectLesson(lesson)}
                        style={{
                            ...styles.lessonCard,
                            opacity: previousCompleted ? 1 : 0.5,
                            cursor: previousCompleted ? 'pointer' : 'not-allowed',
                            borderColor: completed ? '#48bb78' : 'rgba(255,255,255,0.1)'
                        }}
                    >
                        {/* Lesson number */}
                        <div style={{
                            ...styles.lessonNumber,
                            background: completed
                                ? 'linear-gradient(135deg, #48bb78, #38a169)'
                                : previousCompleted
                                    ? 'linear-gradient(135deg, #667eea, #764ba2)'
                                    : 'rgba(255,255,255,0.1)'
                        }}>
                            {completed ? '✓' : index + 1}
                        </div>

                        {/* Lesson info */}
                        <div style={styles.lessonInfo}>
                            <h4 style={styles.lessonTitle}>{lesson.title}</h4>
                            <div style={styles.lessonMeta}>
                                <span>⏱ {lesson.duration}</span>
                                {lesson.quiz && <span> • 📝 {lesson.quiz.length} questions</span>}
                            </div>
                        </div>

                        {/* Score badge */}
                        {score !== undefined && (
                            <div style={{
                                ...styles.scoreBadge,
                                background: score >= 70 ? '#48bb78' : '#f6ad55'
                            }}>
                                {score}%
                            </div>
                        )}

                        {/* Arrow */}
                        <div style={styles.arrow}>→</div>
                    </Motion.div>
                );
            })}
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '800px',
        margin: '0 auto'
    },
    lessonCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '15px 20px',
        transition: 'all 0.2s ease'
    },
    lessonNumber: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        fontWeight: 'bold',
        color: 'white',
        flexShrink: 0
    },
    lessonInfo: {
        flex: 1
    },
    lessonTitle: {
        margin: '0 0 4px 0',
        fontSize: '15px',
        fontWeight: '600',
        color: '#fff'
    },
    lessonMeta: {
        fontSize: '12px',
        color: '#666'
    },
    scoreBadge: {
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: 'bold',
        color: 'white'
    },
    arrow: {
        color: '#666',
        fontSize: '18px'
    }
};

export default LessonList;
