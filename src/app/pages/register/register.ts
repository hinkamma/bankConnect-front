import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule
} from '@angular/forms';
import { NgIf } from '@angular/common';
import { Auth, LoginResponse } from '../../services/auth';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./register.less'],
  imports: [ReactiveFormsModule, NgIf]
})
export class Register implements OnInit {
  registerForm!: FormGroup;
  isSubmitted = false;

  constructor(private fb: FormBuilder, private auth: Auth) {
    this.registerForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.maxLength(100)]],
      last_name: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      phone: [''],
      role: ['client', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required]],
      accept: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    // no-op
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmation = control.get('password_confirmation');

    if (password && confirmation && password.value && confirmation.value && password.value !== confirmation.value) {
      confirmation.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (confirmation?.hasError('passwordMismatch')) {
      confirmation.setErrors(null);
    }

    return null;
  }

  showFieldError(fieldName: string, errorType: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.hasError(errorType) && (field.touched || this.isSubmitted));
  }

  showPasswordMismatch(): boolean {
    const confirmation = this.registerForm.get('password_confirmation');
    return !!(confirmation && confirmation.hasError('passwordMismatch') && (confirmation.touched || this.isSubmitted));
  }

  onSubmit(): void {
    this.isSubmitted = true;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const firstName = (this.registerForm.value.first_name ?? '').trim();
    const lastName = (this.registerForm.value.last_name ?? '').trim();
    const phone = (this.registerForm.value.phone ?? '').trim();

    const payload = {
      name: `${firstName} ${lastName}`.trim(),
      first_name: firstName,
      last_name: lastName,
      email: this.registerForm.value.email,
      phone: phone || '',
      role: this.registerForm.value.role,
      password: this.registerForm.value.password,
      password_confirmation: this.registerForm.value.password_confirmation,
      accept: !!this.registerForm.value.accept
    };

    
    this.auth.register(payload).subscribe({
      next: (response: LoginResponse) => {
        console.log('Inscription réussie :', response);
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
      },
      error: (error: unknown) => {
        console.error('Erreur lors de l’inscription :', error);
      }
    });
  }
}