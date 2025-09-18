import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminApproveRidesPage as AdminApproveRidesPage } from './admin-approve-rides.page';

describe('AdminApproveRidesPage', () => {
  let component: AdminApproveRidesPage;
  let fixture: ComponentFixture<AdminApproveRidesPage>;

  beforeEach(async() => {
    fixture = TestBed.createComponent(AdminApproveRidesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
