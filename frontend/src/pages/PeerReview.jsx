import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import API_BASE from '../utils/api';

const PeerReview = () => {
    const [reviews, setReviews] = useState([]);
    const [viewMode, setViewMode] = useState('list'); // 'list', 'create', 'detail'
    const [selectedReview, setSelectedReview] = useState(null);
    const [loading, setLoading] = useState(true);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [code, setCode] = useState('// Paste your code here\n');
    const [language, setLanguage] = useState('python');

    // Comment state
    const [commentText, setCommentText] = useState('');
    const [commentLine, setCommentLine] = useState('');

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${API_BASE}/api/peer-reviews`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setReviews(data);
        } catch (error) {
            console.error('Error fetching peer reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSingleReview = async (id) => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${API_BASE}/api/peer-reviews/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setSelectedReview(data);
            setViewMode('detail');
        } catch (error) {
            console.error('Error fetching review details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE}/api/peer-reviews`, {
                title, description, code, language
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setViewMode('list');
            setTitle('');
            setDescription('');
            setCode('// Paste your code here\n');
            fetchReviews();
            alert('Code submitted for peer review!');
        } catch (error) {
            alert('Failed to submit: ' + error.message);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { text: commentText };
            if (commentLine) payload.line = parseInt(commentLine);

            const { data } = await axios.post(`${API_BASE}/api/peer-reviews/${selectedReview._id}/comments`, payload, {
                headers: { Authorization: `Bearer ${user.token}` }
            });

            setSelectedReview(data);
            setCommentText('');
            setCommentLine('');
        } catch (error) {
            alert('Failed to post comment: ' + error.message);
        }
    };

    const handleResolve = async () => {
        if (!window.confirm("Are you sure you want to mark this request as resolved?")) return;
        try {
            await axios.put(`${API_BASE}/api/peer-reviews/${selectedReview._id}/resolve`, {}, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            fetchSingleReview(selectedReview._id);
            alert('Marked as resolved!');
        } catch (error) {
            alert('Failed to resolve: ' + error.message);
        }
    };

    if (loading && viewMode === 'list' && reviews.length === 0) {
        return <div style={{ color: 'white', padding: '20px' }}>Loading...</div>;
    }

    return (
        <div style={{ padding: '20px', color: '#fff', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', color: '#667eea' }}>👀 Peer Code Review</h1>
                    <p style={{ margin: 0, color: '#aaa' }}>Get feedback from fellow students or help others debug their code.</p>
                </div>
                <div>
                    {viewMode !== 'list' && (
                        <button
                            onClick={() => { setViewMode('list'); fetchReviews(); }}
                            style={{ background: '#4a5568', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}
                        >
                            ← Back to List
                        </button>
                    )}
                    {viewMode === 'list' && (
                        <button
                            onClick={() => setViewMode('create')}
                            style={{ background: '#48bb78', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            + Request Review
                        </button>
                    )}
                </div>
            </div>

            {viewMode === 'list' && (
                <div>
                    {reviews.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', background: '#2d3748', borderRadius: '8px' }}>
                            <h3 style={{ margin: '0 0 10px 0' }}>No pending review requests!</h3>
                            <p style={{ color: '#aaa', margin: 0 }}>Be the first to ask the community for help.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '15px' }}>
                            {reviews.map(review => (
                                <div key={review._id} style={{ background: '#2d3748', padding: '20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>
                                            {review.title}
                                            {review.status === 'resolved' && <span style={{ marginLeft: '10px', fontSize: '12px', background: '#48bb78', padding: '3px 8px', borderRadius: '12px' }}>Resolved</span>}
                                        </h3>
                                        <p style={{ margin: '0 0 10px 0', color: '#cbd5e0', fontSize: '14px' }}>
                                            Asked by <strong style={{ color: '#667eea' }}>{review.userId.name}</strong> • {new Date(review.createdAt).toLocaleDateString()}
                                        </p>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <span style={{ fontSize: '12px', background: '#1a202c', padding: '4px 8px', borderRadius: '4px' }}>{review.language}</span>
                                            <span style={{ fontSize: '12px', color: '#a0aec0' }}>💬 {review.comments.length} comments</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => fetchSingleReview(review._id)}
                                        style={{ background: '#667eea', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}
                                    >
                                        View Code
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {viewMode === 'create' && (
                <div style={{ background: '#2d3748', padding: '25px', borderRadius: '8px' }}>
                    <h2 style={{ top: 0, margin: '0 0 20px 0' }}>Submit Code for Review</h2>
                    <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', color: '#cbd5e0' }}>Title</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Help optimizing my QuickSort algorithm"
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #4a5568', background: '#1a202c', color: 'white' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', color: '#cbd5e0' }}>Description / What do you need help with?</label>
                            <textarea
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="3"
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #4a5568', background: '#1a202c', color: 'white' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', color: '#cbd5e0' }}>Language</label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #4a5568', background: '#1a202c', color: 'white' }}
                            >
                                <option value="python">Python</option>
                                <option value="javascript">JavaScript</option>
                                <option value="cpp">C++</option>
                                <option value="java">Java</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', color: '#cbd5e0' }}>Code</label>
                            <div style={{ height: '300px', border: '1px solid #4a5568', borderRadius: '4px', overflow: 'hidden' }}>
                                <Editor
                                    height="100%"
                                    language={language}
                                    theme="vs-dark"
                                    value={code}
                                    onChange={setCode}
                                    options={{ minimap: { enabled: false } }}
                                />
                            </div>
                        </div>
                        <button type="submit" style={{ background: '#48bb78', padding: '12px', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}>
                            Submit Request
                        </button>
                    </form>
                </div>
            )}

            {viewMode === 'detail' && selectedReview && (
                <div style={{ display: 'flex', gap: '20px', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
                    <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ background: '#2d3748', padding: '20px', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h2 style={{ margin: '0 0 10px 0' }}>{selectedReview.title}</h2>
                                    <p style={{ margin: '0 0 15px 0', color: '#cbd5e0' }}>{selectedReview.description}</p>
                                    <div style={{ fontSize: '14px', color: '#a0aec0', marginBottom: '15px' }}>
                                        By <strong style={{ color: '#667eea' }}>{selectedReview.userId.name}</strong> • Language: {selectedReview.language}
                                    </div>
                                </div>
                                {selectedReview.status === 'open' && (user._id === selectedReview.userId._id || user.role === 'admin') && (
                                    <button onClick={handleResolve} style={{ background: '#48bb78', border: 'none', padding: '8px 15px', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>
                                        Mark Resolved
                                    </button>
                                )}
                                {selectedReview.status === 'resolved' && (
                                    <span style={{ background: '#48bb78', padding: '8px 15px', color: 'white', borderRadius: '4px', fontWeight: 'bold' }}>Resolved</span>
                                )}
                            </div>

                            <div style={{ height: '500px', border: '1px solid #4a5568', borderRadius: '4px', overflow: 'hidden' }}>
                                <Editor
                                    height="100%"
                                    language={selectedReview.language}
                                    theme="vs-dark"
                                    value={selectedReview.code}
                                    options={{ readOnly: true, minimap: { enabled: false } }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ background: '#2d3748', padding: '20px', borderRadius: '8px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #4a5568', paddingBottom: '10px' }}>Discussion</h3>

                            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {selectedReview.comments.length === 0 ? (
                                    <p style={{ color: '#a0aec0', fontStyle: 'italic', textAlign: 'center', marginTop: '20px' }}>No comments yet.</p>
                                ) : (
                                    selectedReview.comments.map(c => (
                                        <div key={c._id} style={{ background: '#1a202c', padding: '12px', borderRadius: '6px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', color: '#a0aec0' }}>
                                                <strong style={{ color: '#667eea' }}>{c.userId.name}</strong>
                                                <span>{new Date(c.createdAt).toLocaleTimeString()}</span>
                                            </div>
                                            {c.line && (
                                                <div style={{ fontSize: '12px', background: '#ebf4ff', color: '#2b6cb0', display: 'inline-block', padding: '2px 6px', borderRadius: '4px', marginBottom: '8px', fontWeight: 'bold' }}>
                                                    Line {c.line}
                                                </div>
                                            )}
                                            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>{c.text}</p>
                                        </div>
                                    ))
                                )}
                            </div>

                            {selectedReview.status === 'open' && (
                                <form onSubmit={handleCommentSubmit} style={{ marginTop: 'auto', background: '#1a202c', padding: '15px', borderRadius: '6px' }}>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                        <input
                                            type="number"
                                            placeholder="Line # (opt)"
                                            value={commentLine}
                                            onChange={(e) => setCommentLine(e.target.value)}
                                            style={{ width: '80px', padding: '8px', borderRadius: '4px', border: '1px solid #4a5568', background: '#2d3748', color: 'white' }}
                                        />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Write a comment..."
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #4a5568', background: '#2d3748', color: 'white' }}
                                        />
                                    </div>
                                    <button type="submit" style={{ width: '100%', background: '#667eea', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}>
                                        Post Comment
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PeerReview;
