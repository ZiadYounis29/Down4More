import { DurationPipe } from './duration.pipe';

describe('DurationPipe', () => {
  const pipe = new DurationPipe();

  it('transforms null to "—"', () => {
    expect(pipe.transform(null)).toBe('—');
  });

  it('transforms 768 to "12:48"', () => {
    expect(pipe.transform(768)).toBe('12:48');
  });

  it('transforms 3725 to "1:02:05"', () => {
    expect(pipe.transform(3725)).toBe('1:02:05');
  });
});
