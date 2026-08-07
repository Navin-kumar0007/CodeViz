const aiService = require('./aiService');
const groqProvider = require('./groqService');

const DISCLAIMER =
  'These are behavioural signals to support a conversation — not proof of misconduct. ' +
  'AI-style detection is statistical and unreliable; it must never be the sole basis for an academic-integrity decision.';

/**
 * Build an academic-integrity report for a submission by fusing authorship
 * telemetry (typed vs pasted) with an AI-style signal. Returns SIGNALS, framed
 * explicitly as hints, never verdicts.
 */
async function buildReport(submission, { includeAiSignal = true } = {}) {
  const integ = submission.integrity || {};
  const typed = integ.typedChars || 0;
  const pasted = integ.pastedChars || 0;
  const total = typed + pasted;
  const typedPct = total ? Math.round((typed / total) * 100) : null;
  const pastePct = typedPct === null ? null : 100 - typedPct;
  const pasteEvents = Array.isArray(integ.pasteEvents) ? integ.pasteEvents : [];
  const biggestPaste = pasteEvents.reduce((m, p) => Math.max(m, p.size || 0), 0);

  // AI-style signal (best effort; a hint only).
  let aiSignal = null;
  if (includeAiSignal && submission.code) {
    try {
      const raw = await aiService.detectAI(submission.code, submission.language);
      aiSignal = typeof raw === 'string' ? groqProvider.safeParseJson(raw) : raw;
    } catch {
      aiSignal = null;
    }
  }

  // Flags — each is a signal with a severity, plus plain-language text.
  const flags = [];
  if (pastePct !== null && total > 40) {
    if (pastePct >= 70) flags.push({ level: 'high', text: `${pastePct}% of the final code was pasted rather than typed.` });
    else if (pastePct >= 40) flags.push({ level: 'medium', text: `${pastePct}% of the code was pasted.` });
  }
  if (biggestPaste >= 300) flags.push({ level: 'high', text: `A single block of ${biggestPaste} characters was pasted at once.` });
  else if (biggestPaste >= 120) flags.push({ level: 'medium', text: `A ${biggestPaste}-character block was pasted in one action.` });
  if (aiSignal && typeof aiSignal.aiProbability === 'number' && aiSignal.aiProbability >= 70) {
    flags.push({ level: 'medium', text: `AI-style patterns detected (~${aiSignal.aiProbability}%) — a weak hint, not proof.` });
  }
  if (total > 40 && flags.length === 0) {
    flags.push({ level: 'ok', text: 'Mostly typed incrementally with no large pastes — consistent with original work.' });
  }

  // A single, deliberately soft overall read.
  let overall = 'insufficient-data';
  if (total > 40) {
    const high = flags.some((f) => f.level === 'high');
    const med = flags.some((f) => f.level === 'medium');
    overall = high ? 'review-suggested' : med ? 'some-signals' : 'looks-original';
  }

  return {
    submissionId: submission._id,
    overall, // insufficient-data | looks-original | some-signals | review-suggested
    authorship: {
      typedChars: typed,
      pastedChars: pasted,
      typedPct,
      pastePct,
      keystrokes: integ.keystrokes || 0,
      durationMs: integ.durationMs || 0,
      pasteEvents,
      biggestPaste,
    },
    aiSignal, // { aiProbability, verdict, analysis, telltaleSigns } | null
    flags,
    disclaimer: DISCLAIMER,
  };
}

module.exports = { buildReport, DISCLAIMER };
