import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API as axios } from '../../utils/api';
import API_BASE from '../../utils/api';
import { Spinner, EmptyState } from '../ui';

const API = API_BASE;

export default function SkillTreeWidget() {
  const [skillData, setSkillData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkillTree = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) return;
        const { data } = await axios.get(`${API}/api/progress/skill-tree`, { headers: { Authorization: `Bearer ${userInfo.token}` } });
        setSkillData(data);
      } catch (error) {
        console.error('Failed to fetch Skill Tree data:', error);
      }
      setLoading(false);
    };
    fetchSkillTree();
  }, []);

  if (loading) {
    return <div className="h-full flex items-center justify-center gap-2 text-muted text-sm" style={{ fontFamily: "'Inter',sans-serif" }}><Spinner size={16} /> Decoding skill matrix…</div>;
  }

  if (!skillData?.domains || Object.keys(skillData.domains).length === 0) {
    return <EmptyState icon="🌳" title="No skills yet" hint="Solve problems to grow your skill branches." />;
  }

  const domains = Object.entries(skillData.domains);

  return (
    <div className="w-full" style={{ fontFamily: "'Inter',sans-serif" }}>
      {typeof skillData.totalPoints === 'number' && (
        <div className="text-[12px] text-muted mb-3">{skillData.totalPoints} total knowledge points</div>
      )}
      <div className="flex flex-col gap-3.5">
        {domains.map(([key, domain]) => (
          <div key={key} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] font-semibold text-text">{domain.title}</span>
              <span className="text-[11px] font-mono text-muted tabular-nums">{domain.mastery}%</span>
            </div>
            <div className="h-2 rounded-full bg-elevated border border-line overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${domain.mastery}%` }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, var(--cz-accent), #8fa2ff)' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
