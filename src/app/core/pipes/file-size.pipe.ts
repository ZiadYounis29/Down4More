import { Pipe, PipeTransform } from '@angular/core';
import { formatSize } from '@core/utils';

/**
 * Angular pipe wrapper for `formatSize`.
 * Usage: {{ bytes | fileSize }}   or   {{ bytes | fileSize:'mb' }}
 */
@Pipe({
  name: 'fileSize',
  standalone: true,
  pure: true,
})
export class FileSizePipe implements PipeTransform {
  transform(value: number | null, unit: 'auto' | 'mb' = 'auto'): string {
    return formatSize(value, unit);
  }
}
