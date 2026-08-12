import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, Search } from 'lucide-react';
import { API as axios } from '../utils/api';
import API_BASE from '../utils/api';
import { Input, Select, Button, DifficultyBadge, Badge, Spinner, EmptyState } from '../components/ui';

const API = `${API_BASE}/api/problems`;
const FONT = { fontFamily: "'Inter', system-ui, sans-serif" };
const DIFFS = ['', 'easy', 'medium', 'hard'];
const PER_PAGE = 35;

export default function ProblemList() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('userInfo'));
  const token = user?.token;

  const [problems, setProblems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ difficulty: '', category: '', search: '' });
  const [stats, setStats] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = { limit: PER_PAGE, page };
        if (filter.difficulty) params.difficulty = filter.difficulty;
        if (filter.category) params.category = filter.category;
        if (filter.search) params.search = filter.search;
        const { data } = await axios.get(API, { headers, params });
        if (!cancelled) { setProblems(data.problems || []); setTotal(data.total || 0); setCategories(data.categories || []); }
      } catch { /* ignore */ }
      try {
        const { data } = await axios.get(`${API}/submissions/stats`, { headers });
        if (!cancelled) setStats(data);
      } catch { /* ignore */ }
      if (!cancelled) setLoading(false);
    };
    fetchData();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, filter.difficulty, filter.category, refreshKey, page]);

  const handleSearch = useCallback((e) => { e.preventDefault(); setPage(1); setRefreshKey((k) => k + 1); }, []);
  const solvedCount = stats?.solved ?? problems.filter((p) => p.solved).length;

  return (
    <div className="min-h-full bg-bg text-text" style={FONT}>
      <div className="max-w-5xl mx-auto px-6 py-8 pb-16">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
          <div>
            <h1 className="text-[24px] font-extrabold tracking-tight m-0">Problem Set</h1>
            <p className="text-muted text-[13px] m-0 mt-1">{total} problems · master DSA with curated challenges</p>
          </div>
          <div className="flex items-center gap-2 text-[13px]">
            <Badge tone="success">{solvedCount} solved</Badge>
            <Badge tone="neutral">{total} total</Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 min-w-[220px]">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
              <Input className="pl-9" placeholder="Search problems…" value={filter.search} onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))} />
            </div>
            <Button type="submit" variant="secondary" size="md">Search</Button>
          </form>
          <div className="w-44">
            <Select value={filter.category} onChange={(e) => { setPage(1); setFilter((f) => ({ ...f, category: e.target.value })); }}>
              <option value="">All categories</option>
              {categories.map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
            </Select>
          </div>
          <div className="inline-flex bg-surface border border-line rounded-lg p-0.5">
            {DIFFS.map((d) => (
              <button
                key={d}
                onClick={() => { setPage(1); setFilter((f) => ({ ...f, difficulty: d })); }}
                className={`px-3 h-7 rounded-md text-[12px] font-semibold capitalize transition-colors cursor-pointer ${filter.difficulty === d ? 'bg-accent text-accent-fg' : 'text-muted hover:text-text'}`}
              >
                {d || 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface border border-line rounded-xl overflow-hidden shadow-[var(--cz-shadow-sm)]">
          <div className="grid grid-cols-[44px_56px_1fr_auto] items-center gap-3 px-4 h-10 border-b border-line bg-elevated text-[11px] font-bold uppercase tracking-wide text-faint">
            <span>Status</span><span>#</span><span>Title</span><span>Difficulty</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted text-sm"><Spinner /> Loading problems…</div>
          ) : problems.length === 0 ? (
            <EmptyState icon="🔍" title="No problems found" hint="Try a different search or filter." action={<Button size="sm" onClick={() => { setPage(1); setFilter({ difficulty: '', category: '', search: '' }); }}>Clear filters</Button>} />
          ) : (
            problems.map((p, i) => (
              <button
                key={p._id}
                onClick={() => navigate(`/problems/${p.slug}`)}
                className="w-full grid grid-cols-[44px_56px_1fr_auto] items-center gap-3 px-4 h-[52px] border-b border-line last:border-0 text-left cursor-pointer hover:bg-elevated transition-colors"
              >
                <span className="flex justify-center">
                  {p.solved ? <CheckCircle2 size={17} className="text-success" /> : <Circle size={16} className="text-faint" />}
                </span>
                <span className="font-mono text-[13px] text-muted tabular-nums">{(page - 1) * PER_PAGE + i + 1}</span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-semibold text-text truncate">{p.title}</span>
                  {p.category && <span className="block text-[12px] text-muted truncate capitalize">{String(p.category).replace(/_/g, ' ')}</span>}
                </span>
                <DifficultyBadge level={p.difficulty} />
              </button>
            ))
          )}
        </div>

        {/* Pagination */}
        {total > PER_PAGE && (
          <div className="flex items-center justify-between gap-3 mt-4">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>← Previous</Button>
            <span className="text-[13px] text-muted tabular-nums">Page {page} of {Math.max(1, Math.ceil(total / PER_PAGE))}</span>
            <Button variant="secondary" size="sm" disabled={page >= Math.ceil(total / PER_PAGE)} onClick={() => setPage((p) => p + 1)}>Next →</Button>
          </div>
        )}
      </div>
    </div>
  );
}
