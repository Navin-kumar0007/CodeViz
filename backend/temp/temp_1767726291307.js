// JS Selection Sort
let arr = [29, 10, 14, 37, 13];
let n = arr.length;

for (let i = 0; i < n - 1; i++) {
    let min_idx = i;
    for (let j = i + 1; j < n; j++) {
        if (arr[j] < arr[min_idx]) {
            min_idx = j;
        }
    }
    // Swap
    let temp = arr[min_idx];
    arr[min_idx] = arr[i];
    arr[i] = temp;
}
console.log("Sorted:", arr);