import { Component, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Auth } from '../../services/auth';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, NgIf],
  templateUrl: './login.html',
  styleUrls: ['./login.less'],
})
export class Login {
  loginForm: FormGroup<{ role: FormControl<string | null>; email: FormControl<string | null>; password: FormControl<string | null>; }>;


  errorMessage: any;
  toastMessage: string = '';

  showToastFlag: boolean = false;
  toastType: 'error' | 'success' = 'error';

  isLoading: boolean = false;

  constructor(private fb: FormBuilder, private authService: Auth, private router: Router, private cdr: ChangeDetectorRef) {
    this.loginForm = this.fb.group({
      role: ['client', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  showToast(message: string, type: 'error' | 'success' = 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToastFlag = true;

    setTimeout(() => {
      this.showToastFlag = false;
      this.cdr.detectChanges();
    }, 5000);
  }

  goToLogin(event?: Event) {
    event?.preventDefault();
    this.router.navigate(['/register']);
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const email = this.loginForm.get('email')?.value ?? '';
    const password = this.loginForm.get('password')?.value ?? '';

    this.isLoading = true;
    this.loginForm.disable({ emitEvent: false });

    this.authService.login({ email, password }).pipe(finalize(() => {
      this.isLoading = false;
      this.loginForm.enable({ emitEvent: false });
    })).subscribe({
      next: (res) => {
        if (!res?.token) {
          const message = res?.message || res?.back_flash || 'Identifiants incorrects. Veuillez réessayer.';
          this.showToast(message, 'error');
          return;
        }
        this.router.navigate(['/sendToken']);
      },
      error: (err) => {
        const message = err.error?.message || err.error?.back_flash || 'Une erreur est survenue, veuillez réessayer.';
        this.showToast(message, 'error');
      }
    });
  }
}
