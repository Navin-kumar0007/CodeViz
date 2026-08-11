import { describe, it, expect } from 'vitest';
import { buildRunnable, pyFnName, pyDriver } from './solutionRunner';

// Mirrors the real two-sum shape: editorial is a bare function (camelCase name),
// starter has the stdin driver (snake_case stub), only visible test cases reach the client.
const twoSum = {
  slug: 'two-sum',
  starterCode: {
    python: 'def two_sum(nums, target):\n    # Write your solution here\n    pass\n\n# Read input\nnums = list(map(int, input().split()))\ntarget = int(input())\nresult = two_sum(nums, target)\nprint(*result)',
  },
  editorial: {
    solutionCode: {
      python: 'def twoSum(nums, target):\n  num_map = {}\n  for i, num in enumerate(nums):\n    complement = target - num\n    if complement in num_map:\n      return [num_map[complement], i]\n    num_map[num] = i\n  return []',
    },
  },
  testCases: [{ input: '2 7 11 15\n9', isHidden: false }],
};

describe('pyFnName', () => {
  it('extracts the function name from a def', () => {
    expect(pyFnName('def two_sum(nums, target):\n  pass')).toBe('two_sum');
    expect(pyFnName('def isValid(s: str) -> bool:\n  return True')).toBe('isValid');
  });
  it('returns null when there is no def', () => {
    expect(pyFnName('x = 1')).toBeNull();
    expect(pyFnName(undefined)).toBeNull();
  });
});

describe('pyDriver', () => {
  it('strips the stub function, keeping only the driver', () => {
    const d = pyDriver(twoSum.starterCode.python, 'two_sum');
    expect(d).not.toMatch(/# Write your solution here/);
    expect(d).toMatch(/nums = list\(map\(int, input\(\)\.split\(\)\)\)/);
    expect(d).toMatch(/result = two_sum\(nums, target\)/);
  });
});

describe('buildRunnable', () => {
  it('composes a runnable program with the reconciled function name + stdin', () => {
    const r = buildRunnable(twoSum);
    expect(r.language).toBe('python');
    expect(r.input).toBe('2 7 11 15\n9');
    // editorial body present
    expect(r.code).toMatch(/num_map\[num\] = i/);
    // the driver now calls the editorial's name, not the stub's
    expect(r.code).toMatch(/result = twoSum\(nums, target\)/);
    expect(r.code).not.toMatch(/two_sum\(/);
    // the stub body is gone
    expect(r.code).not.toMatch(/# Write your solution here/);
  });

  it('keeps a matching name unchanged (no false rename)', () => {
    const p = {
      starterCode: { python: 'def isValid(s):\n    pass\n\ns = input()\nprint(isValid(s))' },
      editorial: { solutionCode: { python: 'def isValid(s):\n    return len(s) % 2 == 0' } },
      testCases: [{ input: '()', isHidden: false }],
    };
    const r = buildRunnable(p);
    expect(r.code).toMatch(/print\(isValid\(s\)\)/);
    expect(r.input).toBe('()');
  });

  it('returns null when there is no python editorial solution', () => {
    expect(buildRunnable({ editorial: { solutionCode: { java: 'class X {}' } } })).toBeNull();
    expect(buildRunnable({})).toBeNull();
  });

  it('falls back to the bare solution when no starter driver exists', () => {
    const r = buildRunnable({ editorial: { solutionCode: { python: 'def f():\n  return 1' } }, testCases: [] });
    expect(r.code).toBe('def f():\n  return 1');
    expect(r.input).toBe('');
  });

  it('ignores hidden test cases without input and picks the first with input', () => {
    const r = buildRunnable({
      ...twoSum,
      testCases: [{ isHidden: true }, { input: '1 2 3\n5', isHidden: false }],
    });
    expect(r.input).toBe('1 2 3\n5');
  });
});
