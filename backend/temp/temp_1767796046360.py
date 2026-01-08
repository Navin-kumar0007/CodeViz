import time

def main():  # 👈 WRAP EVERYTHING IN HERE
    print("Starting Visualizer...")

    # 1. Initialize
    cpu_status = "IDLE"
    proc_A = "Waiting"
    proc_B = "Waiting"
    proc_C = "Waiting"

    # 2. Loop
    for cycle in range(1, 4):
        print(f"--- CPU Cycle {cycle} ---")
        
        # Step 1
        cpu_status = "Running A"
        proc_A = "ACTIVE"
        # ... rest of your code ...

# Run the function
if __name__ == "__main__":
    main()