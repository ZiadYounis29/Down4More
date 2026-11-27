import { sanitizeName } from './sanitize-name';

describe('sanitizeName', () => {
  it('returns empty string for empty input', () => {
    expect(sanitizeName('')).toBe('');
  });

  it('returns empty string when only illegal characters are present', () => {
    expect(sanitizeName('\\/:*?"<>|')).toBe('');
  });

  it('strips illegal characters, collapses spaces, and trims', () => {
    expect(sanitizeName('  My:   Cool / Video?   *2026*  ')).toBe('My Cool Video 2026');
  });

  it('truncates to 150 characters', () => {
    const input = 'a'.repeat(200);
    const result = sanitizeName(input);
    expect(result.length).toBe(150);
    expect(result).toBe('a'.repeat(150));
  });
});
