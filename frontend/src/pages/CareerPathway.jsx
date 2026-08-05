import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, ExternalLink, Award } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody, Button, EmptyState, Spinner } from '../components/ui';
import { API as axios } from '../utils/api';
import API_BASE from '../utils/api';

const FONT = { fontFamily: "'Inter', system-ui, sans-serif" };
const SKILLS = [
  { id: 'python', label: 'Python Mastery', level: 85 },
  { id: 'dsa', label: 'Data Structures', level: 70 },
  { id: 'algo', label: 'Algorithms', level: 60 },
  { id: 'visual', label: 'Visual Debugging', level: 95 },
];

export default function CareerPathway() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('userInfo'));
  const authHeaders = { headers: { Authorization: `Bearer ${user?.token}` } };

  useEffect(() => {
    axios.get(`${API_BASE}/api/certificates/my`, authHeaders)
      .then((res) => setCertificates(res.data))
      .catch((err) => console.error('Failed to fetch certificates:', err))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-full bg-bg text-text" style={FONT}>
      <div className="max-w-5xl mx-auto px-6 py-8 pb-16">
        <h1 className="text-[24px] font-extrabold tracking-tight m-0">My Career Pathway</h1>
        <p className="text-muted text-[14px] mt-1 mb-6">Track your algorithmic mastery and verifiable credentials.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Skill mastery */}
          <Card>
            <CardHeader><CardTitle>Skill mastery</CardTitle></CardHeader>
            <CardBody className="flex flex-col gap-4">
              {SKILLS.map((s, i) => (
                <div key={s.id}>
                  <div className="flex items-center justify-between text-[13px] mb-1.5"><span className="font-semibold text-text">{s.label}</span><span className="font-mono text-muted tabular-nums">{s.level}%</span></div>
                  <div className="h-2.5 rounded-full bg-elevated border border-line overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${s.level}%` }} transition={{ delay: i * 0.08, duration: 0.8, ease: 'easeOut' }} className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, var(--cz-accent), #8fa2ff)' }} />
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Certificates */}
          <Card>
            <CardHeader><CardTitle>Verifiable credentials</CardTitle></CardHeader>
            <CardBody>
              {loading ? (
                <div className="flex items-center gap-2 text-muted text-sm py-6"><Spinner size={15} /> Loading credentials…</div>
              ) : certificates.length === 0 ? (
                <EmptyState icon="🎓" title="No certificates yet" hint="Complete a course to earn a verifiable credential." action={<Button size="sm" onClick={() => navigate('/learn')}>Explore courses</Button>} />
              ) : (
                <div className="flex flex-col gap-2">
                  {certificates.map((cert) => (
                    <div key={cert._id} className="flex items-center gap-3 bg-elevated border border-line rounded-lg px-4 py-3">
                      <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-accent/12 text-accent shrink-0"><Award size={18} /></span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-semibold text-text truncate">{cert.courseName}</div>
                        <div className="text-[11px] font-mono text-muted truncate">ID: {cert.credentialId}</div>
                        <div className="text-[11px] text-faint">Issued: {new Date(cert.issueDate).toLocaleDateString()}</div>
                      </div>
                      <Button size="sm" variant="secondary" onClick={() => window.open(`${window.location.origin}/verify/${cert.credentialId}`)}>Verify <ExternalLink size={13} /></Button>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
