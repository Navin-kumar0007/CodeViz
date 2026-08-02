import React, { useState, useEffect } from 'react';
import { API as axios } from '../../utils/api';
import API_BASE from '../../utils/api';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';

const API = API_BASE;

const AlgorithmDNA = () => {
    const [dnaData, setDnaData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDNA = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                if (!userInfo) return;

                const { data } = await axios.get(`${API}/api/progress/dna`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });

                setDnaData(data);
            } catch (error) {
                console.error('Failed to fetch DNA data:', error);
            }
            setLoading(false);
        };
        fetchDNA();
    }, []);

    if (loading) return <div style={styles.loading}>Analyzing DNA...</div>;

    if (!dnaData || !Array.isArray(dnaData) || dnaData.length === 0) {
        return (
            <div style={styles.container}>
                <h3 style={styles.title}>🧬 Algorithm DNA</h3>
                <p style={styles.empty}>Complete challenges to map your skill genome!</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h3 style={styles.title}>🧬 Algorithm DNA</h3>
                <p style={styles.subtitle}>Your unique problem-solving footprint</p>
            </div>

            <div style={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={dnaData}>
                        <PolarGrid stroke="var(--border-strong)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontFamily: 'var(--font-label)' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="Skill Level"
                            dataKey="A"
                            stroke="var(--accent-violet)"
                            fill="var(--accent-violet)"
                            fillOpacity={0.2}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'var(--bg-highest)', border: '1px solid var(--border-strong)', borderRadius: '4px', boxShadow: 'none' }}
                            itemStyle={{ color: 'var(--accent-violet)', fontWeight: 'bold', fontFamily: 'var(--font-code)' }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            <div style={styles.footer}>
                <p style={styles.hint}>
                    💡 Keep solving different categories to expand your DNA strand!
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '400px',
        width: '100%',
        boxSizing: 'border-box'
    },
    header: {
        textAlign: 'center',
        marginBottom: '10px'
    },
    title: {
        margin: 0,
        fontSize: '18px',
        fontWeight: 700,
        color: 'var(--text-primary)'
    },
    subtitle: {
        margin: '4px 0 0 0',
        fontSize: '13px',
        color: 'var(--text-secondary)'
    },
    chartWrapper: {
        flex: 1,
        width: '100%',
        minHeight: '250px',
        minWidth: '200px',
    },
    footer: {
        marginTop: '10px',
        textAlign: 'center'
    },
    hint: {
        margin: 0,
        fontSize: '12px',
        color: 'var(--text-muted)',
        fontStyle: 'italic'
    },
    loading: {
        padding: '40px',
        textAlign: 'center',
        color: 'var(--text-muted)'
    },
    empty: {
        color: 'var(--text-muted)',
        textAlign: 'center',
        marginTop: '40px'
    }
};

export default AlgorithmDNA;
