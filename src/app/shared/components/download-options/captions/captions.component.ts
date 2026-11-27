import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import type { CaptionSettings } from '@core/models';

@Component({
  selector: 'd4m-captions',
  imports: [],
  templateUrl: './captions.component.html',
  styleUrl: './captions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CaptionsComponent {
  readonly value = model.required<CaptionSettings>();
  readonly disabled = input(false);
  readonly lockSeparate = input(false);

  protected readonly captionEnabled = computed(() => this.value().enabled);
  protected readonly separateFile = computed(() => this.value().separateFile);

  protected onCaptionChange(event: Event): void {
    const sel = event.target as HTMLSelectElement;
    const enabled = sel.value === '1';
    // turning captions off resets separateFile
    this.value.set({ enabled, separateFile: enabled ? this.separateFile() : false });
  }

  protected onSeparateChange(event: Event): void {
    if (!this.captionEnabled() || this.lockSeparate()) return;
    const sel = event.target as HTMLSelectElement;
    this.value.set({ ...this.value(), separateFile: sel.value === '1' });
  }
}
