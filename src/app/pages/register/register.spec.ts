import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Register } from './register';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Register],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should invalidate when password confirmation does not match', () => {
    component.registerForm.patchValue({
      name: 'Jean Dupont',
      email: 'jean@example.com',
      password: 'abcdef',
      password_confirmation: 'abcdef1',
      accept: true,
    });

    expect(component.registerForm.valid).toBeFalse();
    expect(component.registerForm.errors).toEqual({ passwordMismatch: true });
  });

  it('should invalidate when the terms checkbox is not accepted', () => {
    component.registerForm.patchValue({
      name: 'Jean Dupont',
      email: 'jean@example.com',
      password: 'abcdef',
      password_confirmation: 'abcdef',
      accept: false,
    });

    expect(component.registerForm.valid).toBeFalse();
    expect(component.registerForm.get('accept')?.hasError('required')).toBeTrue();
  });
});
