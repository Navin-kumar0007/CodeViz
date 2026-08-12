// Compose a runnable reference program from a problem's editorial solution (a bare
// function) + its starterCode driver (stdin parse → call → print), reconciling the
// function name. Running this on an input yields the CORRECT expected output — the
// ground truth for test cases. (Backend port of the frontend solutionRunner.)

const PY_DEF = /def\s+([A-Za-z_]\w*)\s*\(/;

function pyFnName(src) {
  const m = String(src || '').match(PY_DEF);
  return m ? m[1] : null;
}

// Strip the stub `def name(...)` + its indented body from the starter, leaving the driver.
function pyDriver(starter, stubName) {
  const lines = String(starter || '').split('\n');
  const out = [];
  let skipping = false;
  const defRe = stubName ? new RegExp(`^def\\s+${stubName}\\b`) : null;
  for (const line of lines) {
    if (!skipping && defRe && defRe.test(line)) { skipping = true; continue; }
    if (skipping) {
      if (line.trim() === '' || /^\s/.test(line)) continue; // blank or indented → still in stub
      skipping = false;
    }
    out.push(line);
  }
  return out.join('\n').trim();
}

// → { language:'python', code } runnable reference, or null if not composable.
function buildReference(problem) {
  const sol = problem?.editorial?.solutionCode?.python;
  if (!sol) return null;
  const starter = problem?.starterCode?.python;
  if (!starter) return null; // need the stdin driver to feed test-case input
  const solName = pyFnName(sol);
  const stubName = pyFnName(starter);
  let driver = pyDriver(starter, stubName);
  if (!driver) return null;
  if (solName && stubName && solName !== stubName) {
    driver = driver.replace(new RegExp(`\\b${stubName}\\b`, 'g'), solName);
  }
  return { language: 'python', code: `${sol.trim()}\n\n${driver}` };
}

module.exports = { buildReference, pyFnName, pyDriver };
