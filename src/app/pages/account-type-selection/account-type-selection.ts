import { Router } from '@angular/router';
import { Component, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';

type AccountType = 'courant' | 'epagne' | 'pro';

@Component({
  selector: 'app-account-type-selection',
  imports: [CommonModule],
  templateUrl: './account-type-selection.html',
  styleUrls: ['./account-type-selection.less'],
  standalone: true,
})
export class AccountTypeSelection {

  selectedType = signal<AccountType | null>(null);
  isLoading = signal(false);

  toastMessage = signal('');
  showToastFlag = signal(false);
  toastType = signal<'error' | 'success'>('error');

  constructor(private auth: Auth, private router: Router) {}

  selectType(type: AccountType): void {
    this.selectedType.set(type);
  }

  showToast(message: string, type: 'error' | 'success' = 'error') {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.showToastFlag.set(true);

    setTimeout(() => {
      this.showToastFlag.set(false);
    }, 5000);
  }

  onSubmit(): void {
    const type = this.selectedType();
    if (!type) {
      return;
    }

    this.isLoading.set(true);

    this.auth.selectTypeCompte(type)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
          console.log('spinner a false');
        })
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
          console.log("correct dans le next");
        },
        error: (error) => {
          const message = error.error?.message ?? 'Une erreur est survenue, veuillez réessayer.';
          this.showToast(message, 'error');
          console.log(message);
        }
      });
  }
}
