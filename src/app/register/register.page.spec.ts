import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterPage } from './register.page';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('RegisterPage', () => {
  let component: RegisterPage;
  let fixture: ComponentFixture<RegisterPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RegisterPage],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar error si las contraseñas no coinciden', () => {
    component.registerForm.setValue({
      username: 'testuser',
      email: 'test@example.com',
      password: '123456',
      confirmPassword: '654321',
      firstName: '',
      lastName: ''
    });
    component.onSubmit();
    expect(component.registerForm.get('confirmPassword')?.errors?.['passwordMismatch']).toBeTrue();
  });

  it('no debe llamar a authService.register si el formulario es inválido', () => {
    const authSpy = spyOn(component['authService'], 'register');
    component.registerForm.setValue({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: ''
    });
    component.onSubmit();
    expect(authSpy).not.toHaveBeenCalled();
  });
});
