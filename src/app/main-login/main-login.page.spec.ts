import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainLoginPage } from './main-login.page';

describe('MainLoginPage', () => {
  let component: MainLoginPage;
  let fixture: ComponentFixture<MainLoginPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MainLoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
