import { useNavigate } from 'react-router-dom';
import { Hexagon } from 'lucide-react';
import { Button } from '../ui';
import PublicFooter from './PublicFooter';

const FONT = { fontFamily: "'Inter', system-ui, sans-serif" };
const NAV = [['About', '/about'], ['Support', '/support'], ['Contact', '/contact']];

/** Consistent public page frame: sticky nav + footer. */
export default function PublicShell({ children }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col" style={FONT}>
      <header className="sticky top-0 z-40 border-b border-line" style={{ background: 'color-mix(in srgb, var(--cz-bg) 82%, transparent)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/home')} className="flex items-center gap-2.5 bg-transparent border-0 cursor-pointer">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center text-accent border border-accent/40 bg-accent/12"><Hexagon size={16} strokeWidth={2.5} /></span>
            <span className="text-[17px] font-extrabold tracking-tight text-text">CodeViz</span>
          </button>
          <nav className="hidden md:flex items-center gap-7 text-[14px] text-muted">
            {NAV.map(([label, href]) => (
              <button key={href} onClick={() => navigate(href)} className="hover:text-text transition-colors bg-transparent border-0 cursor-pointer text-inherit text-[14px]">{label}</button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="md" onClick={() => navigate('/login')}>Sign in</Button>
            <Button variant="primary" size="md" onClick={() => navigate('/signup')}>Get started</Button>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
