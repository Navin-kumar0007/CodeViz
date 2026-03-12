import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../utils/api';

const API = `${API_BASE}/api/problems`;

const DIFFICULTY_COLORS = {
    easy: '#48bb78', medium: '#f6ad55', hard: '#fc8181'
};

const ProblemList = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('userInfo'));
    const token = user?.token;

    const [problems, setProblems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ difficulty: '', category: '', search: '' });
    const [stats, setStats] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const headers = { Authorization: `Bearer ${token}` };
        let cancelled = false;

        const fetchData = async () => {
            setLoading(true);
            try {
                const params = {};
                if (filter.difficulty) params.difficulty = filter.difficulty;
                if (filter.category) params.category = filter.category;
                if (filter.search) params.search = filter.search;
                const { data } = await axios.get(API, { headers, params });
                if (!cancelled) {
                    setProblems(data.problems);
                    setTotal(data.total);
                    setCategories(data.categories || []);
                }
            } catch { /* ignore */ }

            try {
                const { data } = await axios.get(`${API}/submissions/stats`, { headers });
                if (!cancelled) setStats(data);
            } catch { /* ignore */ }

            if (!cancelled) setLoading(false);
        };

        fetchData();
        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, filter.difficulty, filter.category, refreshKey]);

    const handleSearch = useCallback((e) => {
        e.preventDefault();
        setRefreshKey(k => k + 1);
    }, []);

    return (
        <div style={S.page}>
            <div style={S.container}>

                {/* Header */}
                <div style={S.header}>
                    <div>
                        <h1 style={S.title}>📋 Problem Set</h1>
                        <p style={S.subtitle}>{total} problems • Master DSA with curated challenges</p>
                    </div>
                    <button onClick={() => navigate('/')} style={S.backBtn}>← Dashboard</button>
                </div>

                {/* Stats Bar */}
                {stats && (
                    <div style={S.statsBar}>
                        <div style={S.statItem}>
                            <span style={S.statNum}>{stats.uniqueSolved}</span>
                            <span style={S.statLabel}>Solved</span>
                        </div>
                        <div style={S.statDivider} />
                        <div style={S.statItem}>
                            <span style={{ ...S.statNum, color: '#48bb78' }}>{stats.byDifficulty?.easy || 0}</span>
                            <span style={S.statLabel}>Easy</span>
                        </div>
                        <div style={S.statItem}>
                            <span style={{ ...S.statNum, color: '#f6ad55' }}>{stats.byDifficulty?.medium || 0}</span>
                            <span style={S.statLabel}>Medium</span>
                        </div>
                        <div style={S.statItem}>
                            <span style={{ ...S.statNum, color: '#fc8181' }}>{stats.byDifficulty?.hard || 0}</span>
                            <span style={S.statLabel}>Hard</span>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div style={S.filters}>
                    <form onSubmit={handleSearch} style={S.searchForm}>
                        <input
                            value={filter.search}
                            onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
                            placeholder="🔍 Search problems..."
                            style={S.searchInput}
                        />
                        <button type="submit" style={S.searchBtn}>Search</button>
                    </form>

                    <div style={S.filterBtns}>
                        {['', 'easy', 'medium', 'hard'].map(d => (
                            <button key={d} onClick={() => setFilter(f => ({ ...f, difficulty: d }))}
                                style={{ ...S.filterBtn, ...(filter.difficulty === d ? S.filterActive : {}), color: d ? DIFFICULTY_COLORS[d] : '#e4e4e7' }}>
                                {d ? d.charAt(0).toUpperCase() + d.slice(1) : 'All'}
                            </button>
                        ))}
                    </div>

                    <select value={filter.category} onChange={e => setFilter(f => ({ ...f, category: e.target.value }))} style={S.catSelect}>
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                    </select>
                </div>

                {/* Problem Table */}
                <div style={S.table}>
                    <div style={S.tableHeader}>
                        <span style={{ width: '40px' }}>✓</span>
                        <span style={{ flex: 1 }}>Title</span>
                        <span style={{ width: '100px' }}>Difficulty</span>
                        <span style={{ width: '120px' }}>Category</span>
                        <span style={{ width: '100px' }}>Acceptance</span>
                    </div>

                    {loading ? (
                        <div style={S.loadingRow}>Loading problems...</div>
                    ) : problems.length === 0 ? (
                        <div style={S.loadingRow}>No problems found</div>
                    ) : (
                        problems.map((p, i) => (
                            <div key={p._id} onClick={() => navigate(`/problems/${p.slug}`)}
                                style={{ ...S.tableRow, background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                                <span style={{ width: '40px', fontSize: '14px' }}>
                                    {p.solved ? '✅' : <span style={{ opacity: 0.3 }}>○</span>}
                                </span>
                                <span style={{ flex: 1, color: '#e4e4e7', fontWeight: 500 }}>
                                    {p.order}. {p.title}
                                </span>
                                <span style={{ width: '100px' }}>
                                    <span style={{ ...S.diffBadge, color: DIFFICULTY_COLORS[p.difficulty], background: `${DIFFICULTY_COLORS[p.difficulty]}15` }}>
                                        {p.difficulty}
                                    </span>
                                </span>
                                <span style={{ width: '120px', color: '#888', fontSize: '12px', textTransform: 'capitalize' }}>
                                    {p.category.replace(/_/g, ' ')}
                                </span>
                                <span style={{ width: '100px', color: '#888', fontSize: '12px' }}>
                                    {p.stats?.totalSubmissions > 0
                                        ? `${Math.round((p.stats.acceptedSubmissions / p.stats.totalSubmissions) * 100)}%`
                                        : '—'}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const S = {
    page: { minHeight: '100vh', background: 'var(--bg-primary, #1a1a2e)', fontFamily: 'Inter, sans-serif', color: '#e4e4e7' },
    container: { padding: '24px', maxWidth: '1100px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
    title: { margin: 0, fontSize: '28px', fontWeight: 800, background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    subtitle: { color: '#888', fontSize: '13px', marginTop: '4px' },
    backBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#888', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' },

    statsBar: {
        display: 'flex', alignItems: 'center', gap: '24px', padding: '16px 24px',
        background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)',
        marginBottom: '20px'
    },
    statItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' },
    statNum: { fontSize: '22px', fontWeight: 'bold', color: '#667eea' },
    statLabel: { fontSize: '10px', color: '#888', textTransform: 'uppercase' },
    statDivider: { width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)' },

    filters: { display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' },
    searchForm: { display: 'flex', gap: '8px', flex: 1, minWidth: '200px' },
    searchInput: {
        flex: 1, padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)',
        background: 'rgba(255,255,255,0.05)', color: '#e4e4e7', fontSize: '13px', outline: 'none'
    },
    searchBtn: { padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#667eea', color: '#fff', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' },
    filterBtns: { display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '3px' },
    filterBtn: {
        padding: '6px 14px', border: 'none', borderRadius: '6px', background: 'transparent',
        fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
    },
    filterActive: { background: 'rgba(255,255,255,0.08)' },
    catSelect: {
        padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)',
        background: 'rgba(255,255,255,0.05)', color: '#e4e4e7', fontSize: '12px', outline: 'none'
    },

    table: {
        background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden'
    },
    tableHeader: {
        display: 'flex', alignItems: 'center', padding: '12px 20px', gap: '12px',
        borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#888', fontSize: '11px',
        fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px'
    },
    tableRow: {
        display: 'flex', alignItems: 'center', padding: '12px 20px', gap: '12px',
        borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer',
        transition: 'background 0.15s', fontSize: '13px'
    },
    loadingRow: { padding: '40px', textAlign: 'center', color: '#888' },
    diffBadge: {
        padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, textTransform: 'capitalize'
    },
};

export default ProblemList;
