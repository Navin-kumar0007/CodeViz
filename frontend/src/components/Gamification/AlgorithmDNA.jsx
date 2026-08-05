import { useState, useEffect } from 'react';
import { API as axios } from '../../utils/api';
import API_BASE from '../../utils/api';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip,
} from 'recharts';
import { Spinner, EmptyState } from '../ui';

const API = API_BASE;

export default function AlgorithmDNA() {
  const [dnaData, setDnaData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDNA = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) return;
        const { data } = await axios.get(`${API}/api/progress/dna`, { headers: { Authorization: `Bearer ${userInfo.token}` } });
        setDnaData(data);
      } catch (error) {
        console.error('Failed to fetch DNA data:', error);
      }
      setLoading(false);
    };
    fetchDNA();
  }, []);

  if (loading) {
    return <div className="h-full flex items-center justify-center gap-2 text-muted text-sm" style={{ fontFamily: "'Inter',sans-serif" }}><Spinner size={16} /> Analyzing DNA…</div>;
  }

  if (!Array.isArray(dnaData) || dnaData.length === 0) {
    return <EmptyState icon="🧬" title="No DNA yet" hint="Complete challenges across categories to map your skill genome." />;
  }

  return (
    <div className="h-full w-full min-h-[220px]" style={{ fontFamily: "'Inter',sans-serif" }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="72%" data={dnaData}>
          <PolarGrid stroke="var(--cz-line)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--cz-muted)', fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar name="Skill" dataKey="A" stroke="var(--cz-accent)" fill="var(--cz-accent)" fillOpacity={0.22} />
          <Tooltip
            contentStyle={{ background: 'var(--cz-surface)', border: '1px solid var(--cz-line)', borderRadius: '8px', boxShadow: 'var(--cz-shadow-md)', color: 'var(--cz-text)' }}
            itemStyle={{ color: 'var(--cz-accent)', fontWeight: 700 }}
            labelStyle={{ color: 'var(--cz-text)' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
