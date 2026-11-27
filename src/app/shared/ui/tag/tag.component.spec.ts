import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TagComponent } from './tag.component';

describe('TagComponent', () => {
  let fixture: ComponentFixture<TagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TagComponent);
  });

  it('renders text with default variant and switches to applied', () => {
    fixture.componentRef.setInput('text', 'Default');
    fixture.detectChanges();

    const el = fixture.nativeElement.querySelector('.tag') as HTMLElement;
    expect(el.textContent?.trim()).toBe('Default');
    expect(el.classList.contains('tag--applied')).toBe(false);

    fixture.componentRef.setInput('text', '1080p · mp4');
    fixture.componentRef.setInput('variant', 'applied');
    fixture.detectChanges();
    expect(el.textContent?.trim()).toBe('1080p · mp4');
    expect(el.classList.contains('tag--applied')).toBe(true);
  });
});
