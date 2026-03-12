const fs = require('fs');

function calculate(s) {
    const stack = [];
    let result = 0;
    let currentNumber = 0;
    let sign = 1;

    for (let i = 0; i < s.length; i++) {
        const char = s[i];

        // Check if the character is a digit
        if (char >= '0' && char <= '9') {
            // Build the number. (char - '0') converts the string digit to an actual number
            currentNumber = currentNumber * 10 + (char - '0');
        } 
        else if (char === '+' || char === '-') {
            result += sign * currentNumber;
            currentNumber = 0;
            sign = (char === '+') ? 1 : -1;
        } 
        else if (char === '(') {
            stack.push(result);
            stack.push(sign);
            result = 0;
            sign = 1;
        } 
        else if (char === ')') {
            result += sign * currentNumber;
            currentNumber = 0;
            
            result *= stack.pop(); // Multiply by the sign before the '('
            result += stack.pop(); // Add the result from before the '('
        }
    }
    
    // Add the final number to the result
    result += sign * currentNumber;
    return result;
}

// Read input and execute
const input = fs.readFileSync(0, 'utf-8').trim();
if (input) {
    console.log(calculate(input));
}