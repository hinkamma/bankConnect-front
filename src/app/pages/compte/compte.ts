import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Navigation } from './../../navigation/navigation/navigation';
import { AccountService } from '../../services/account-service';

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

  //  Signal de chargement global de la page
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

  constructor(private fb: FormBuilder,private accountService :AccountService, private cdr:  ChangeDetectorRef) {
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
      this.cdr.detectChanges()
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
      // Ajuste 'response.data' ou 'response' selon la structure retournée par Laravel
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
   * Gestion du clic sur la validation du formulaire
   */
  onSubmitCreateAccount(): void {
    if (this.createAccountForm.invalid) {
      this.createAccountForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    // Données prêtes à être envoyées à ton endpoint Laravel
    const formData = this.createAccountForm.value;

    this.accountService.openAccount(this.createAccountForm.value).subscribe({
      next: (response) => {

        this.isSubmitting.set(false);
        this.closeCreateAccountModal();

        console.log('Compte créé avec succès !', response.message);
        this.showToast(response.message, 'success');
      },
      error: (error) => {

        this.isSubmitting.set(false);

         this.showToast(error.error.message, 'error');
      }
    });

    // Simulation avant la connexion avec l'endpoint
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.closeCreateAccountModal();
    }, 1000);
  }
}
