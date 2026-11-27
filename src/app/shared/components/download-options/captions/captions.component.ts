import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import type { CaptionSettings } from '@core/models';
import { Option, SelectComponent } from '@shared/ui/select';

type BoolChoice = 'off' | 'on';

const BOOL_OPTIONS: Option<BoolChoice>[] = [
  { value: 'off', label: 'off' },
  { value: 'on', label: 'on' },
];

@Component({
  selector: 'd4m-captions',
  imports: [SelectComponent],
  templateUrl: './captions.component.html',
  styleUrl: './captions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CaptionsComponent {
  readonly value = model.required<CaptionSettings>();
  readonly disabled = input(false);
  readonly lockSeparate = input(false);

  protected readonly boolOptions = BOOL_OPTIONS;
  protected readonly captionEnabled = computed(() => this.value().enabled);
  protected readonly captionChoice = computed<BoolChoice>(() =>
    this.value().enabled ? 'on' : 'off',
  );
  protected readonly separateChoice = computed<BoolChoice>(() =>
    (this.value().enabled && this.value().separateFile) || this.lockSeparate() ? 'on' : 'off',
  );

  protected onCaptionChange(choice: BoolChoice): void {
    const enabled = choice === 'on';
    this.value.set({
      enabled,
      separateFile: enabled ? this.value().separateFile : false,
    });
  }

  protected onSeparateChange(choice: BoolChoice): void {
    if (!this.captionEnabled() || this.lockSeparate()) return;
    this.value.set({ ...this.value(), separateFile: choice === 'on' });
  }
}
