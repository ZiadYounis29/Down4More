import { TestBed } from '@angular/core/testing';
import { UrlParserService } from './url-parser.service';

describe('UrlParserService', () => {
  let service: UrlParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UrlParserService],
    });
    service = TestBed.inject(UrlParserService);
  });

  it('is created', () => {
    expect(service).toBeTruthy();
    expect(typeof service.parse).toBe('function');
  });
});
