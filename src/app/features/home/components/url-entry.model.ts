export interface UrlEntry {
  id: string;
  url: string;            // normalised, what is sent to the backend
  key: string;            // used for duplicate checks
  kind: 'video' | 'playlist' | 'unknown';  // from parseUrl
  failed?: boolean;       // set after a fetch where this link could not be loaded
}

export const MAX_LINKS = 50;   // assumed limit, one constant to change
