import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DiscussionPanel = ({ lessonId }) => {
    const [discussions, setDiscussions] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyContent, setReplyContent] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        fetchDiscussions();
    }, [lessonId]);

    const fetchDiscussions = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const res = await axios.get(`http://localhost:5001/api/discussions/${lessonId}`, config);
            setDiscussions(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching discussions:', error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };

            await axios.post('http://localhost:5001/api/discussions', {
                lessonId,
                content: newComment
            }, config);

            setNewComment('');
            fetchDiscussions(); // Refresh list
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    };

    const handleReply = async (discussionId) => {
        if (!replyContent.trim()) return;

        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };

            await axios.post(`http://localhost:5001/api/discussions/${discussionId}/reply`, {
                content: replyContent
            }, config);

            setReplyContent('');
            setReplyingTo(null);
            fetchDiscussions();
        } catch (error) {
            console.error('Error replying:', error);
        }
    };

    // 🕒 Local helper to replace date-fns (Network workaround)
    const formatTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    if (loading) return <div style={{ color: '#aaa', padding: '20px' }}>Loading discussions...</div>;

    return (
        <div style={styles.container}>
            <h3 style={styles.header}>💬 Discussion Forum</h3>

            {/* New Comment Input */}
            <form onSubmit={handleSubmit} style={styles.inputForm}>
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Ask a question or share your thoughts..."
                    style={styles.textarea}
                    rows="3"
                />
                <button type="submit" style={styles.submitBtn}>Post Comment</button>
            </form>

            {/* Discussion List */}
            <div style={styles.list}>
                {discussions.length === 0 ? (
                    <div style={styles.empty}>Be the first to start a discussion!</div>
                ) : (
                    discussions.map(discussion => (
                        <div key={discussion._id} style={styles.discussionCard}>
                            <div style={styles.userInfo}>
                                <div style={styles.avatar}>{discussion.userId.name.charAt(0)}</div>
                                <div>
                                    <div style={styles.userName}>
                                        {discussion.userId.name}
                                        {discussion.userId.role === 'instructor' && <span style={styles.badge}>Instructor</span>}
                                    </div>
                                    <div style={styles.date}>
                                        {formatTimeAgo(discussion.createdAt)}
                                    </div>
                                </div>
                            </div>

                            <div style={styles.content}>{discussion.content}</div>

                            {/* Replies */}
                            {discussion.replies.length > 0 && (
                                <div style={styles.repliesList}>
                                    {discussion.replies.map(reply => (
                                        <div key={reply._id} style={styles.replyCard}>
                                            <div style={styles.replyHeader}>
                                                <span style={styles.replyUser}>{reply.userId.name}</span>
                                                <span style={styles.replyDate}>
                                                    {formatTimeAgo(reply.createdAt)}
                                                </span>
                                            </div>
                                            <div style={styles.replyContent}>{reply.content}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Reply Input */}
                            {replyingTo === discussion._id ? (
                                <div style={styles.replyInputContainer}>
                                    <input
                                        type="text"
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        placeholder="Write a reply..."
                                        style={styles.replyInput}
                                        autoFocus
                                    />
                                    <button onClick={() => handleReply(discussion._id)} style={styles.replyBtn}>Reply</button>
                                    <button onClick={() => setReplyingTo(null)} style={styles.cancelBtn}>Cancel</button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setReplyingTo(discussion._id)}
                                    style={styles.replyToggleBtn}
                                >
                                    ↩️ Reply
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        marginTop: '30px',
        background: '#1e1e1e',
        borderRadius: '10px',
        padding: '20px',
        border: '1px solid #333'
    },
    header: {
        marginTop: 0,
        marginBottom: '20px',
        borderBottom: '1px solid #333',
        paddingBottom: '10px'
    },
    inputForm: {
        marginBottom: '30px'
    },
    textarea: {
        width: '100%',
        background: '#252526',
        border: '1px solid #444',
        borderRadius: '6px',
        color: '#ddd',
        padding: '10px',
        marginBottom: '10px',
        resize: 'vertical',
        fontFamily: 'inherit'
    },
    submitBtn: {
        background: '#007acc',
        color: '#fff',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    discussionCard: {
        background: '#252526',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '15px',
        border: '1px solid #333'
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '10px'
    },
    avatar: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: '#333',
        color: '#aaa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold'
    },
    userName: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#fff'
    },
    badge: {
        background: '#007acc',
        fontSize: '10px',
        padding: '2px 6px',
        borderRadius: '10px',
        marginLeft: '8px',
        verticalAlign: 'middle'
    },
    date: {
        fontSize: '11px',
        color: '#888'
    },
    content: {
        fontSize: '14px',
        lineHeight: '1.5',
        color: '#ddd',
        marginBottom: '10px'
    },
    repliesList: {
        marginLeft: '20px',
        marginTop: '15px',
        borderLeft: '2px solid #333',
        paddingLeft: '15px'
    },
    replyCard: {
        marginBottom: '10px',
        padding: '8px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '4px'
    },
    replyHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '4px',
        fontSize: '11px'
    },
    replyUser: {
        fontWeight: 'bold',
        color: '#ccc'
    },
    replyDate: {
        color: '#666'
    },
    replyContent: {
        fontSize: '13px',
        color: '#bbb'
    },
    replyToggleBtn: {
        background: 'transparent',
        border: 'none',
        color: '#667eea',
        cursor: 'pointer',
        fontSize: '12px',
        marginTop: '5px'
    },
    replyInputContainer: {
        marginTop: '10px',
        display: 'flex',
        gap: '10px'
    },
    replyInput: {
        flex: 1,
        background: '#333',
        border: '1px solid #555',
        color: '#fff',
        padding: '6px 10px',
        borderRadius: '4px'
    },
    replyBtn: {
        background: '#2ea043',
        color: '#fff',
        border: 'none',
        padding: '6px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px'
    },
    cancelBtn: {
        background: 'transparent',
        color: '#aaa',
        border: '1px solid #444',
        padding: '6px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px'
    },
    empty: {
        textAlign: 'center',
        color: '#666',
        padding: '20px'
    }
};

export default DiscussionPanel;
