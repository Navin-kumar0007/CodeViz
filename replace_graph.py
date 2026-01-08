#!/usr/bin/env python3

# Read the original file
with open('frontend/src/components/Visualizer/Canvas.jsx', 'r') as f:
    lines = f.readlines()

# Read the new code
with open('frontend/src/components/Visualizer/graph_render_new.jsx.tmp', 'r') as f:
    new_code = f.read()

# Find the start and end of the renderGraph function (lines 337-369)
start_line = 336  # 0-indexed
end_line = 368    # 0-indexed

# Replace those lines
new_lines = lines[:start_line] + [new_code + '\n'] + lines[end_line+1:]

# Write back
with open('frontend/src/components/Visualizer/Canvas.jsx', 'w') as f:
    f.writelines(new_lines)

print(f'Successfully replaced graph rendering lines {start_line+1} to {end_line+1}')
