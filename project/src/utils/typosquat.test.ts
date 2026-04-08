import { describe, it, expect } from 'vitest';
import { detectTyposquatDomain, levenshtein } from './typosquat';

describe('typosquat', () => {
  it('detects gmil vs gmail', () => {
    const h = detectTyposquatDomain('gmil.com');
    expect(h?.target).toBe('gmail.com');
  });

  it('does not flag unrelated domains', () => {
    expect(detectTyposquatDomain('yahoo.co.jp')).toBeNull();
    expect(detectTyposquatDomain('company-internal.io')).toBeNull();
  });

  it('levenshtein distance', () => {
    expect(levenshtein('a', 'b')).toBe(1);
    expect(levenshtein('gmail.com', 'gmil.com')).toBe(1);
  });
});
