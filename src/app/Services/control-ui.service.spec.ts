import { TestBed } from '@angular/core/testing';

import { ControlUIService } from './control-ui.service';

describe('ControlUIService', () => {
  let service: ControlUIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ControlUIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
