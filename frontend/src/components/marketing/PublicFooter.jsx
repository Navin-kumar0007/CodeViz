import { useNavigate } from 'react-router-dom';
import { Hexagon, Github, Twitter, Mail } from 'lucide-react';

const COLS = [
  { title: 'Product', links: [['Features', '/home#features'], ['How it works', '/home#how'], ['Languages', '/home#languages'], ['Sign up', '/signup']] },
  { title: 'Company', links: [['About', '/about'], ['Founder', '/about#founder'], ['Contact', '/contact']] },
  { title: 'Support', links: [['Help & support', '/support'], ['FAQ', '/support#faq'], ['Contact us', '/contact']] },
  { title: 'Legal', links: [['Privacy', '/privacy'], ['Terms', '/terms']] },
];

export default function PublicFooter() {
  const navigate = useNavigate();
  const go = (href) => { if (href.startsWith('/home#') || href.includes('#')) window.location.assign(href); else navigate(href); };
  return (
    <footer className="border-t border-line mt-8">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-accent border border-accent/40 bg-accent/12"><Hexagon size={14} strokeWidth={2.5} /></span>
              <span className="text-[15px] font-extrabold tracking-tight">CodeViz</span>
            </div>
            <p className="text-[13px] text-muted m-0 max-w-xs">Learn and teach code by seeing it run — animated visualization across 8 languages.</p>
            <div className="flex gap-2 mt-4">
              {[[Github, 'https://github.com'], [Twitter, 'https://twitter.com'], [Mail, '/contact']].map(([Icon, href], i) => (
                <button key={i} onClick={() => go(href)} className="w-8 h-8 rounded-lg flex items-center justify-center border border-line text-muted hover:text-accent hover:border-accent transition-colors bg-surface"><Icon size={15} /></button>
              ))}
            </div>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <div className="text-[12px] font-bold uppercase tracking-wider text-faint mb-3">{c.title}</div>
              <ul className="flex flex-col gap-2 m-0 p-0 list-none">
                {c.links.map(([label, href]) => (
                  <li key={label}><button onClick={() => go(href)} className="text-[13px] text-muted hover:text-text transition-colors bg-transparent border-0 p-0 cursor-pointer text-left">{label}</button></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 mt-10 pt-6 border-t border-line text-[12px] text-faint">
          <span>© {new Date().getFullYear()} CodeViz. All rights reserved.</span>
          <span className="flex gap-4">
            <button onClick={() => navigate('/privacy')} className="bg-transparent border-0 cursor-pointer text-inherit hover:text-text">Privacy</button>
            <button onClick={() => navigate('/terms')} className="bg-transparent border-0 cursor-pointer text-inherit hover:text-text">Terms</button>
          </span>
        </div>
      </div>
    </footer>
  );
}
