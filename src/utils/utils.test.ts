import { describe, it, expect } from 'vitest';
import { isEqual } from './helpers';

describe('test helpers', () => {
  it('should return is objects equal', () => {
    expect(isEqual({ a: 1 }, { a: 1 })).toBeTruthy();
  });
});
