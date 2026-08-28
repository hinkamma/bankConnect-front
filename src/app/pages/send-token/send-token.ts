import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, signal, ChangeDetectorRef } from '@angular/core';
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
  timeRemaining = signal(300);

  isLoading = false;
  isResending = false;
  tokenForm!: FormGroup;



  errorMessage: any;
  toastMessage: string = '';

  showToastFlag: boolean = false;
  toastType: 'error' | 'success' = 'error';

  private countdownInterval: any;
  private toastTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private fb: FormBuilder, private auth: Auth, private router: Router, private cdr:ChangeDetectorRef) {
    this.tokenForm = fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
    this.router = router;
  }


  ngOnInit(): void {
    this.startCountdown();
  }

  ngOnDestroy(): void {
    // Nettoyage indispensable pour éviter les fuites mémoire
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
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



  showToast(message: string, type: 'error' | 'success' = 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToastFlag = true;

    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    this.toastTimeout = setTimeout(() => {
      this.showToastFlag = false;
      this.cdr.detectChanges();
    }, 3000);
  }


  onSubmit(): void {
    if (this.tokenForm.invalid) {
      this.tokenForm.markAllAsTouched();
      return;
    }
    // 1. Récupération propre du user_id
    const rawUserId = localStorage.getItem("user_id");
    const UserId = rawUserId ? Number(rawUserId) : null;

    // 2. Sécurité : Si l'ID est nul ou invalide, on ne fait pas la requête HTTP
    if (!UserId || isNaN(UserId)) {
      this.showToast("Session expirée ou utilisateur introuvable. Veuillez vous re-connecter.","error");
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;
    this.tokenForm.disable({ emitEvent: false });

    const CodeSaisi = this.tokenForm.get('code')?.value ?? '';

    this.auth.SendToken({ user_id: UserId, token: CodeSaisi }).pipe(
      finalize(() => {
        this.isLoading = false;
        this.tokenForm.enable({ emitEvent: false });
      })
    )
    .subscribe({
      next: (response) => {
        this.showToast('Validation réussie !', 'success');

        setTimeout(() => {
          if (response.hasAccount) {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/accountTypeSelection']);
          }
        }, 3000);
      },
      error: (error) => {
        const message = error.error?.message || error.error?.back_flash || 'Une erreur est survenue, veuillez réessayer.';
        this.showToast(message, "error");
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
      this.showToast('Session invalide, veuillez recommencer l\'inscription.',"error");
      return;
    }

    this.isResending = true;

    this.auth.resendCode(UserId).pipe(
      finalize(() => {
        this.isResending = false;
      })
    )
    .subscribe({
      next: (response) => {
        this.showToast(response?.message ?? 'Un nouveau code a été envoyé.', "success");
        this.timeRemaining.set(60);
        this.startCountdown();
      },
      error: (error) => {
        const message = error.error?.message || 'Impossible de renvoyer le code, réessayez.';
        this.showToast(message, "error");
        console.log(error);
      }
    });
  }
}
