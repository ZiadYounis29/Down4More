import { IconName } from '@shared/ui/icon';

export interface NavButton {
  id: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'apply';
  side?: 'start' | 'end';
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  hidden?: boolean;
  pressed?: boolean;
  title?: string;
}

export function navBack(): NavButton {
  return { id: 'back', label: 'Back', variant: 'ghost', side: 'start', icon: 'chevron-left' };
}

export function navNext(): NavButton {
  return { id: 'next', label: 'Next', variant: 'primary', side: 'end', icon: 'chevron-right' };
}

export function navFetch(): NavButton {
  return { id: 'fetch', label: 'Fetch', variant: 'primary', side: 'end', icon: 'arrow-down' };
}

export function navDownload(): NavButton {
  return { id: 'download', label: 'Download', variant: 'primary', side: 'end', icon: 'arrow-down' };
}

export function navApply(): NavButton {
  return { id: 'apply', label: 'Apply', variant: 'apply', side: 'end', icon: 'check' };
}
