import sys

def tracer(frame, event, arg):
    print("EVENT:", event, frame.f_code.co_name)
    return tracer

compiled = compile("a=1\nb=2", "<string>", "exec")
def run():
    exec(compiled)

sys.settrace(tracer)
run()
sys.settrace(None)
