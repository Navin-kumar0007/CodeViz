#include <iostream>
using namespace std;
int main() {
// C++ Linear Search
int arr[] = {10, 50, 30, 70, 80, 20};
int target = 70;
int foundIndex = -1;

for (int i = 0; i < 6; i++) {
    if (arr[i] == target) {
        foundIndex = i;
        cout << "Found " << target << " at index " << i << endl;
        break;
    }
}

if (foundIndex == -1) {
    cout << target << " not found" << endl;
}
return 0;
}