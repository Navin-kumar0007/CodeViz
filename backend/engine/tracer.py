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

    # 3. Capture Stack Frames & Variables
    call_stack = []
    curr_frame = frame
    
    while curr_frame is not None:
        # Only include frames from the user's script
        if os.path.abspath(curr_frame.f_code.co_filename) == user_script:
            frame_vars = {}
            for name, value in curr_frame.f_locals.items():
                if name.startswith('__'): continue
                if type(value).__name__ == 'module': continue
                if callable(value): continue
                try:
                    frame_vars[name] = serialize(value)
                except:
                    frame_vars[name] = "Error"
            
            func_name = curr_frame.f_code.co_name
            if func_name == '<module>':
                func_name = 'Global'
                
            call_stack.append({
                "function": func_name,
                "line": curr_frame.f_lineno,
                "variables": frame_vars
            })
        curr_frame = curr_frame.f_back

    # Reverse to have Global/Main at the bottom, newest frame at the top
    call_stack.reverse()
    
    # For backward compatibility with existing UI
    variables = call_stack[-1]["variables"] if call_stack else {}

    # 4. Stream Step
    step = {
        "line": frame.f_lineno,
        "variables": variables,
        "call_stack": call_stack,
        "stdout": current_stdout
    }
    
    sys.__stdout__.write(json.dumps(step) + '\n')
    sys.__stdout__.flush()
    
    return tracer

# 5. Execute User Code
try:
    with open(user_script, 'r') as f:
        code_content = f.read()
    
    # Compile with the ACTUAL filename
    compiled_code = compile(code_content, user_script, 'exec')
    
    sys.settrace(tracer)
    exec(compiled_code, {'__name__': '__main__'})
    sys.settrace(None)
    
    # Capture any remaining output
    final_stdout = output_buffer.getvalue()
    if final_stdout:
        final_step = {
            "line": 0,
            "variables": {},
            "call_stack": [],
            "stdout": final_stdout
        }
        sys.__stdout__.write(json.dumps(final_step) + '\n')
        sys.__stdout__.flush()

except Exception as e:
    sys.settrace(None)
    error_step = {
        "line": 0,
        "variables": {},
        "call_stack": [],
        "stdout": f"Runtime Error: {str(e)}",
        "error": True
    }
    sys.__stdout__.write(json.dumps(error_step) + '\n')
    sys.__stdout__.flush()

# 6. Cleanup
sys.stdout = sys.__stdout__