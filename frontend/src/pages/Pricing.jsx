import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, ArrowLeft, Sparkles } from 'lucide-react';
import { Button, Badge, Spinner } from '../components/ui';
import { useEntitlements } from '../hooks/useEntitlements';
import { API } from '../utils/api';

const FONT = { fontFamily: "'Inter', system-ui, sans-serif" };
const EASE = [0.22, 1, 0.36, 1];
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } };
const cardIn = { hidden: { opacity: 0, y: 26, scale: 0.96 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 240, damping: 24 } } };

const FEATURE_LABEL = {
  visualizer: 'Motion-Flow visualizer',
  'basic-practice': 'Practice & problems',
  community: 'Community & forum',
  'ai-mentor': 'AI mentor & code review',
  'interview-prep': 'AI mock interviews',
  'advanced-courses': 'Advanced courses',
  'unlimited-share': 'Unlimited shareable embeds',
  'priority-execution': 'Priority execution',
  classrooms: 'Classrooms & cohorts',
  analytics: 'Teacher analytics',
  sso: 'SSO',
  plagiarism: 'Plagiarism detection',
};
const PRICE = { free: '₹0', pro: '₹799', team: 'Custom' };
const TAG = { free: 'forever', pro: 'per month', team: 'per seat' };

export default function Pricing() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const { data, loading, refresh } = useEntitlements();
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');

  const plans = data?.plans || [];
  const current = data?.plan;

  const choose = async (planId) => {
    if (planId === 'free' || planId === current) return;
    setBusy(planId); setMsg('');
    try {
      const { data: res } = await API.post('/api/billing/checkout', { plan: planId });
      if (res.url) { window.location.assign(res.url); return; }
      setMsg('Checkout started.');
    } catch (e) {
      const m = e.response?.data?.message || 'Could not start checkout.';
      // Dev fallback when the gateway isn't configured yet.
      if (e.response?.status === 503 && !data?.gatewayConfigured) {
        try { await API.post('/api/billing/dev/set-plan', { plan: planId }); await refresh(); setMsg(`Switched to ${planId} (dev mode).`); }
        catch { setMsg(m); }
      } else setMsg(m);
    }
    setBusy('');
  };

  return (
    <div className="min-h-full bg-bg text-text" style={FONT}>
      <div className="max-w-5xl mx-auto px-6 py-8 pb-16">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft size={15} /> Back</Button>
        <motion.div
          className="text-center my-8"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <span className="inline-flex items-center gap-2 text-[12px] font-semibold text-accent bg-accent/10 border border-accent/25 rounded-full px-3 py-1 mb-4">
            <motion.span animate={reduce ? undefined : { rotate: [0, 15, -15, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}><Sparkles size={13} /></motion.span> Simple pricing
          </span>
          <h1 className="text-[32px] font-extrabold tracking-tight m-0">Choose your plan</h1>
          <p className="text-muted mt-2">Start free. Upgrade when you want the AI mentor, interview prep and more.</p>
        </motion.div>

        {msg && <div className="text-center text-[13px] text-accent mb-4">{msg}</div>}

        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
            variants={reduce ? undefined : stagger}
            initial={reduce ? false : 'hidden'}
            animate={reduce ? undefined : 'show'}
          >
            {plans.map((p) => {
              const isCurrent = p.id === current;
              const highlight = p.id === 'pro';
              return (
                <motion.div
                  key={p.id}
                  variants={reduce ? undefined : cardIn}
                  whileHover={reduce ? undefined : { y: highlight ? -10 : -6, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                  className={`relative flex flex-col bg-surface border rounded-2xl p-6 shadow-[var(--cz-shadow-sm)] hover:shadow-[var(--cz-shadow-md)] transition-shadow ${highlight ? 'border-accent md:-mt-2 md:mb-2 ring-1 ring-accent/25' : 'border-line'}`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-[18px] font-bold m-0">{p.name}</h3>
                    {isCurrent ? <Badge tone="success">Current</Badge> : highlight ? <Badge tone="accent">Popular</Badge> : null}
                  </div>
                  <div className="mt-3 mb-1"><span className="text-[30px] font-extrabold">{PRICE[p.id]}</span> <span className="text-[13px] text-muted">/ {TAG[p.id]}</span></div>
                  <div className="text-[12px] text-muted mb-4">{p.limits.executionsPerDay}/day runs · {p.limits.aiCallsPerDay}/day AI</div>
                  <ul className="flex flex-col gap-2 m-0 p-0 list-none flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-[13px]"><Check size={15} className="text-success shrink-0" /> {FEATURE_LABEL[f] || f}</li>
                    ))}
                  </ul>
                  <motion.div className="mt-6" whileHover={reduce || isCurrent || p.id === 'free' ? undefined : { scale: 1.03 }} whileTap={reduce || isCurrent || p.id === 'free' ? undefined : { scale: 0.97 }}>
                    <Button
                      className="w-full"
                      variant={highlight && !isCurrent ? 'primary' : 'secondary'}
                      disabled={isCurrent || p.id === 'free' || busy === p.id}
                      onClick={() => choose(p.id)}
                    >
                      {busy === p.id ? <><Spinner size={14} /> …</> : isCurrent ? 'Current plan' : p.id === 'free' ? 'Free' : p.id === 'team' ? 'Contact sales' : 'Upgrade'}
                    </Button>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
