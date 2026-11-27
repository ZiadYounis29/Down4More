import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
// UNRESOLVED IMPORT (not yet on main):
// import { FileNameComponent } from '@features/single/components/file-name';

@Component({
  selector: 'd4m-file-name-demo',
  imports: [],
  template: `
    <h2>File name (Single)</h2>
    <section class="demo-grid">
      <figure>
        <figcaption>Default</figcaption>
        <input
          type="text"
          [value]="defaultName()"
          (input)="defaultName.set($any($event.target).value)"
        />
        <span>.mp4</span>
      </figure>
      <figure>
        <figcaption>Long name</figcaption>
        <input
          type="text"
          value="A Very Long Video Title That Demonstrates Overflow Handling Inside The File Name Input"
          readonly
        />
        <span>.mp4</span>
      </figure>
      <figure>
        <figcaption>Empty (shows fallback placeholder)</figcaption>
        <input type="text" value="" placeholder="Fallback Video Title" readonly />
        <span>.mp4</span>
      </figure>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileNameDemoComponent {
  protected readonly defaultName = signal('My Video');
}
