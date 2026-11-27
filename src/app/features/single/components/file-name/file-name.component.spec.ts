import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileNameComponent } from './file-name.component';

describe('FileNameComponent', () => {
  let fixture: ComponentFixture<FileNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileNameComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FileNameComponent);
    fixture.componentRef.setInput('extension', 'mp4');
  });

  it('renders label and extension suffix', () => {
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('label') as HTMLLabelElement;
    const ext = fixture.nativeElement.querySelector('.fn__ext') as HTMLElement;

    expect(label.textContent?.trim()).toBe('File name');
    expect(ext.textContent?.trim()).toBe('.mp4');
  });

  it('label for matches input id', () => {
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('label') as HTMLLabelElement;
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(label.htmlFor).toBe(input.id);
    expect(input.id).toBeTruthy();
  });

  it('shows fallback as placeholder when value is empty', () => {
    fixture.componentRef.setInput('fallback', 'My video title');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.placeholder).toBe('My video title');
  });

  it('updates model on input event', () => {
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'my-file';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBe('my-file');
  });

  it('never includes the extension in the value', () => {
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'rocket-launch';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBe('rocket-launch');
    expect(fixture.componentInstance.value()).not.toContain('.mp4');
  });

  it('changing extension updates suffix without changing value', () => {
    fixture.componentRef.setInput('value', 'my-file');
    fixture.componentRef.setInput('extension', 'mkv');
    fixture.detectChanges();

    const ext = fixture.nativeElement.querySelector('.fn__ext') as HTMLElement;
    expect(ext.textContent?.trim()).toBe('.mkv');
    expect(fixture.componentInstance.value()).toBe('my-file');
  });
});
