import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';

const API = 'http://localhost:5001';

const AlgorithmDNA = () => {
    const [dnaData, setDnaData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDNA = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                if (!userInfo) return;

                const { data } = await axios.get(`${API}/api/gamification/dna`, {
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

    if (!dnaData || dnaData.length === 0) {
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
                        <PolarGrid stroke="#4a5568" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#a0aec0', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="Skill Level"
                            dataKey="A"
                            stroke="#8a2be2"
                            fill="#8a2be2"
                            fillOpacity={0.5}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568', borderRadius: '8px' }}
                            itemStyle={{ color: '#8a2be2', fontWeight: 'bold' }}
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
        background: 'linear-gradient(145deg, #1a202c, #2d3748)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #4a5568',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
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
        fontSize: '22px',
        fontWeight: 'bold',
        background: 'linear-gradient(90deg, #9f7aea, #4299e1)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
    },
    subtitle: {
        margin: '5px 0 0 0',
        fontSize: '13px',
        color: '#a0aec0'
    },
    chartWrapper: {
        flex: 1,
        width: '100%',
        minHeight: '250px'
    },
    footer: {
        marginTop: '10px',
        textAlign: 'center'
    },
    hint: {
        margin: 0,
        fontSize: '12px',
        color: '#718096',
        fontStyle: 'italic'
    },
    loading: {
        padding: '40px',
        textAlign: 'center',
        color: '#a0aec0',
        background: '#2d3748',
        borderRadius: '16px'
    },
    empty: {
        color: '#a0aec0',
        textAlign: 'center',
        marginTop: '40px'
    }
};

export default AlgorithmDNA;
