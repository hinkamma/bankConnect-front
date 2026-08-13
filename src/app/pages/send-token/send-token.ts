import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { Validators, ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { Router, RouterLink } from "@angular/router";
import { Auth } from '../../services/auth';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-send-token',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './send-token.html',
  styleUrl: './send-token.less',
})
export class SendToken implements OnInit, OnDestroy {
  timeRemaining = signal(60);
 
  isLoading = false;
  isResending = false;
  tokenForm!: FormGroup;

  toastMessage: string = '';
  showToastFlag: boolean = false;

  private countdownInterval: any;
  private router: Router;
  toastType: 'error' | 'success' = 'error';

  constructor(private fb: FormBuilder, private auth: Auth, router: Router) {
    this.tokenForm = fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
    this.router = router;
  }

  private showToast(message: string, type: 'error' | 'success' = 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToastFlag = true;

    setTimeout(() => {
      this.showToastFlag = false;
    }, 5000);
  }
  ngOnInit(): void {
    this.startCountdown();
  }

  ngOnDestroy(): void {
    // Nettoyage indispensable pour éviter les fuites mémoire
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  private startCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    this.countdownInterval = setInterval(() => {
      if (this.timeRemaining() > 0) {
        this.timeRemaining.update(v => v - 1); 
      } else {
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }



  onSubmit(): void {
    if (this.tokenForm.invalid) {
      this.tokenForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.tokenForm.disable({ emitEvent: false });

    const CodeSaisi = this.tokenForm.get('code')?.value ?? '';
    const UserId = Number(localStorage.getItem("user_id"));

    this.auth.SendToken({ user_id: UserId, token: CodeSaisi }).pipe(
      finalize(() => {
        this.isLoading = false;
        this.tokenForm.enable({ emitEvent: false });
      })
    )
    .subscribe({
      next: (response) => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Une erreur réseau ou serveur est survenue', error);
        const message = error.error?.message || error.error?.back_flash || 'Une erreur est survenue, veuillez réessayer.';
        this.showToast(message);
      }
    });
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  resendToken(): void {
    if (this.timeRemaining() > 0 || this.isResending) {
      return; // sécurité supplémentaire, en plus du [disabled] côté template
    }

    const UserId = Number(localStorage.getItem("user_id"));

    if (!UserId) {
      this.showToast('Session invalide, veuillez recommencer l\'inscription.');
      return;
    }

    this.isResending = true;
    console.log(this.isResending);

    this.auth.resendCode(UserId).pipe(
      finalize(() => {
        this.isResending = false;
      })
    )
    .subscribe({
      next: (response) => {
        this.showToast(response?.message ?? 'Un nouveau code a été envoyé.');
        this.timeRemaining.set(60);
        this.startCountdown();
      },
      error: (error) => {
        const message = error.error?.message || 'Impossible de renvoyer le code, réessayez.';
        this.showToast(message);
        console.log(error);
      }
    });
  }
}