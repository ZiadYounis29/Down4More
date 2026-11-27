export type MediaMode = 'video+audio' | 'audio-only' | 'video-only';

export interface CaptionSettings {
  enabled: boolean;
  separateFile: boolean;
}

export interface DownloadSettings {
  mode: MediaMode;
  quality: string | null; // '1080p'. null when mode = 'audio-only'
  format: string; // 'mp4' | 'mkv' | 'mp3' ...
  bitrate: number | null; // kbps. null when mode = 'video-only'
  captions: CaptionSettings;
}

export interface DownloadOptionsCatalog {
  qualities: string[];
  videoFormats: string[];
  audioFormats: string[];
  /** Exact kbps values actually available, ascending (replaces { min, max, step }). */
  bitrates: number[];
}
