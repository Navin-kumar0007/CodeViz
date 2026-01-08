#!/usr/bin/env python3

# Read the original file
with open('frontend/src/components/Visualizer/Canvas.jsx', 'r') as f:
    lines = f.readlines()

# Read the new code
with open('frontend/src/components/Visualizer/tree_render_new.jsx.tmp', 'r') as f:
    new_code = f.read()

# Find the start and end of the renderTree function (lines 157-181)
start_line = 156  # 0-indexed, so line 157
end_line = 180    # 0-indexed, so line 181

# Replace those lines
new_lines = lines[:start_line] + [new_code + '\n'] + lines[end_line+1:]

# Write back
with open('frontend/src/components/Visualizer/Canvas.jsx', 'w') as f:
    f.writelines(new_lines)

print(f'Successfully replaced lines {start_line+1} to {end_line+1}')
