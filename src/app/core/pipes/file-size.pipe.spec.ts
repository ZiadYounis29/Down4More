import { FileSizePipe } from './file-size.pipe';

describe('FileSizePipe', () => {
  const pipe = new FileSizePipe();

  it('transforms null to "—"', () => {
    expect(pipe.transform(null)).toBe('—');
  });

  it('auto mode: 41943040 → "40 MB"', () => {
    expect(pipe.transform(41_943_040)).toBe('40 MB');
  });

  it('auto mode: 1174405120 → "1.1 GB"', () => {
    expect(pipe.transform(1_174_405_120)).toBe('1.1 GB');
  });

  it('mb mode: 1174405120 → "1,120 MB"', () => {
    expect(pipe.transform(1_174_405_120, 'mb')).toBe('1,120 MB');
  });
});
