import { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { Dialog, Button, Input } from '../ui';
import { API } from '../../utils/api';

/**
 * Creates a public shareable visualization from the current run and shows the
 * link + embed code. Drop into any toolbar: <ShareVizButton code language trace />.
 */
export default function ShareVizButton({ code, language, trace, output, title }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { url, embedUrl }
  const [copied, setCopied] = useState('');
  const [error, setError] = useState('');

  const create = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await API.post('/api/share', {
        title: title || `${language} visualization`,
        language, code, trace, output,
      });
      setResult(data);
    } catch (e) {
      setError(e.response?.data?.message || 'Could not create share.');
    }
    setLoading(false);
  };

  const openModal = () => { setOpen(true); setResult(null); setError(''); create(); };
  const copy = (text, which) => { navigator.clipboard?.writeText(text); setCopied(which); setTimeout(() => setCopied(''), 1500); };

  const embedCode = result ? `<iframe src="${result.embedUrl}" width="720" height="460" frameborder="0" title="CodeViz"></iframe>` : '';

  return (
    <>
      <button onClick={openModal} className="btn-secondary" title="Share this visualization">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Share2 size={14} /> Share</span>
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} title="Share visualization">
        {loading ? (
          <p className="text-muted text-sm m-0">Creating share link…</p>
        ) : error ? (
          <p className="text-danger text-sm m-0">{error}</p>
        ) : result ? (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-[12px] font-semibold text-muted block mb-1.5">Link</label>
              <div className="flex gap-2">
                <Input readOnly value={result.url} onFocus={(e) => e.target.select()} />
                <Button variant="secondary" onClick={() => copy(result.url, 'url')}>{copied === 'url' ? <Check size={15} /> : <Copy size={15} />}</Button>
              </div>
            </div>
            <div>
              <label className="text-[12px] font-semibold text-muted block mb-1.5">Embed</label>
              <div className="flex gap-2">
                <Input readOnly value={embedCode} onFocus={(e) => e.target.select()} />
                <Button variant="secondary" onClick={() => copy(embedCode, 'embed')}>{copied === 'embed' ? <Check size={15} /> : <Copy size={15} />}</Button>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => window.open(result.url, '_blank')}>Open ↗</Button>
            </div>
          </div>
        ) : null}
      </Dialog>
    </>
  );
}
