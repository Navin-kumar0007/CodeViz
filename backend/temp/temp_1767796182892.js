// JS Linear Search
let arr = [10, 50, 30, 70, 80, 20];
let target = 30;
let index = -1;

for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
        index = i;
        console.log("Found at index:", index);
        break;
    }
}
if (index === -1) console.log("Not found");