import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';
import CodeEditor from '../components/Editor/CodeEditor';

const SnippetViewer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [snippet, setSnippet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mode, setMode] = useState('view'); // view or fork
    const user = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        const fetchSnippet = async () => {
            try {
                // Fetch from shared endpoint
                const res = await axios.get(`http://localhost:5001/api/snippets/public/all`);
                // Filter manually for now (in real app, use specific ID endpoint)
                const found = res.data.find(s => s._id === id);

                if (found) {
                    setSnippet(found);
                } else {
                    // Fallback: try direct fetch if owner or if route allows
                    setError('Snippet not found or private.');
                }
            } catch (err) {
                setError('Failed to load snippet.');
            } finally {
                setLoading(false);
            }
        };
        fetchSnippet();
    }, [id]);

    if (loading) return <div style={{ color: '#fff', padding: '50px', textAlign: 'center' }}>Loading snippet...</div>;
    if (error) return <div style={{ color: '#e53935', padding: '50px', textAlign: 'center' }}>{error} <br /> <button onClick={() => navigate('/')} style={{ marginTop: '20px', padding: '8px 16px' }}>Go Home</button></div>;

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#1e1e1e', color: '#fff' }}>
            <header style={{ padding: '15px 20px', background: '#252526', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '18px' }}>{snippet.title}</h2>
                    <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
                        Shared by <span style={{ color: '#fff' }}>{snippet.userId?.name || 'Unknown'}</span> • {new Date(snippet.sharedAt).toLocaleDateString()}
                    </div>
                </div>
                <div>
                    <button onClick={() => navigate('/practice')} style={{ background: '#007acc', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Open in Editor</button>
                </div>
            </header>

            <div style={{ flex: 1, overflow: 'hidden' }}>
                <CodeEditor
                    code={snippet.code}
                    language={snippet.language}
                    options={{ readOnly: true }} // Read only mode
                />
            </div>
        </div>
    );
};

export default SnippetViewer;
