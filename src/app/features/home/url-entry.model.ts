import { UrlKind } from '@core/utils';

export interface UrlEntry {
  id: string;
  url: string;
  key: string;
  kind: UrlKind;
  failed?: boolean;
}

export const MAX_LINKS = 50;
