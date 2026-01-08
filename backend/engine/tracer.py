import sys
import json
import io

# 1. Setup
trace_data = []
# Ensure we get the absolute path to match the frame filename
import os
user_script = os.path.abspath(sys.argv[1])

# Buffer to capture print() output
output_buffer = io.StringIO()
sys.stdout = output_buffer

def serialize(obj):
    """Helper to safely convert objects to JSON-friendly format"""
    try:
        if isinstance(obj, (int, float, str, bool, type(None))):
            return obj
        if isinstance(obj, (list, tuple, set)):
            return [serialize(i) for i in obj]
        if isinstance(obj, dict):
            return {str(k): serialize(v) for k, v in obj.items()}
        return str(obj)
    except:
        return str(obj)

def tracer(frame, event, arg):
    if event != 'line':
        return tracer

    # 🛡️ CHECK: Only trace the user's file
    # We use os.path.abspath to ensure we match the exact file path
    co = frame.f_code
    if os.path.abspath(co.co_filename) != user_script:
        return tracer

    # 2. Capture Output
    current_stdout = output_buffer.getvalue()
    output_buffer.truncate(0)
    output_buffer.seek(0)

    # 3. Capture Variables
    variables = {}
    local_vars = frame.f_locals.copy()
    
    for name, value in local_vars.items():
        if name.startswith('__'): continue
        if type(value).__name__ == 'module': continue
        if callable(value): continue
            
        try:
            variables[name] = serialize(value)
        except:
            variables[name] = "Error"

    # 4. Save Step
    trace_data.append({
        "line": frame.f_lineno,
        "variables": variables,
        "stdout": current_stdout
    })
    
    return tracer

# 5. Execute User Code
try:
    with open(user_script, 'r') as f:
        code_content = f.read()
    
    # 🔑 THE FIX: Compile with the ACTUAL filename
    # This ensures frame.f_code.co_filename matches user_script
    compiled_code = compile(code_content, user_script, 'exec')
    
    sys.settrace(tracer)
    exec(compiled_code, {'__name__': '__main__'})
    sys.settrace(None)
    
    # Capture any remaining output produced by the last executed line
    final_stdout = output_buffer.getvalue()
    if final_stdout:
        trace_data.append({
            "line": 0,  # Indicates completion
            "variables": {},
            "stdout": final_stdout
        })

except Exception as e:
    sys.settrace(None)
    trace_data.append({
        "line": 0,
        "variables": {},
        "stdout": f"Runtime Error: {str(e)}"
    })

# 6. Final Output
sys.stdout = sys.__stdout__
print(json.dumps(trace_data))