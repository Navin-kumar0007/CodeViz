import { describe, it, expect } from 'vitest';
import API_BASE from './api';

describe('API_BASE config', () => {
  it('should export a string-like API base or named string', () => {
    expect(typeof API_BASE.toString()).toBe('string');
  });

  it('should contain a valid URL format', () => {
    expect(API_BASE.toString()).toMatch(/^https?:\/\//);
  });

  it('should default to localhost:5001', () => {
    // In test environment without VITE_API_URL set, it should fall back to localhost
    expect(API_BASE.toString()).toContain('localhost:5001');
  });
});
