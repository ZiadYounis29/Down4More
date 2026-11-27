import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FileNameComponent } from '@features/single/components/file-name';

@Component({
  selector: 'd4m-file-name-demo',
  imports: [FileNameComponent],
  template: `
    <h2>File name (Single)</h2>
    <section class="demo-grid">
      <figure>
        <figcaption>Default</figcaption>
        <d4m-file-name [(value)]="defaultName" extension="mp4" fallback="My Video" />
      </figure>
      <figure>
        <figcaption>Long name</figcaption>
        <d4m-file-name [(value)]="longName" extension="mp4" fallback="Fallback" />
      </figure>
      <figure>
        <figcaption>Empty (shows fallback placeholder)</figcaption>
        <d4m-file-name [(value)]="emptyName" extension="mp4" fallback="Fallback Video Title" />
      </figure>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileNameDemoComponent {
  protected readonly defaultName = signal('My Video');
  protected readonly longName = signal(
    'A Very Long Video Title That Demonstrates Overflow Handling Inside The File Name Input Field',
  );
  protected readonly emptyName = signal('');
}
