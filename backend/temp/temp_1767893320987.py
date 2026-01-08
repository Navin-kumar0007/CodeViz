def main():
    # 100 elements - this will be slower
    # (virtual scrolling disabled temporarily)
    big_array = list(range(100))
    
    # Modify every 10th element
    for i in range(0, len(big_array), 10):
        big_array[i] = big_array[i] * 100
    
    return big_array

main()