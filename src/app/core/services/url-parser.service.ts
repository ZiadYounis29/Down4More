import { Injectable } from '@angular/core';
import { parseUrl, type ParsedUrl } from '@core/utils/parse-url';

@Injectable({ providedIn: 'root' })
export class UrlParserService {
  parse(raw: string): ParsedUrl {
    return parseUrl(raw);
  }
}
