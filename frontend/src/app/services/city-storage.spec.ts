import { TestBed } from '@angular/core/testing';

import { CityStorage } from './city-storage';

describe('CityStorage', () => {
  let service: CityStorage;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CityStorage);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
