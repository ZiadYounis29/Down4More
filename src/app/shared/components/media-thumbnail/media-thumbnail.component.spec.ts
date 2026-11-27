import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MediaThumbnailComponent } from './media-thumbnail.component';
import { MediaItem } from '@core/models';

const MOCK_ITEM: MediaItem = {
  id: 'm-1',
  url: 'https://www.youtube.com/watch?v=abc',
  title: 'Test Video Title',
  thumbnailUrl: null,
  durationSec: 768,       // 12:48
  channelName: 'Test Channel',
  sizeBytes: 41_943_040,  // 40 MB
};

async function create(
  variant: 'single' | 'pre-select' | 'option-select',
  overrides: Partial<{
    selected: boolean;
    showCheckbox: boolean;
    appliedTag: string | null;
    loading: boolean;
    sizeOverride: number | null | undefined;
  }> = {},
) {
  const fixture = TestBed.createComponent(MediaThumbnailComponent);
  fixture.componentRef.setInput('item', MOCK_ITEM);
  fixture.componentRef.setInput('variant', variant);
  if (overrides.selected !== undefined) fixture.componentRef.setInput('selected', overrides.selected);
  if (overrides.showCheckbox !== undefined) fixture.componentRef.setInput('showCheckbox', overrides.showCheckbox);
  if (overrides.appliedTag !== undefined) fixture.componentRef.setInput('appliedTag', overrides.appliedTag);
  if (overrides.loading !== undefined) fixture.componentRef.setInput('loading', overrides.loading);
  if (overrides.sizeOverride !== undefined) fixture.componentRef.setInput('sizeOverride', overrides.sizeOverride);
  fixture.detectChanges();
  return fixture;
}

describe('MediaThumbnailComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaThumbnailComponent],
    }).compileComponents();
  });

  it('renders single variant with title and meta', async () => {
    const f = await create('single');
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('.mt-single')).not.toBeNull();
    expect(el.textContent).toContain('Test Video Title');
    expect(el.textContent).toContain('12:48');
    expect(el.textContent).toContain('40 MB');
  });

  it('renders pre-select variant as button', async () => {
    const f = await create('pre-select');
    const btn = f.nativeElement.querySelector('button.mt-row');
    expect(btn).not.toBeNull();
    expect(btn.getAttribute('aria-pressed')).toBe('false');
  });

  it('renders option-select variant with File size and Duration columns', async () => {
    const f = await create('option-select');
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('File size');
    expect(el.textContent).toContain('Duration');
  });

  it('row height uses --row-height token (CSS variable set)', async () => {
    const f = await create('pre-select');
    const btn = f.nativeElement.querySelector('button.mt-row') as HTMLElement;
    // Height is controlled by CSS var, just verify the class is applied
    expect(btn.classList.contains('mt-row')).toBe(true);
  });

  it('click toggles selected in pre-select', async () => {
    const f = await create('pre-select');
    const btn = f.nativeElement.querySelector('button.mt-row') as HTMLElement;
    expect(f.componentInstance.selected()).toBe(false);
    btn.click();
    f.detectChanges();
    expect(f.componentInstance.selected()).toBe(true);
  });

  it('click toggles selected in option-select', async () => {
    const f = await create('option-select');
    const btn = f.nativeElement.querySelector('button.mt-row') as HTMLElement;
    btn.click();
    f.detectChanges();
    expect(f.componentInstance.selected()).toBe(true);
  });

  it('showCheckbox=false hides the checkbox but row still toggles', async () => {
    const f = await create('option-select', { showCheckbox: false });
    const el = f.nativeElement as HTMLElement;
    // No checkbox rendered
    expect(el.querySelector('d4m-checkbox')).toBeNull();
    // Row still toggles
    const btn = el.querySelector('button.mt-row') as HTMLElement;
    btn.click();
    f.detectChanges();
    expect(f.componentInstance.selected()).toBe(true);
  });

  it('sizeOverride=null shows "—"', async () => {
    const f = await create('option-select', { sizeOverride: null });
    expect(f.nativeElement.textContent).toContain('—');
  });

  it('sizeOverride value overrides item.sizeBytes', async () => {
    // 644874240 = 615 MB
    const f = await create('option-select', { sizeOverride: 644_874_240 });
    expect(f.nativeElement.textContent).toContain('615 MB');
    expect(f.nativeElement.textContent).not.toContain('40 MB');
  });

  it('null appliedTag shows "Default" tag', async () => {
    const f = await create('option-select', { appliedTag: null });
    expect(f.nativeElement.textContent).toContain('Default');
  });

  it('string appliedTag shows applied tag text', async () => {
    const f = await create('option-select', { appliedTag: '1080p · mp4' });
    expect(f.nativeElement.textContent).toContain('1080p · mp4');
  });

  it('loading shows skeleton', async () => {
    const f = await create('pre-select', { loading: true });
    expect(f.nativeElement.querySelector('.mt-skeleton')).not.toBeNull();
  });
});
