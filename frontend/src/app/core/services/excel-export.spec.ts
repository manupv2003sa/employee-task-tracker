import { TestBed } from '@angular/core/testing';
import { ExcelExport } from './excel-export';

describe('ExcelExport', () => {
  let service: ExcelExport;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExcelExport);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
