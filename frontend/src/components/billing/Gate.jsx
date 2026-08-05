import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useEntitlements } from '../../hooks/useEntitlements';
import { Button } from '../ui';

/**
 * Gate premium UI behind a plan feature.
 * <Gate feature="ai-mentor"> …premium content… </Gate>
 * Shows an upgrade prompt when the plan lacks the feature.
 */
export function Gate({ feature, children, fallback }) {
  const { loading, hasFeature } = useEntitlements();
  const navigate = useNavigate();

  if (loading) return null;
  if (hasFeature(feature)) return children;
  if (fallback) return fallback;

  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-10 px-6 bg-surface border border-line rounded-xl">
      <span className="w-11 h-11 rounded-xl flex items-center justify-center bg-accent/12 text-accent border border-accent/25"><Lock size={20} /></span>
      <div className="text-[15px] font-bold text-text">Pro feature</div>
      <div className="text-[13px] text-muted max-w-sm">Upgrade your plan to unlock this.</div>
      <Button size="sm" onClick={() => navigate('/pricing')}>See plans</Button>
    </div>
  );
}

export default Gate;
