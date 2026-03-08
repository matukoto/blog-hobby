import { describe, expect, it } from 'vitest';

import { normalizeSlug } from './slug';

describe('normalizeSlug', () => {
  it('normalizes basic slug input', () => {
    expect(normalizeSlug('Hello World')).toBe('hello-world');
  });

  it('removes disallowed characters', () => {
    expect(normalizeSlug('Hello___World')).toBe('hello-world');
  });

  it('returns null when slug becomes empty', () => {
    expect(normalizeSlug('---')).toBeNull();
  });
});
