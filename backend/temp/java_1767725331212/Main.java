// Java Matrix Search
int[][] matrix = {
    {1, 4, 7},
    {2, 5, 8},
    {3, 6, 9}
};
int target = 5;
String foundAt = "Not Found";

for (int r = 0; r < 3; r++) {
    for (int c = 0; c < 3; c++) {
        if (matrix[r][c] == target) {
            foundAt = "[" + r + "][" + c + "]";
            break;
        }
    }
}
System.out.println("Found at: " + foundAt);