/**
 * Software Testing - Learning Path
 * Write tests that make your code trustworthy.
 */

export const SOFTWARE_TESTING_PATH = {
    id: 'software-testing',
    title: 'Software Testing',
    icon: '✅',
    category: 'Software Quality',
    description: 'Learn to write unit, integration, and end-to-end tests — and what makes a good test case.',
    prerequisites: [],
    lessons: [
        {
            id: 'testing-fundamentals',
            title: 'Why & What to Test',
            duration: '7 min',
            explanation: [
                { type: 'text', content: 'Tests are code that checks your code. They catch regressions, document behavior, and let you refactor with confidence.' },
                { type: 'text', content: 'The **testing pyramid**: many fast **unit** tests (single functions), fewer **integration** tests (modules together), and a few **end-to-end** tests (whole app).' },
                { type: 'text', content: 'A good test follows **Arrange–Act–Assert**: set up inputs, run the code, assert the expected result.' },
                { type: 'tip', content: 'Test behavior, not implementation. Good tests survive refactors as long as behavior is unchanged.' },
            ],
            keyConcepts: [
                'Tests catch regressions and document behavior',
                'Pyramid: many unit, fewer integration, few E2E',
                'Arrange–Act–Assert structures a test',
                'Test behavior, not implementation details',
            ],
            code: {
                javascript: `// Jest unit test: Arrange - Act - Assert
function add(a, b) { return a + b; }

test('adds two numbers', () => {
  const a = 2, b = 3;        // Arrange
  const result = add(a, b);  // Act
  expect(result).toBe(5);    // Assert
});`,
                python: `# pytest unit test
def add(a, b):
    return a + b

def test_add():
    result = add(2, 3)      # Arrange + Act
    assert result == 5      # Assert`,
            },
            quiz: [
                {
                    question: 'What sits at the wide base of the testing pyramid?',
                    options: ['End-to-end tests', 'Unit tests', 'Manual tests', 'Load tests'],
                    correct: 1,
                    explanation: 'Unit tests are numerous and fast, forming the base of the pyramid.',
                },
                {
                    question: 'What does the Arrange–Act–Assert pattern describe?',
                    options: ['A deployment process', 'The structure of a good test', 'A database schema', 'A design pattern for UIs'],
                    correct: 1,
                    explanation: 'AAA structures a test: set up inputs, run the code, then assert the outcome.',
                },
            ],
        },
        {
            id: 'writing-good-cases',
            title: 'Writing Good Test Cases',
            duration: '8 min',
            explanation: [
                { type: 'text', content: 'Cover the **happy path**, then **edge cases** (empty input, zero, negatives, very large values) and **error cases** (invalid input should fail predictably).' },
                { type: 'text', content: 'Each test should check **one thing** and be **independent** — not rely on other tests or shared mutable state.' },
                { type: 'text', content: 'Name tests by the behavior they verify: `returns 0 for an empty list`, not `test1`.' },
                { type: 'warning', content: 'Flaky tests (that pass/fail randomly) erode trust. Remove hidden dependencies on time, order, or network.' },
            ],
            keyConcepts: [
                'Cover happy path, edge cases, and errors',
                'One assertion focus per test; keep tests independent',
                'Name tests by the behavior verified',
                'Avoid flaky tests — no hidden shared state',
            ],
            code: {
                javascript: `function max(arr) {
  if (arr.length === 0) throw new Error('empty');
  return Math.max(...arr);
}

test('returns the largest number', () => {
  expect(max([3, 9, 2])).toBe(9);
});
test('handles negatives', () => {
  expect(max([-3, -1, -7])).toBe(-1);
});
test('throws on empty input', () => {
  expect(() => max([])).toThrow('empty');
});`,
                python: `def max_of(arr):
    if not arr:
        raise ValueError("empty")
    return max(arr)

def test_largest():
    assert max_of([3, 9, 2]) == 9

def test_negatives():
    assert max_of([-3, -1, -7]) == -1

def test_empty_raises():
    import pytest
    with pytest.raises(ValueError):
        max_of([])`,
            },
            quiz: [
                {
                    question: 'Besides the happy path, what should tests cover?',
                    options: ['Only the happy path', 'Edge cases and error cases', 'Just performance', 'Nothing else'],
                    correct: 1,
                    explanation: 'Robust tests cover edge cases (empty, negatives, limits) and error handling too.',
                },
                {
                    question: 'Why keep tests independent of each other?',
                    options: ['To run slower', 'So order and shared state do not cause flaky failures', 'To use more memory', 'It is not important'],
                    correct: 1,
                    explanation: 'Independent tests avoid flakiness from shared state or execution order.',
                },
            ],
        },
        {
            id: 'mocking-coverage',
            title: 'Mocking, Integration & Coverage',
            duration: '8 min',
            explanation: [
                { type: 'text', content: 'A **mock** replaces a real dependency (network, database, clock) with a controllable fake, so unit tests stay fast and deterministic.' },
                { type: 'text', content: '**Integration tests** exercise real modules together (e.g. an API route hitting a test database) to catch wiring bugs mocks would hide.' },
                { type: 'text', content: '**Code coverage** measures which lines your tests execute. It is a useful signal — but 100% coverage does not guarantee correctness.' },
                { type: 'tip', content: 'Mock at the boundaries (external services), not your own core logic — over-mocking makes tests meaningless.' },
            ],
            keyConcepts: [
                'Mocks replace slow/external dependencies',
                'Integration tests catch wiring bugs mocks hide',
                'Coverage shows executed lines, not correctness',
                'Mock at boundaries, not your core logic',
            ],
            code: {
                javascript: `// Mock an external API call (Jest)
jest.mock('./paymentApi');
import { charge } from './paymentApi';
import { checkout } from './checkout';

test('completes checkout when charge succeeds', async () => {
  charge.mockResolvedValue({ ok: true }); // fake the dependency
  const result = await checkout({ amount: 100 });
  expect(result.status).toBe('paid');
  expect(charge).toHaveBeenCalledWith(100);
});`,
            },
            quiz: [
                {
                    question: 'Why use a mock in a unit test?',
                    options: ['To test the real database', 'To replace a slow/external dependency with a controllable fake', 'To increase coverage automatically', 'To deploy code'],
                    correct: 1,
                    explanation: 'Mocks stand in for external dependencies so unit tests stay fast and deterministic.',
                },
                {
                    question: 'Does 100% code coverage guarantee correct code?',
                    options: ['Yes, always', 'No — it shows lines ran, not that behavior is correct', 'Only in Python', 'Coverage is meaningless'],
                    correct: 1,
                    explanation: 'Coverage shows which lines executed, but tests can still miss wrong behavior.',
                },
            ],
        },
    ],
};
