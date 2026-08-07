import { useState } from 'react';
import { Mail, MessageSquare, Clock, Send, CheckCircle2 } from 'lucide-react';
import PublicShell from '../components/marketing/PublicShell';
import { Input, Textarea, Select, Button, Spinner } from '../components/ui';
import { API } from '../utils/api';

const SUBJECTS = ['General', 'Support', 'Billing', 'Partnership / EDU', 'Bug report', 'Feedback'];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'General', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [err, setErr] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending'); setErr('');
    try {
      await API.post('/api/contact', form);
      setStatus('sent');
    } catch (ex) {
      setErr(ex.response?.data?.message || 'Could not send. Try again.');
      setStatus('error');
    }
  };

  return (
    <PublicShell>
      <div className="max-w-5xl mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-accent">Contact</span>
          <h1 className="text-[36px] font-extrabold tracking-tight mt-2 m-0">Get in touch</h1>
          <p className="text-muted mt-2 max-w-xl mx-auto">Questions, feedback, partnership or support — we read every message.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-6">
          {/* Info */}
          <div className="flex flex-col gap-3">
            {[[Mail, 'Email', 'hello@codeviz.app'], [MessageSquare, 'Support', 'Use the form — subject “Support”'], [Clock, 'Response time', 'Usually within 1–2 business days']].map(([Icon, t, d]) => (
              <div key={t} className="flex items-start gap-3 bg-surface border border-line rounded-xl p-4 shadow-[var(--cz-shadow-sm)]">
                <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-accent/12 text-accent shrink-0"><Icon size={17} /></span>
                <div><div className="text-[14px] font-bold">{t}</div><div className="text-[13px] text-muted">{d}</div></div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="bg-surface border border-line rounded-2xl p-6 shadow-[var(--cz-shadow-sm)]">
            {status === 'sent' ? (
              <div className="flex flex-col items-center text-center gap-3 py-10">
                <span className="w-12 h-12 rounded-xl flex items-center justify-center bg-success/12 text-success"><CheckCircle2 size={26} /></span>
                <div className="text-[17px] font-bold">Message sent</div>
                <p className="text-muted text-sm max-w-sm m-0">Thanks for reaching out — we’ll get back to you soon.</p>
                <Button variant="secondary" onClick={() => { setForm({ name: '', email: '', subject: 'General', message: '' }); setStatus('idle'); }}>Send another</Button>
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="text-[12px] font-semibold text-muted block mb-1.5">Name</label><Input required value={form.name} onChange={set('name')} placeholder="Your name" /></div>
                  <div><label className="text-[12px] font-semibold text-muted block mb-1.5">Email</label><Input required type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" /></div>
                </div>
                <div><label className="text-[12px] font-semibold text-muted block mb-1.5">Subject</label>
                  <Select value={form.subject} onChange={set('subject')}>{SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}</Select>
                </div>
                <div><label className="text-[12px] font-semibold text-muted block mb-1.5">Message</label><Textarea required rows={6} value={form.message} onChange={set('message')} placeholder="How can we help?" /></div>
                {err && <div className="text-[13px] text-danger">{err}</div>}
                <Button type="submit" size="lg" disabled={status === 'sending'} className="self-start">
                  {status === 'sending' ? <><Spinner size={15} /> Sending…</> : <><Send size={15} /> Send message</>}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
