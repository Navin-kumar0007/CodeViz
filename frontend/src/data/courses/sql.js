/**
 * SQL Basics - Learning Path
 * Query relational databases with confidence.
 */

export const SQL_PATH = {
    id: 'sql',
    title: 'SQL Basics',
    icon: '🗃️',
    category: 'Databases',
    description: 'Read and analyze data in relational databases with SELECT, JOINs, and aggregation.',
    prerequisites: [],
    lessons: [
        {
            id: 'select-filter',
            title: 'SELECT & Filtering',
            duration: '7 min',
            explanation: [
                { type: 'text', content: '**SQL** queries relational data stored in tables (rows and columns). The **SELECT** statement reads data.' },
                { type: 'text', content: 'Choose columns after SELECT, the table after **FROM**, and filter rows with **WHERE**. **ORDER BY** sorts; **LIMIT** caps the number of rows.' },
                { type: 'tip', content: 'Use specific column names instead of SELECT * in real queries — it is clearer and faster.' },
            ],
            keyConcepts: [
                'SELECT chooses columns; FROM names the table',
                'WHERE filters rows by a condition',
                'ORDER BY sorts results (ASC or DESC)',
                'LIMIT restricts how many rows return',
            ],
            code: {
                sql: `-- Active users, newest first, top 10
SELECT id, name, created_at
FROM users
WHERE is_active = TRUE
ORDER BY created_at DESC
LIMIT 10;`,
            },
            quiz: [
                {
                    question: 'Which clause filters which rows are returned?',
                    options: ['SELECT', 'WHERE', 'ORDER BY', 'LIMIT'],
                    correct: 1,
                    explanation: 'WHERE keeps only rows that match its condition.',
                },
                {
                    question: 'What does ORDER BY created_at DESC do?',
                    options: ['Deletes rows', 'Sorts by created_at, newest first', 'Filters by date', 'Counts rows'],
                    correct: 1,
                    explanation: 'DESC sorts in descending order, so the most recent dates come first.',
                },
            ],
        },
        {
            id: 'joins',
            title: 'Joining Tables',
            duration: '8 min',
            explanation: [
                { type: 'text', content: 'Relational data is split across tables to avoid duplication. A **JOIN** recombines them on a shared key.' },
                { type: 'text', content: 'An **INNER JOIN** returns only rows with a match in both tables. A **LEFT JOIN** returns all rows from the left table, filling NULLs where there is no match.' },
                { type: 'warning', content: 'Forgetting the ON condition produces a cross join — every row paired with every other. Rarely what you want.' },
            ],
            keyConcepts: [
                'JOIN combines rows from two tables on a key',
                'INNER JOIN keeps only matching rows',
                'LEFT JOIN keeps all left rows, NULL where unmatched',
                'The ON clause defines the matching condition',
            ],
            code: {
                sql: `-- Each order with its customer's name
SELECT orders.id, users.name, orders.total
FROM orders
INNER JOIN users
  ON orders.user_id = users.id
ORDER BY orders.total DESC;`,
            },
            quiz: [
                {
                    question: 'What does an INNER JOIN return?',
                    options: ['All rows from both tables', 'Only rows with a match in both tables', 'Only left-table rows', 'A single row'],
                    correct: 1,
                    explanation: 'INNER JOIN keeps only rows that have a match on the join key in both tables.',
                },
                {
                    question: 'What defines how two tables are matched in a JOIN?',
                    options: ['The WHERE clause', 'The ON clause', 'The LIMIT clause', 'The SELECT list'],
                    correct: 1,
                    explanation: 'ON specifies the columns used to match rows between the tables.',
                },
            ],
        },
        {
            id: 'aggregation',
            title: 'Aggregation & GROUP BY',
            duration: '8 min',
            explanation: [
                { type: 'text', content: 'Aggregate functions summarize many rows into one value: **COUNT**, **SUM**, **AVG**, **MIN**, **MAX**.' },
                { type: 'text', content: '**GROUP BY** splits rows into groups and applies the aggregate per group — e.g. total sales *per customer*.' },
                { type: 'text', content: 'Filter groups with **HAVING** (WHERE filters rows *before* grouping; HAVING filters *after*).' },
                { type: 'tip', content: 'Every non-aggregated column in SELECT must appear in GROUP BY.' },
            ],
            keyConcepts: [
                'Aggregates (COUNT, SUM, AVG…) collapse rows into a summary',
                'GROUP BY computes an aggregate per group',
                'HAVING filters groups after aggregation',
                'WHERE filters rows before grouping',
            ],
            code: {
                sql: `-- Customers who spent more than 1000, by total spend
SELECT user_id, SUM(total) AS spent, COUNT(*) AS orders
FROM orders
GROUP BY user_id
HAVING SUM(total) > 1000
ORDER BY spent DESC;`,
            },
            quiz: [
                {
                    question: 'Which clause filters groups after aggregation?',
                    options: ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'],
                    correct: 1,
                    explanation: 'HAVING filters the grouped results; WHERE filters rows before grouping.',
                },
                {
                    question: 'What does GROUP BY user_id with SUM(total) compute?',
                    options: ['The total across all users', 'The total spend per user', 'The number of users', 'Nothing'],
                    correct: 1,
                    explanation: 'GROUP BY splits rows by user_id and SUM(total) totals each group separately.',
                },
            ],
        },
    ],
};
