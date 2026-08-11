// Compose a runnable, traceable Python program from a problem's editorial solution
// (a bare function like `def twoSum(...)`) and its starterCode driver (which parses
// stdin, calls the function, and prints). The editorial function and the starter stub
// often differ in name, so we reconcile them. Used by "Watch it run" to animate the
// optimal solution through the live tracer — Python gives the richest, variable-level trace,
// so we always compose in Python regardless of the language the user is coding in.

const PY_DEF = /def\s+([A-Za-z_]\w*)\s*\(/;

export function pyFnName(src) {
  const m = src?.match(PY_DEF);
  return m ? m[1] : null;
}

// Strip the stub function definition (its `def` line + indented body) from the starter,
// leaving just the driver: stdin parsing, the call, and the print.
export function pyDriver(starter, stubName) {
  const lines = String(starter).split('\n');
  const out = [];
  let skipping = false;
  const defRe = stubName ? new RegExp(`^def\\s+${stubName}\\b`) : null;
  for (const line of lines) {
    if (!skipping && defRe && defRe.test(line)) { skipping = true; continue; }
    if (skipping) {
      if (line.trim() === '' || /^\s/.test(line)) continue; // blank or indented → still inside the stub body
      skipping = false; // first column-0 non-blank line → driver resumes
    }
    out.push(line);
  }
  return out.join('\n').trim();
}

// → { language, code, input } ready to POST to /trace, or null if not composable.
export function buildRunnable(problem) {
  const sol = problem?.editorial?.solutionCode?.python;
  if (!sol) return null;
  // Prefer a visible test case's stdin; the program reads input() from it.
  const input = (problem.testCases || []).find((t) => t?.input)?.input ?? '';
  const starter = problem?.starterCode?.python;
  if (!starter) return { language: 'python', code: sol.trim(), input };
  const solName = pyFnName(sol);
  const stubName = pyFnName(starter);
  let driver = pyDriver(starter, stubName);
  if (solName && stubName && solName !== stubName) {
    driver = driver.replace(new RegExp(`\\b${stubName}\\b`, 'g'), solName);
  }
  const code = driver ? `${sol.trim()}\n\n${driver}` : sol.trim();
  return { language: 'python', code, input };
}
