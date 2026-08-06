import React from 'react';
import { motion as Motion } from 'framer-motion';

/**
 * LessonList - Displays list of lessons in a learning path
 * Shows completion status and duration for each lesson
 */

const FONT = "'Inter', system-ui, -apple-system, sans-serif";

const LessonList = ({ lessons, progress, onSelectLesson }) => {
    const isCompleted = (lessonId) => progress.completed?.includes(lessonId);
    const getQuizScore = (lessonId) => progress.quizScores?.[lessonId];

    return (
        <div style={styles.container}>
            {lessons.map((lesson, index) => {
                const completed = isCompleted(lesson.id);
                const score = getQuizScore(lesson.id);
                const previousCompleted = index === 0 || isCompleted(lessons[index - 1].id);
                const passed = score >= 70;

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
                            opacity: previousCompleted ? 1 : 0.55,
                            cursor: previousCompleted ? 'pointer' : 'not-allowed',
                            borderColor: completed ? 'color-mix(in srgb, var(--cz-success) 45%, var(--cz-line))' : 'var(--cz-line)',
                        }}
                    >
                        {/* Lesson number */}
                        <div style={{
                            ...styles.lessonNumber,
                            color: (completed || previousCompleted) ? '#fff' : 'var(--cz-muted)',
                            background: completed
                                ? 'linear-gradient(135deg, var(--cz-success), #22c55e)'
                                : previousCompleted
                                    ? 'linear-gradient(135deg, var(--cz-accent), #7c93ff)'
                                    : 'var(--cz-elevated)',
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
                                color: passed ? 'var(--cz-success)' : 'var(--cz-warning)',
                                background: passed
                                    ? 'color-mix(in srgb, var(--cz-success) 15%, transparent)'
                                    : 'color-mix(in srgb, var(--cz-warning) 15%, transparent)',
                                borderColor: passed
                                    ? 'color-mix(in srgb, var(--cz-success) 35%, transparent)'
                                    : 'color-mix(in srgb, var(--cz-warning) 35%, transparent)',
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
        gap: '10px',
        maxWidth: '820px',
        margin: '0 auto',
        width: '100%',
        fontFamily: FONT,
    },
    lessonCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        background: 'var(--cz-surface)',
        border: '1px solid var(--cz-line)',
        borderRadius: '14px',
        padding: '14px 18px',
        boxShadow: 'var(--cz-shadow-sm)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    lessonNumber: {
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '15px',
        fontWeight: 800,
        flexShrink: 0,
    },
    lessonInfo: {
        flex: 1,
        minWidth: 0,
    },
    lessonTitle: {
        margin: '0 0 3px 0',
        fontSize: '15px',
        fontWeight: 700,
        color: 'var(--cz-text)',
    },
    lessonMeta: {
        fontSize: '12px',
        color: 'var(--cz-muted)',
    },
    scoreBadge: {
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: 800,
        border: '1px solid transparent',
        flexShrink: 0,
    },
    arrow: {
        color: 'var(--cz-faint)',
        fontSize: '18px',
        flexShrink: 0,
    },
};

export default LessonList;
