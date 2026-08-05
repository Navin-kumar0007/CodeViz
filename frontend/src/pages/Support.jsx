import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LifeBuoy, MessageSquare, BookOpen, ChevronDown } from 'lucide-react';
import PublicShell from '../components/marketing/PublicShell';
import { Button } from '../components/ui';

const FAQ = [
  ['Which languages can I run and visualize?', 'Python, JavaScript, TypeScript, Java, C, and C++ are fully visualized; Go and Rust run with output. C/C++ use GDB and Java uses JDI for real, step-accurate traces.'],
  ['Is CodeViz free?', 'Yes — the Free plan includes the visualizer, practice problems, and community features. Pro adds the AI mentor, interview prep, advanced courses and higher limits.'],
  ['How does the AI tutor work?', 'It’s Socratic — it guides you with questions instead of handing over answers, and can explain your bug directly on your visualization.'],
  ['Can I share a visualization?', 'Yes. Run your code, click Share, and you get a public link plus an embed you can drop into a blog or PR.'],
  ['Do you offer plans for schools / bootcamps?', 'Yes — the Team/EDU plan adds classrooms, cohort analytics, SSO and plagiarism detection with per-seat pricing. Contact us to set it up.'],
  ['How do I cancel my subscription?', 'Open Profile → Plan & billing → Cancel. You keep access until the end of your billing period.'],
  ['My code won’t run — what’s wrong?', 'Execution runs in a secure Docker sandbox with no network access and time/memory limits. Infinite loops or heavy programs may hit those limits; also check for syntax errors in the console.'],
];

function Item({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-line rounded-xl bg-surface overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left cursor-pointer bg-transparent border-0">
        <span className="text-[14px] font-semibold text-text">{q}</span>
        <ChevronDown size={16} className={`text-muted shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-4 pb-4 text-[13px] text-muted leading-relaxed">{a}</div>}
    </div>
  );
}

export default function Support() {
  const navigate = useNavigate();
  return (
    <PublicShell>
      <div className="max-w-3xl mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-accent">Support</span>
          <h1 className="text-[36px] font-extrabold tracking-tight mt-2 m-0">How can we help?</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          {[[MessageSquare, 'Contact us', 'Get a human reply', '/contact'], [BookOpen, 'Browse FAQ', 'Common questions', '#faq'], [LifeBuoy, 'Report a bug', 'Something broken?', '/contact']].map(([Icon, t, d, href]) => (
            <button key={t} onClick={() => (href.startsWith('#') ? document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }) : navigate(href))}
              className="text-left bg-surface border border-line rounded-xl p-4 cursor-pointer hover:border-accent transition-colors">
              <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-accent/12 text-accent mb-2"><Icon size={17} /></span>
              <div className="text-[14px] font-bold">{t}</div><div className="text-[12px] text-muted">{d}</div>
            </button>
          ))}
        </div>

        <h2 id="faq" className="text-[13px] font-bold uppercase tracking-[0.14em] text-faint mb-4 scroll-mt-20">Frequently asked</h2>
        <div className="flex flex-col gap-2">
          {FAQ.map(([q, a]) => <Item key={q} q={q} a={a} />)}
        </div>

        <div className="text-center mt-10 bg-surface border border-line rounded-2xl p-8">
          <h3 className="text-[18px] font-bold m-0">Still stuck?</h3>
          <p className="text-muted text-sm mt-1 mb-4">We’re happy to help directly.</p>
          <Button onClick={() => navigate('/contact')}>Contact support</Button>
        </div>
      </div>
    </PublicShell>
  );
}
