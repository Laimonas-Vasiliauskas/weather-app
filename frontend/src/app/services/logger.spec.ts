import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Logger } from './logger';

describe('Logger', () => {
  let service: Logger;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(Logger);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});