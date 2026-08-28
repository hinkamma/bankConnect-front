import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Navigation } from './../../navigation/navigation/navigation';
import { AccountService } from '../../services/account-service';

export interface TransactionGroup {
  dateLabel: string;
  items: any[];
}

@Component({
  selector: 'app-compte',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Navigation
  ],
  templateUrl: './compte.html',
  styleUrl: './compte.less',
})
export class Compte implements OnInit {

  // Signal de chargement global de la page
  isLoading = signal<boolean>(true);

  errorMessage: any;
  toastMessage: string = '';

  showToastFlag: boolean = false;
  toastType: 'error' | 'success' = 'error';

  selectedAccount = signal<any>(null);

  // Liste dynamique des comptes
  accounts = signal<any[]>([]);
  isLoadingAccounts = signal<boolean>(false);

  // Modal & Formulaire
  showCreateAccountModal = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  createAccountForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private cdr: ChangeDetectorRef
  ) {
    this.createAccountForm = this.fb.group({
      type: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadAccounts();
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

  selectAccount(acc: any): void {
    this.selectedAccount.set(acc);
  }

  /**
   * Charge la liste des comptes depuis Laravel
   */
  loadAccounts(): void {
    this.isLoadingAccounts.set(true);
    const id = Number(localStorage.getItem('user_id'));

    this.accountService.getAccounts(id).subscribe({
      next: (response) => {
        const list = Array.isArray(response) ? response : (response.data || response.accounts || []);

        // 1. Mise à jour de la liste
        this.accounts.set(list);

        // RE-SYNCHRONISATION DU COMPTE SELECTIONNE
        if (list.length > 0) {
          const currentId = this.selectedAccount()?.id;

          // Cherche le compte actif dans la nouvelle liste
          const updatedAccount = list.find((acc: any) => acc.id === currentId);

          // Si le compte existe toujours, on le met à jour avec les nouvelles données, sinon on prend le premier
          this.selectedAccount.set(updatedAccount || list[0]);
        } else {
          this.selectedAccount.set(null);
        }

        this.isLoadingAccounts.set(false);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des comptes :', error);
        this.isLoadingAccounts.set(false);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Ouvre la modal et réinitialise les champs du formulaire
   */
  openCreateAccountModal(): void {
    this.createAccountForm.reset({
      type: '',
    });
    this.showCreateAccountModal.set(true);
  }

  /**
   * Ferme la modal
   */
  closeCreateAccountModal(): void {
    this.showCreateAccountModal.set(false);
  }

  /**
   * Validation et soumission du formulaire de création de compte
   */
  onSubmitCreateAccount(): void {
    if (this.createAccountForm.invalid) {
      this.createAccountForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    this.accountService.openAccount(this.createAccountForm.value).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.closeCreateAccountModal();

        this.showToast(response.message || 'Compte créé avec succès !', 'success');

        // Rechargement automatique de la liste pour afficher le nouveau compte réactivement
        this.loadAccounts();
      },
      error: (error) => {
        this.isSubmitting.set(false);
        const errorMsg = error.error?.message || 'Erreur lors de la création du compte.';
        this.showToast(errorMsg, 'error');
      }
    });
  }

  /**
   * Regroupe les transactions par date : Aujourd'hui, Hier, ou Date spécifique
   */
  getGroupedTransactions(transactions: any[]): TransactionGroup[] {
    if (!transactions || transactions.length === 0) return [];

    const groups: { [key: string]: any[] } = {};

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    transactions.forEach(tx => {
      const dateStr = tx.created_at || tx.date;
      const txDate = dateStr ? new Date(dateStr) : new Date();
      let label = '';

      if (this.isSameDay(txDate, today)) {
        label = "Aujourd'hui";
      } else if (this.isSameDay(txDate, yesterday)) {
        label = "Hier";
      } else {
        label = txDate.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      }

      if (!groups[label]) {
        groups[label] = [];
      }
      groups[label].push(tx);
    });

    return Object.keys(groups).map(dateLabel => ({
      dateLabel,
      items: groups[dateLabel]
    }));
  }

  private isSameDay(d1: Date, d2: Date): boolean {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  }
}
