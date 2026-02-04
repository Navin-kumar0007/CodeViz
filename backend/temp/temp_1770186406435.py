print("Starting Visualizer...")

# 1. Initialize three 'processes' (Memory Blocks appear)
cpu_status = "IDLE"
proc_A = "Waiting"
proc_B = "Waiting"
proc_C = "Waiting"

# 2. Loop to shuffle priority
for cycle in range(1, 4):
    print(f"--- CPU Cycle {cycle} ---")
    
    # Step 1: Process A takes control
    # Watch 'proc_A' fly to the top-left corner!
    cpu_status = "Running A"
    proc_A = "ACTIVE"
    proc_B = "Paused"
    proc_C = "Paused"
    
    # Step 2: Process B takes control
    # Watch 'proc_B' push 'proc_A' aside!
    cpu_status = "Running B"
    proc_A = "Waiting"
    proc_B = "ACTIVE"
    
    # Step 3: Process C takes control
    # Watch 'proc_C' jump to the front!
    cpu_status = "Running C"
    proc_B = "Waiting"
    proc_C = "ACTIVE"

# 3. Finish
cpu_status = "SHUTDOWN"
proc_A = "Killed"
proc_B = "Killed"
proc_C = "Killed"
print("Simulation Complete.")