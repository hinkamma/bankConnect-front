import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {FormBuilder,FormGroup,Validators,AbstractControl,ValidationErrors,ReactiveFormsModule} from '@angular/forms';
import { NgIf } from '@angular/common';
import { Auth, LoginResponse } from '../../services/auth';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./register.less'],
  imports: [ReactiveFormsModule, NgIf]
})


export class Register implements OnInit {
  registerForm!: FormGroup;
  isSubmitted = false;


  errorMessage: any;
  toastMessage: string = '';

  showToastFlag: boolean = false;
  toastType: 'error' | 'success' = 'error';


  isLoading: boolean = false;


  constructor(private fb: FormBuilder, private auth: Auth, private router: Router, private cdr : ChangeDetectorRef) {
    this.registerForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.maxLength(100)]],
      last_name: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
       phone: ['', [Validators.pattern(/^[0-9]{9}$/)]],
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

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Supprime tout ce qui n'est pas un chiffre
    const cleaned = input.value.replace(/[^0-9]/g, '').slice(0, 9);
    this.registerForm.get('phone')?.setValue(cleaned, { emitEvent: false });
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


    showToast(message: string, type: 'error' | 'success' = 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToastFlag = true;

    setTimeout(() => {
      this.showToastFlag = false;
      this.cdr.detectChanges();
    }, 3000);

  }


  onSubmit(): void {
    this.isSubmitted = true;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.registerForm.disable({ emitEvent: false });

  this.isLoading = true; 
  this.registerForm.disable({ emitEvent: false });

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


     this.auth.register(this.registerForm.value)
    .pipe(
      finalize(() => {
        this.isLoading = false;
        this.registerForm.enable({ emitEvent: false });
      })
    )
    .subscribe({
      next: (response) => {
        this.router.navigate(["/login"]);
      },
      error: (error) => {
        const message = error.error?.message || 'Une erreur est survenue.';
        this.showToast(message, "error");
      }
    });
  }
}
