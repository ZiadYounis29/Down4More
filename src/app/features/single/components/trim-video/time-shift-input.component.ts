import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { formatClock } from './formatClock';

const DIGIT_COUNT = 6;
// Maps string cursor position (0..8) in "HH:MM:SS" to digit index (0..6)
const STR_TO_DIGIT = [0, 1, 2, 2, 3, 4, 4, 5, 6] as const;

export function secToDigits6(sec: number): string {
  return formatClock(sec).replace(/:/g, '');
}

export function formatDigits6(digits: string): string {
  const d = digits.padStart(DIGIT_COUNT, '0').slice(-DIGIT_COUNT);
  return `${d.slice(0, 2)}:${d.slice(2, 4)}:${d.slice(4, 6)}`;
}

export function digits6ToSec(digits: string): number {
  const d = digits.padStart(DIGIT_COUNT, '0').slice(-DIGIT_COUNT);
  return Number(d.slice(0, 2)) * 3600 + Number(d.slice(2, 4)) * 60 + Number(d.slice(4, 6));
}

@Component({
  selector: 'd4m-time-shift-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <input
      #inputEl
      type="text"
      inputmode="numeric"
      class="ts-input"
      [attr.aria-label]="ariaLabel()"
      [value]="display()"
      (focus)="onFocus()"
      (blur)="onBlur()"
      (keydown)="onKeyDown($event)"
    />
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }

      .ts-input {
        width: 9.5ch;
        padding: 4px 6px;
        border: 1px solid var(--color-border);
        border-radius: 7px;
        background: var(--color-surface);
        color: var(--color-text);
        font-family: inherit;
        font-size: 13px;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        text-align: center;
        cursor: text;
        outline: none;
        transition: border-color 0.12s ease;

        &:hover {
          border-color: var(--color-text-muted);
        }

        &:focus {
          border-color: var(--color-primary);
        }
      }
    `,
  ],
})
export class TimeShiftInputComponent {
  readonly value = input.required<number>();
  readonly maxSec = input.required<number>();
  readonly ariaLabel = input('Time');
  readonly valueChange = output<number>();

  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('inputEl');
  private readonly buffer = signal<string | null>(null);

  protected readonly display = computed(() =>
    formatDigits6(this.buffer() ?? secToDigits6(this.value())),
  );

  protected onFocus(): void {
    this.buffer.set(secToDigits6(this.value()));
  }

  protected onBlur(): void {
    const buf = this.buffer();
    this.buffer.set(null);
    if (buf !== null) {
      this.valueChange.emit(digits6ToSec(buf));
    }
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Tab' || event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Home' || event.key === 'End') {
      return;
    }
    if ((event.ctrlKey || event.metaKey) && ['a', 'c'].includes(event.key.toLowerCase())) {
      return;
    }
    event.stopPropagation();

    const el = event.target as HTMLInputElement;
    const digits = this.buffer() ?? secToDigits6(this.value());
    const selStart = el.selectionStart ?? 8;
    const selEnd = el.selectionEnd ?? selStart;
    const dStart = STR_TO_DIGIT[Math.min(8, Math.max(0, selStart))];
    const dEnd = STR_TO_DIGIT[Math.min(8, Math.max(0, selEnd))];

    if (/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      let next: string;
      let cursorPos: number;

      if (dStart < dEnd) {
        const pad = '0'.repeat(dEnd - dStart - 1);
        next = digits.slice(0, dStart) + pad + event.key + digits.slice(dEnd);
        cursorPos = selEnd;
      } else if (dStart > 0) {
        next = digits.slice(1, dStart) + event.key + digits.slice(dStart);
        cursorPos = selStart;
      } else {
        next = event.key + digits.slice(1);
        cursorPos = 1;
      }

      this.applyDigits(next, cursorPos);
      return;
    }

    if (event.key === 'Backspace') {
      event.preventDefault();
      if (dStart < dEnd) {
        const next = digits.slice(0, dStart) + '0'.repeat(dEnd - dStart) + digits.slice(dEnd);
        this.applyDigits(next, selStart);
      } else if (dStart > 0) {
        const next = '0' + digits.slice(0, dStart - 1) + digits.slice(dStart);
        this.applyDigits(next, selStart);
      }
      return;
    }

    if (event.key === 'Delete') {
      event.preventDefault();
      if (dStart < dEnd) {
        const next = digits.slice(0, dStart) + '0'.repeat(dEnd - dStart) + digits.slice(dEnd);
        this.applyDigits(next, selStart);
      } else if (dStart < DIGIT_COUNT) {
        const next = digits.slice(0, dStart) + digits.slice(dStart + 1) + '0';
        this.applyDigits(next, selStart);
      }
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      el.blur();
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.buffer.set(null);
      el.blur();
      return;
    }

    event.preventDefault();
  }

  private applyDigits(digits: string, cursorPos: number): void {
    this.buffer.set(digits);
    const el = this.inputRef()?.nativeElement;
    if (el) {
      // Sync DOM value before Angular CD so the browser doesn't reset selection to the end
      el.value = formatDigits6(digits);
      el.setSelectionRange(cursorPos, cursorPos);
    }
    this.valueChange.emit(digits6ToSec(digits));
  }
}
