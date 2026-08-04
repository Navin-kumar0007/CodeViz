import { useState } from 'react';
import {
  Button, IconButton, Input, Textarea, Select, Card, CardHeader, CardTitle, CardBody,
  Badge, DifficultyBadge, Tabs, Dialog, Spinner, Skeleton, Kbd, EmptyState, ProgressBar,
} from '../components/ui';

/**
 * UI Kit — QA / reference page for the Phase 0 component library.
 * Visit /ui-kit. Every primitive rendered in one place; light+dark via the
 * app theme toggle. This is the contract every migrated screen builds on.
 */
function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent mb-3">{title}</h2>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </section>
  );
}

export default function UIKit() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('overview');

  return (
    <div className="min-h-full bg-bg text-text" style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <header className="mb-8 pb-5 border-b border-line">
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-accent mb-2">Phase 0 · Design System</div>
          <h1 className="text-3xl font-extrabold tracking-tight">CodeViz UI Kit</h1>
          <p className="text-muted mt-1 text-sm">Token-driven primitives. Toggle the app theme to check both light &amp; dark.</p>
        </header>

        <Section title="Buttons">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="subtle">Subtle</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="primary" disabled>Disabled</Button>
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="lg">Large</Button>
          <IconButton aria-label="Star">★</IconButton>
        </Section>

        <Section title="Badges & difficulty">
          <Badge>Neutral</Badge>
          <Badge tone="accent">Accent</Badge>
          <Badge tone="success">Passed</Badge>
          <Badge tone="warning">Pending</Badge>
          <Badge tone="danger">Failed</Badge>
          <Badge tone="info">Info</Badge>
          <DifficultyBadge level="easy" />
          <DifficultyBadge level="medium" />
          <DifficultyBadge level="hard" />
        </Section>

        <Section title="Inputs">
          <div className="w-52"><Input placeholder="Search problems…" /></div>
          <div className="w-40">
            <Select defaultValue="py">
              <option value="py">Python</option>
              <option value="js">JavaScript</option>
              <option value="cpp">C++</option>
            </Select>
          </div>
          <div className="w-64"><Textarea placeholder="Write a note…" rows={2} /></div>
        </Section>

        <Section title="Feedback">
          <Spinner />
          <Kbd>⌘</Kbd><Kbd>K</Kbd>
          <div className="w-40 flex flex-col gap-2">
            <Skeleton style={{ height: 10, width: '100%' }} />
            <Skeleton style={{ height: 10, width: '70%' }} />
          </div>
          <div className="w-64"><ProgressBar value={62} label="Course progress" /></div>
        </Section>

        <Section title="Overlays">
          <Button onClick={() => setOpen(true)}>Open dialog</Button>
        </Section>

        <div className="mb-8">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent mb-3">Card + Tabs</h2>
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Two Sum</CardTitle>
              <DifficultyBadge level="easy" />
            </CardHeader>
            <Tabs
              className="px-2"
              tabs={[{ id: 'overview', label: 'Overview' }, { id: 'stats', label: 'Stats' }]}
              value={tab}
              onChange={setTab}
            />
            <CardBody>
              {tab === 'overview'
                ? <p className="text-muted text-sm m-0">Given an array of integers, return indices of the two numbers that add up to a target.</p>
                : <p className="text-muted text-sm m-0">Acceptance 52% · 4.2M submissions</p>}
            </CardBody>
          </Card>
        </div>

        <div className="mb-8">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent mb-3">Empty state</h2>
          <Card><EmptyState icon="🔍" title="No results" hint="Try a different filter or search term." action={<Button size="sm">Clear filters</Button>} /></Card>
        </div>

        <Dialog open={open} onClose={() => setOpen(false)} title="Confirm action">
          <p className="text-muted text-sm mb-4">This is the zero-dependency modal primitive. ESC or backdrop closes it.</p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setOpen(false)}>Confirm</Button>
          </div>
        </Dialog>
      </div>
    </div>
  );
}
