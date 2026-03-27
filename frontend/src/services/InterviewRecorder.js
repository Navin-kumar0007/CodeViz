/**
 * 🎥 InterviewRecorder — Proof-of-Work Event Recorder
 * 
 * Captures coding events during interviews to generate an "Authenticity Score"
 * proving the candidate actually solved the problem (vs. copy-pasting).
 * 
 * Events captured:
 * - Keystrokes (character-level, with timestamps)
 * - Code executions (run events)
 * - Tab switches (problem navigation)
 * - Paste events (large paste detection)
 * - Solution submissions
 * 
 * Authenticity Scoring:
 * - Organic typing patterns = high score
 * - Large paste-and-submit = low score
 * - Incremental development = high score
 * - Sudden complete solution = low score
 */

class InterviewRecorder {
  constructor() {
    this.events = [];
    this.startTime = null;
    this.isRecording = false;
    this.keystrokeCount = 0;
    this.pasteCount = 0;
    this.pasteCharCount = 0;
    this.runCount = 0;
    this.tabSwitchCount = 0;
    this.codeSnapshots = []; // periodic code snapshots for diff analysis
    this.lastSnapshotTime = 0;
  }

  // ═══ Start Recording ═══
  start() {
    this.events = [];
    this.startTime = Date.now();
    this.isRecording = true;
    this.keystrokeCount = 0;
    this.pasteCount = 0;
    this.pasteCharCount = 0;
    this.runCount = 0;
    this.tabSwitchCount = 0;
    this.codeSnapshots = [];
    this.lastSnapshotTime = Date.now();

    this._addEvent('session_start', {});
  }

  // ═══ Stop Recording ═══
  stop() {
    if (!this.isRecording) return null;
    this._addEvent('session_end', {});
    this.isRecording = false;

    return this.generateReport();
  }

  // ═══ Record Events ═══
  recordKeystroke(key, codeLength) {
    if (!this.isRecording) return;
    this.keystrokeCount++;

    // Don't record every single keystroke (performance) — batch them
    // But DO record the count and periodic snapshots
    if (this.keystrokeCount % 20 === 0) {
      this._addEvent('keystroke_batch', { count: 20, codeLength });
    }
  }

  recordPaste(pastedText, codeLength) {
    if (!this.isRecording) return;
    this.pasteCount++;
    this.pasteCharCount += pastedText.length;

    this._addEvent('paste', {
      charCount: pastedText.length,
      isLargePaste: pastedText.length > 50,
      codeLength
    });
  }

  recordCodeRun(language, codeLength, success) {
    if (!this.isRecording) return;
    this.runCount++;

    this._addEvent('code_run', { language, codeLength, success });
  }

  recordSubmission(problemId, passed, total) {
    if (!this.isRecording) return;
    this._addEvent('submission', { problemId, testsPassed: passed, testsTotal: total });
  }

  recordTabSwitch(fromProblem, toProblem) {
    if (!this.isRecording) return;
    this.tabSwitchCount++;
    this._addEvent('tab_switch', { from: fromProblem, to: toProblem });
  }

  recordCodeSnapshot(code, problemId) {
    if (!this.isRecording) return;
    const now = Date.now();
    // Snapshot every 30 seconds max
    if (now - this.lastSnapshotTime > 30000) {
      this.codeSnapshots.push({
        timestamp: now - this.startTime,
        problemId,
        codeLength: code.length,
        lineCount: code.split('\n').length
      });
      this.lastSnapshotTime = now;
    }
  }

  // ═══ Generate Authenticity Report ═══
  generateReport() {
    const duration = Date.now() - this.startTime;
    const totalEvents = this.events.length;

    // --- Scoring Algorithm ---
    let score = 100;
    const flags = [];

    // 1. Paste ratio analysis (high paste = suspicious)
    const totalCharsTyped = this.keystrokeCount;
    const pasteRatio = totalCharsTyped > 0 
      ? this.pasteCharCount / (totalCharsTyped + this.pasteCharCount) 
      : 0;
    
    if (pasteRatio > 0.7) {
      score -= 40;
      flags.push('High paste-to-type ratio (' + Math.round(pasteRatio * 100) + '%)');
    } else if (pasteRatio > 0.4) {
      score -= 15;
      flags.push('Moderate paste usage (' + Math.round(pasteRatio * 100) + '%)');
    }

    // 2. Large paste detection (pasting > 200 chars at once)
    const largePastes = this.events.filter(e => e.type === 'paste' && e.data.isLargePaste);
    if (largePastes.length > 3) {
      score -= 20;
      flags.push(`${largePastes.length} large paste events detected`);
    }

    // 3. Incremental development (runs before submission = good)
    if (this.runCount >= 3) {
      score = Math.min(100, score + 10); // bonus for iterative dev
    } else if (this.runCount === 0) {
      score -= 15;
      flags.push('No code executions before submission');
    }

    // 4. Time analysis (too fast = suspicious)
    const minutesTaken = duration / 60000;
    if (minutesTaken < 2 && totalEvents > 5) {
      score -= 20;
      flags.push('Suspiciously fast completion (' + Math.round(minutesTaken) + ' min)');
    }

    // 5. Code evolution (snapshots should show gradual growth)
    if (this.codeSnapshots.length >= 3) {
      const lengths = this.codeSnapshots.map(s => s.codeLength);
      const jumps = lengths.slice(1).filter((len, i) => len - lengths[i] > 200);
      if (jumps.length > 2) {
        score -= 10;
        flags.push('Large code jumps detected between snapshots');
      }
    }

    // Clamp score
    score = Math.max(0, Math.min(100, score));

    return {
      authenticityScore: score,
      flags,
      metrics: {
        durationMs: duration,
        durationMinutes: Math.round(minutesTaken * 10) / 10,
        totalEvents,
        keystrokeCount: this.keystrokeCount,
        pasteCount: this.pasteCount,
        pasteCharCount: this.pasteCharCount,
        pasteRatio: Math.round(pasteRatio * 100),
        runCount: this.runCount,
        tabSwitchCount: this.tabSwitchCount,
        codeSnapshots: this.codeSnapshots.length
      },
      events: this.events,
      grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D'
    };
  }

  // ═══ Internal ═══
  _addEvent(type, data) {
    this.events.push({
      type,
      timestamp: Date.now() - this.startTime,
      data
    });
  }
}

// Singleton instance
const interviewRecorder = new InterviewRecorder();
export default interviewRecorder;
