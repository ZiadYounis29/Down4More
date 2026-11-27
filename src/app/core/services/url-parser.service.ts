// STUB dependency: @core/utils/parse-url is owned by P3 T1 and is not on `main` yet.
// The import is left in place per P4 T1 instructions; it resolves once P3 T1 is merged.
import { Injectable } from '@angular/core';
import { parseUrl, type ParsedUrl } from '@core/utils/parse-url';

@Injectable({ providedIn: 'root' })
export class UrlParserService {
  parse(raw: string): ParsedUrl {
    return parseUrl(raw);
  }
}
