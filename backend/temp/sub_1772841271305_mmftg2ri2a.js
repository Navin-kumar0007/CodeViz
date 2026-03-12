const fs = require('fs');

function coinChange(coins, amount) {
    // Create an array of size (amount + 1) and fill it with Infinity
    const dp = new Array(amount + 1).fill(Infinity);
    
    // Base case: 0 coins needed to make an amount of 0
    dp[0] = 0;
    
    // Iterate through each coin denomination
    for (let coin of coins) {
        // Update the dp array for all amounts from the coin's value up to the target
        for (let i = coin; i <= amount; i++) {
            dp[i] = Math.min(dp[i], dp[i - coin] + 1);
        }
    }
    
    // If the target amount is still Infinity, it means it's impossible
    return dp[amount] === Infinity ? -1 : dp[amount];
}

// Read input from the console (synchronous read from standard input)
const input = fs.readFileSync(0, 'utf-8').trim().split('\n');

if (input.length >= 2) {
    // Parse the first line as an array of numbers
    const coins = input[0].trim().split(/\s+/).map(Number);
    // Parse the second line as the target amount integer
    const amount = parseInt(input[1].trim(), 10);
    
    console.log(coinChange(coins, amount));
}