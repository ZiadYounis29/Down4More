import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchBarComponent } from './search-bar.component';

describe('SearchBarComponent', () => {
  let fixture: ComponentFixture<SearchBarComponent>;
  let component: SearchBarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('updates value on input', () => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'rocket';
    input.dispatchEvent(new Event('input'));
    expect(component.value()).toBe('rocket');
  });

  it('clears value on Escape', () => {
    component.value.set('rocket');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(component.value()).toBe('');
  });

  it('focuses input when Search button is clicked', () => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const spy = vi.spyOn(input, 'focus');
    const btn = fixture.nativeElement.querySelector('button.sb__btn') as HTMLButtonElement;
    btn.click();
    expect(spy).toHaveBeenCalled();
  });
});
