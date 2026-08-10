import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Hexagon, Play, GraduationCap, Target, Users, ArrowRight, Check } from 'lucide-react';
import { track } from '../../utils/analytics';

const KEY = 'cv_onboarded';

export function shouldOnboard() {
  try { return !localStorage.getItem(KEY); } catch { return false; }
}
function markDone(goal) {
  try { localStorage.setItem(KEY, '1'); localStorage.setItem('cv_goal', goal || ''); } catch { /* ignore */ }
}

const GOALS = [
  { id: 'learn', Icon: GraduationCap, title: 'Learn CS & algorithms', desc: 'Animated lessons + practice, from basics to advanced.', route: '/learn', cta: 'Open the Learn hub' },
  { id: 'interview', Icon: Target, title: 'Prep for interviews', desc: 'Problem vault, editorials, and AI mock interviews.', route: '/problems', cta: 'Start solving problems' },
  { id: 'teach', Icon: Users, title: 'Teach a class', desc: 'Classrooms, progress analytics, and integrity oversight.', route: '/classroom', cta: 'Set up a classroom' },
];

/**
 * First-run onboarding — welcome → goal → first action. Shown once (localStorage).
 * The goal routes the user to their "first win" in a couple of clicks.
 */
export default function OnboardingModal({ onClose }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState(null);
  const name = (() => { try { return JSON.parse(localStorage.getItem('userInfo') || '{}').name?.split(' ')[0]; } catch { return null; } })();

  const finish = (g) => {
    markDone(g?.id);
    track('onboarding_completed', { goal: g?.id || 'skip' });
    onClose();
    if (g?.route) navigate(g.route);
  };
  const skip = () => { markDone('skip'); track('onboarding_skipped'); onClose(); };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(8,10,20,.66)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <motion.div
        initial={{ scale: 0.94, y: 18, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 24 }}
        className="bg-surface border border-line rounded-2xl shadow-[var(--cz-shadow-md)] w-full max-w-md overflow-hidden"
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        {/* progress */}
        <div className="h-1 bg-elevated">
          <div className="h-full bg-accent transition-all duration-300" style={{ width: `${((step + 1) / 3) * 100}%` }} />
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="w" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-7 text-center">
              <span className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto text-accent border border-accent/30 bg-accent/12"><Hexagon size={26} strokeWidth={2.4} /></span>
              <h2 className="text-[22px] font-extrabold tracking-tight mt-4 m-0">Welcome{name ? `, ${name}` : ''} 👋</h2>
              <p className="text-muted text-[14px] leading-relaxed mt-2">CodeViz lets you <b className="text-text">write code and watch it run as an animation</b> — plus animated lessons, practice with editorials, and AI-guided interviews.</p>
              <button onClick={() => setStep(1)} className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-accent text-white font-bold text-[14px] rounded-xl px-5 py-3 cursor-pointer border-0">Get started <ArrowRight size={16} /></button>
              <button onClick={skip} className="mt-2 w-full text-muted text-[13px] bg-transparent border-0 cursor-pointer hover:text-text">Skip for now</button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="g" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-7">
              <div className="text-[12px] font-bold uppercase tracking-wide text-accent text-center">Step 2 of 3</div>
              <h2 className="text-[20px] font-extrabold tracking-tight mt-1 mb-4 text-center m-0">What brings you here?</h2>
              <div className="flex flex-col gap-2.5">
                {GOALS.map((g) => (
                  <button key={g.id} onClick={() => { setGoal(g); setStep(2); }} className="group flex items-center gap-3 text-left bg-elevated border border-line rounded-xl p-3.5 cursor-pointer hover:border-accent transition-colors">
                    <span className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-accent/12 text-accent border border-accent/25"><g.Icon size={19} /></span>
                    <span className="min-w-0">
                      <span className="block text-[14.5px] font-bold">{g.title}</span>
                      <span className="block text-[12.5px] text-muted">{g.desc}</span>
                    </span>
                    <ArrowRight size={16} className="ml-auto text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>
              <button onClick={skip} className="mt-3 w-full text-muted text-[13px] bg-transparent border-0 cursor-pointer hover:text-text">Skip</button>
            </motion.div>
          )}

          {step === 2 && goal && (
            <motion.div key="d" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-7 text-center">
              <span className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto text-success border border-success/30 bg-success/12"><Check size={26} strokeWidth={2.6} /></span>
              <h2 className="text-[20px] font-extrabold tracking-tight mt-4 m-0">You&apos;re all set</h2>
              <p className="text-muted text-[14px] leading-relaxed mt-2">Here&apos;s a great first step for <b className="text-text">{goal.title.toLowerCase()}</b>.</p>
              <button onClick={() => finish(goal)} className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-accent text-white font-bold text-[14px] rounded-xl px-5 py-3 cursor-pointer border-0"><Play size={15} /> {goal.cta}</button>
              <button onClick={() => finish(null)} className="mt-2 w-full text-muted text-[13px] bg-transparent border-0 cursor-pointer hover:text-text">Explore the dashboard instead</button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
