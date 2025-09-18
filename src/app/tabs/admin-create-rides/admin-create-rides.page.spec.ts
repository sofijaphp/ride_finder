import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminCreateRidesPage } from './admin-create-rides.page';

describe('AdminRidesPage', () => {
  let component: AdminCreateRidesPage;
  let fixture: ComponentFixture<AdminCreateRidesPage>;

  beforeEach(async() => {
    fixture = TestBed.createComponent(AdminCreateRidesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
