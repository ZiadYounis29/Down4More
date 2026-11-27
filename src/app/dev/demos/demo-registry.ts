import { Type } from '@angular/core';

export interface DemoEntry {
  id: string;
  label: string;
  group: 'Primitives' | 'Shared' | 'Feature' | 'Core';
  load: () => Promise<Type<unknown>>;
}

export const DEMO_ENTRIES: DemoEntry[] = [
  // Primitives (shared/ui)
  {
    id: 'icon',
    label: 'Icon',
    group: 'Primitives',
    load: () => import('./icon.demo.component').then((m) => m.IconDemoComponent),
  },
  {
    id: 'checkbox',
    label: 'Checkbox',
    group: 'Primitives',
    load: () =>
      import('./checkbox.demo.component').then((m) => m.CheckboxDemoComponent),
  },
  {
    id: 'toggle',
    label: 'Toggle',
    group: 'Primitives',
    load: () =>
      import('./toggle.demo.component').then((m) => m.ToggleDemoComponent),
  },
  {
    id: 'segmented-control',
    label: 'Segmented control',
    group: 'Primitives',
    load: () =>
      import('./segmented-control.demo.component').then(
        (m) => m.SegmentedControlDemoComponent,
      ),
  },
  {
    id: 'select',
    label: 'Select',
    group: 'Primitives',
    load: () =>
      import('./select.demo.component').then((m) => m.SelectDemoComponent),
  },
  {
    id: 'progress-bar',
    label: 'Progress bar',
    group: 'Primitives',
    load: () =>
      import('./progress-bar.demo.component').then(
        (m) => m.ProgressBarDemoComponent,
      ),
  },
  {
    id: 'panel',
    label: 'Panel',
    group: 'Primitives',
    load: () =>
      import('./panel.demo.component').then((m) => m.PanelDemoComponent),
  },
  {
    id: 'tag',
    label: 'Tag',
    group: 'Primitives',
    load: () => import('./tag.demo.component').then((m) => m.TagDemoComponent),
  },
  {
    id: 'thumb-box',
    label: 'Thumb box',
    group: 'Primitives',
    load: () =>
      import('./thumb-box.demo.component').then((m) => m.ThumbBoxDemoComponent),
  },

  // Shared components
  {
    id: 'page-container',
    label: 'Page container',
    group: 'Shared',
    load: () =>
      import('./page-container.demo.component').then(
        (m) => m.PageContainerDemoComponent,
      ),
  },
  {
    id: 'logo',
    label: 'Logo',
    group: 'Shared',
    load: () => import('./logo.demo.component').then((m) => m.LogoDemoComponent),
  },
  {
    id: 'nav-buttons',
    label: 'Nav buttons',
    group: 'Shared',
    load: () =>
      import('./nav-buttons.demo.component').then(
        (m) => m.NavButtonsDemoComponent,
      ),
  },
  {
    id: 'download-options',
    label: 'Download options',
    group: 'Shared',
    load: () =>
      import('./download-options.demo.component').then(
        (m) => m.DownloadOptionsDemoComponent,
      ),
  },
  {
    id: 'media-thumbnail',
    label: 'Media thumbnail',
    group: 'Shared',
    load: () =>
      import('./media-thumbnail.demo.component').then(
        (m) => m.MediaThumbnailDemoComponent,
      ),
  },
  {
    id: 'download-info',
    label: 'Download info',
    group: 'Shared',
    load: () =>
      import('./download-info.demo.component').then(
        (m) => m.DownloadInfoDemoComponent,
      ),
  },
  {
    id: 'item-container',
    label: 'Item container',
    group: 'Shared',
    load: () =>
      import('./item-container.demo.component').then(
        (m) => m.ItemContainerDemoComponent,
      ),
  },

  // Core
  {
    id: 'nav-bar',
    label: 'Nav bar',
    group: 'Core',
    load: () =>
      import('./nav-bar.demo.component').then((m) => m.NavBarDemoComponent),
  },

  // Feature-local components
  {
    id: 'url-bar',
    label: 'Url bar (Home)',
    group: 'Feature',
    load: () =>
      import('./url-bar.demo.component').then((m) => m.UrlBarDemoComponent),
  },
  {
    id: 'url-list',
    label: 'Url list (Home)',
    group: 'Feature',
    load: () =>
      import('./url-list.demo.component').then((m) => m.UrlListDemoComponent),
  },
  {
    id: 'file-name',
    label: 'File name (Single)',
    group: 'Feature',
    load: () =>
      import('./file-name.demo.component').then((m) => m.FileNameDemoComponent),
  },
  {
    id: 'toggle-panel',
    label: 'Toggle panel (Single)',
    group: 'Feature',
    load: () =>
      import('./toggle-panel.demo.component').then(
        (m) => m.TogglePanelDemoComponent,
      ),
  },
  {
    id: 'frame-size',
    label: 'Frame size (Single)',
    group: 'Feature',
    load: () =>
      import('./frame-size.demo.component').then(
        (m) => m.FrameSizeDemoComponent,
      ),
  },
  {
    id: 'trim-video',
    label: 'Trim video (Single)',
    group: 'Feature',
    load: () =>
      import('./trim-video.demo.component').then(
        (m) => m.TrimVideoDemoComponent,
      ),
  },
  {
    id: 'status-count',
    label: 'Status count (Downloads)',
    group: 'Feature',
    load: () =>
      import('./status-count.demo.component').then(
        (m) => m.StatusCountDemoComponent,
      ),
  },
  {
    id: 'search-bar',
    label: 'Search bar (History)',
    group: 'Feature',
    load: () =>
      import('./search-bar.demo.component').then(
        (m) => m.SearchBarDemoComponent,
      ),
  },
];
