import { Pipe, PipeTransform } from '@angular/core';
import { formatDuration } from '@core/utils';

/**
 * Angular pipe wrapper for `formatDuration`.
 * Usage: {{ durationSec | duration }}
 */
@Pipe({
  name: 'duration',
  standalone: true,
  pure: true,
})
export class DurationPipe implements PipeTransform {
  transform(value: number | null): string {
    return formatDuration(value);
  }
}
