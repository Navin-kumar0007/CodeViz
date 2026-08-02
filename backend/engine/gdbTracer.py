"""
CodeViz GDB Tracer (C / C++)
============================
Runs a compiled binary under GDB and emits one JSON step per source line,
matching the exact shape produced by the Python/JS tracers:

    {"line", "variables", "call_stack", "stdout", "hits"}

Design notes:
- Inferior (user program) stdout is redirected to a file so that our JSON
  trace stays clean on GDB's stdout and can be streamed line-by-line.
- Locals are converted to real JSON values (numbers / arrays / strings) so the
  frontend Canvas can detect arrays, not opaque "{1, 2, 3}" strings.
- We step INTO user functions (recursion, helpers) but skip std:: internals.

Invoked via:  gdb -q -batch -x gdbTracer.py --args ./out
Requires env: CODEVIZ_SRC = basename of the user source file (e.g. script.cpp)
"""

import gdb
import json
import os
import sys

USER_SRC = os.environ.get("CODEVIZ_SRC", "")
PROG_OUT = "/home/runner/code/.prog_out"
MAX_STEPS = 4000  # safety cap against runaway loops / deep recursion

line_hits = {}


def emit(step):
    sys.stdout.write(json.dumps(step) + "\n")
    sys.stdout.flush()


def is_user_frame(frame):
    try:
        sal = frame.find_sal()
        if not sal or not sal.symtab:
            return False
        return os.path.basename(sal.symtab.filename) == USER_SRC
    except Exception:
        return False


def to_py(value, depth=0):
    """Convert a gdb.Value into a JSON-serialisable Python object."""
    if depth > 4:
        return str(value)
    try:
        t = value.type.strip_typedefs()
        code = t.code

        if code == gdb.TYPE_CODE_INT:
            return int(value)
        if code == gdb.TYPE_CODE_BOOL:
            return bool(int(value))
        if code == gdb.TYPE_CODE_FLT:
            return float(value)
        if code == gdb.TYPE_CODE_CHAR:
            iv = int(value)
            return iv  # keep numeric; frontend can render

        # C-style array  ->  JSON array
        if code == gdb.TYPE_CODE_ARRAY:
            try:
                low, high = t.range()
                # Cap huge arrays for safety
                high = min(high, low + 200)
                return [to_py(value[i], depth + 1) for i in range(low, high + 1)]
            except Exception:
                return str(value)

        # Structs: special-case common STL containers
        if code == gdb.TYPE_CODE_STRUCT:
            tag = str(t.tag or "")
            # std::string
            if "basic_string" in tag or tag.endswith("::string"):
                s = str(value)
                # gdb prints strings with surrounding quotes
                if len(s) >= 2 and s[0] == '"' and s[-1] == '"':
                    return s[1:-1]
                return s
            # std::vector  (libstdc++ layout)
            if "vector" in tag:
                try:
                    impl = value["_M_impl"]
                    start = impl["_M_start"]
                    finish = impl["_M_finish"]
                    n = int(finish - start)
                    n = min(n, 200)
                    return [to_py((start + i).dereference(), depth + 1) for i in range(n)]
                except Exception:
                    return str(value)
            # Fallback: shallow field map
            try:
                return {f.name: to_py(value[f.name], depth + 1)
                        for f in t.fields() if f.name}
            except Exception:
                return str(value)

        # Pointers: char* -> string, else address string
        if code == gdb.TYPE_CODE_PTR:
            target = t.target().strip_typedefs()
            if target.code == gdb.TYPE_CODE_INT and target.sizeof == 1:
                try:
                    return value.string()
                except Exception:
                    return str(value)
            return str(value)

        return str(value)
    except Exception:
        try:
            return str(value)
        except Exception:
            return "<unreadable>"


def frame_variables(frame):
    """Collect visible locals + arguments for a frame."""
    result = {}
    try:
        block = frame.block()
    except Exception:
        return result

    # Walk from the innermost block up to (and including) the function block
    seen = set()
    while block is not None:
        try:
            for sym in block:
                if not (sym.is_variable or sym.is_argument):
                    continue
                name = sym.name
                if name in seen or name.startswith("__"):
                    continue
                seen.add(name)
                try:
                    result[name] = to_py(sym.value(frame))
                except Exception:
                    result[name] = "<unreadable>"
        except Exception:
            pass
        if block.function is not None:
            break
        block = block.superblock
    return result


def build_call_stack(frame):
    stack = []
    f = frame
    while f is not None:
        if is_user_frame(f):
            try:
                sal = f.find_sal()
                stack.append({
                    "function": f.name() or "??",
                    "line": sal.line if sal else 0,
                    "variables": frame_variables(f),
                })
            except Exception:
                pass
        f = f.older()
    stack.reverse()  # Global/main at bottom, innermost on top
    return stack


def flush_program_output():
    try:
        if os.path.exists(PROG_OUT):
            with open(PROG_OUT, "r", errors="replace") as fh:
                data = fh.read()
            if data:
                emit({"line": 0, "variables": {}, "call_stack": [], "stdout": data})
    except Exception:
        pass


def main():
    gdb.execute("set pagination off")
    gdb.execute("set print pretty off")
    gdb.execute("set print frame-arguments none")
    gdb.execute("set confirm off")
    # Skip stepping into standard library internals
    for pat in ("^std::", "^__gnu_cxx::", "^__"):
        try:
            gdb.execute("skip -rfunction " + pat)
        except Exception:
            pass

    try:
        gdb.execute("break main")
    except Exception:
        pass

    # Redirect the user program's own stdout/stderr to a file so our JSON
    # trace remains the sole thing on GDB's stdout.
    try:
        gdb.execute("run > {0} 2>&1".format(PROG_OUT))
    except gdb.error:
        # Program failed before/at main
        flush_program_output()
        return

    steps = 0
    while steps < MAX_STEPS:
        try:
            frame = gdb.selected_frame()
        except gdb.error:
            break  # program has exited

        if is_user_frame(frame):
            try:
                sal = frame.find_sal()
                line = sal.line
                line_hits[line] = line_hits.get(line, 0) + 1
                stack = build_call_stack(frame)
                variables = stack[-1]["variables"] if stack else {}
                emit({
                    "line": line,
                    "variables": variables,
                    "call_stack": stack,
                    "stdout": "",
                    "hits": line_hits[line],
                })
            except Exception:
                pass

        steps += 1
        try:
            gdb.execute("step")
        except gdb.error:
            break  # program finished during step

    flush_program_output()


try:
    main()
except Exception as e:
    emit({"line": 0, "variables": {}, "call_stack": [],
          "stdout": "Tracer error: {0}".format(str(e)), "error": True})
finally:
    try:
        gdb.execute("quit")
    except Exception:
        pass
