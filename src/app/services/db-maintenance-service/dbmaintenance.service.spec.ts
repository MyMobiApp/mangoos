import { TestBed } from '@angular/core/testing';

import { DBMaintenanceService } from './dbmaintenance.service';

describe('DBMaintenanceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DBMaintenanceService = TestBed.get(DBMaintenanceService);
    expect(service).toBeTruthy();
  });
});
