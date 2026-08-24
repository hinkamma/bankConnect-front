import { Component, OnInit, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Navigation } from '../../navigation/navigation/navigation';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { VirementService } from '../../services/virement-service';

@Component({
  selector: 'app-virement',
  imports: [Navigation, ReactiveFormsModule, CommonModule],
  standalone: true,
  templateUrl: './virement.html',
  styleUrl: './virement.less',
})
export class Virement implements OnInit {

  //  Signal de chargement global de la page
  isLoading = signal<boolean>(true);

  transferType = signal<'beneficiary' | 'self'>('beneficiary');

  // Gestion Virement Programmé vs Immédiat
  isProgrammed: boolean = false;

  showAddBeneficiaryModal = signal<boolean>(false);
  isSubmittingBeneficiary = signal<boolean>(false);
  isSubmittingTransfer = signal<boolean>(false);

  errorMessage: any;
  toastMessage: string = '';

  showToastFlag: boolean = false;
  toastType: 'error' | 'success' = 'error';

  // Signal pour la liste des comptes sources
  sourceAccounts = signal<any[]>([]);

  // Signal pour modifier un bénéficiaire
  editingBeneficiary = signal<any | null>(null);

  beneficiaries = signal<any[]>([]);

  addBeneficiaryForm: FormGroup;
  virementForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private virementService: VirementService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.addBeneficiaryForm = this.fb.group({
      account_number: ['', [Validators.required]],
      nickname: ['']
    });

    this.virementForm = this.fb.group({
      source_account_id: ['', Validators.required],
      account_number_dest: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      scheduled_date: [''], //Champ date pour le virement programmé
      description: ['']
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadBeneficiaries();
      this.loadUserAccounts();
    }
  }

  showToast(message: string, type: 'error' | 'success' = 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToastFlag = true;

    setTimeout(() => {
      this.showToastFlag = false;
    }, 3000);
  }

  // Méthode pour changer d'onglet (Vers bénéficiaire / Entre mes comptes)
  setTransferType(type: 'beneficiary' | 'self'): void {
    this.transferType.set(type);

    const beneficiaryControl = this.virementForm.get('account_number_dest');
    if (type === 'self') {
      beneficiaryControl?.clearValidators();
    } else {
      beneficiaryControl?.setValidators([Validators.required]);
    }
    beneficiaryControl?.updateValueAndValidity();
  }

  // Méthode pour basculer entre Immédiat et Programmé
  toggleProgrammed(status: boolean): void {
    this.isProgrammed = status;
    const scheduledControl = this.virementForm.get('scheduled_date');

    if (this.isProgrammed) {
      scheduledControl?.setValidators([Validators.required]);
    } else {
      scheduledControl?.clearValidators();
      scheduledControl?.setValue('');
    }
    scheduledControl?.updateValueAndValidity();
  }

  getSelectedAccount() {
    const accountId = this.virementForm.get('source_account_id')?.value;
    return this.sourceAccounts().find(acc => acc.id === Number(accountId));
  }

  getSelectedBeneficiary() {
    const accountNumber = this.virementForm.get('account_number_dest')?.value;
    return this.beneficiaries().find(b => b.account_number === accountNumber);
  }

  getAmount(): number {
    return Number(this.virementForm.get('amount')?.value) || 0;
  }

  getFees(): number {
    const amount = this.getAmount();

    if (!amount || this.transferType() === 'self') {
      return 0;
    }

    const feePercentage = 0.01; // 1%
    return Math.round(amount * feePercentage);
  }

  getTotalAmount(): number {
    return this.getAmount() + this.getFees();
  }

  // Soumission du virement (Immédiat, Programmé, ou Dépôt)
  onSubmitVirement(): void {
    if (this.virementForm.invalid) {
      this.virementForm.markAllAsTouched();
      return;
    }

    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') || '' : '';

    if (!token) return;

    this.isSubmittingTransfer.set(true);
    const formValues = this.virementForm.value;

    // 1. MODE DÉPÔT / ENTRE MES COMPTES
    if (this.transferType() === 'self') {
      const depositPayload = {
        account_id: Number(formValues.source_account_id),
        montant: Number(formValues.amount),
        description: formValues.description
      };

      this.virementService.deposit(depositPayload, token).subscribe({
        next: (res) => {
          this.isSubmittingTransfer.set(false);
          this.showToast(res.message, 'success');
          this.loadUserAccounts();
          this.virementForm.reset();
        },
        error: (err) => {
          this.isSubmittingTransfer.set(false);
          this.showToast(err.error?.message || 'Erreur lors du dépôt', 'error');
        }
      });

    // 2. MODE VIREMENT PROGRAMMÉ
    } else if (this.isProgrammed) {
      const scheduledPayload = {
        source_account_id: Number(formValues.source_account_id),
        account_number_dest: this.getSelectedBeneficiary()?.account_number || formValues.account_number_dest,
        amount: Number(formValues.amount),
        scheduled_date: formValues.scheduled_date,
        description: formValues.description || undefined
      };

      this.virementService.programmerVirement(scheduledPayload, token).subscribe({
        next: (res) => {
          this.isSubmittingTransfer.set(false);
          this.loadUserAccounts();
          this.virementForm.reset();
          this.isProgrammed = false; // Réinitialise le toggle
          this.showToast(res.message || 'Virement programmé avec succès !', 'success');
        },
        error: (err) => {
          this.isSubmittingTransfer.set(false);
          const errorMsg = err.error?.message || err.error?.error || 'Erreur lors de la programmation du virement.';
          this.showToast(errorMsg, 'error');
        }
      });

    // 3. MODE VIREMENT IMMÉDIAT
    } else {
      const transferPayload = {
        source_account_id: Number(formValues.source_account_id),
        account_number_dest: this.getSelectedBeneficiary()?.account_number || formValues.account_number_dest,
        amount: Number(formValues.amount),
        description: formValues.description || undefined
      };

      this.virementService.bankTransfer(transferPayload, token).subscribe({
        next: (res) => {
          this.isSubmittingTransfer.set(false);
          this.loadUserAccounts();
          this.virementForm.reset();
          this.showToast(res.message, 'success');
        },
        error: (err) => {
          this.isSubmittingTransfer.set(false);
          const errorMsg = err.error?.message || err.error?.error || 'Erreur lors de l’exécution du virement.';
          this.showToast(errorMsg, 'error');
        }
      });
    }
  }

  loadUserAccounts(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const token = localStorage.getItem('token') || '';
    const userId = Number(localStorage.getItem('user_id'));

    if (!token || !userId) return;

    this.virementService.getAccounts(userId, token).subscribe({
      next: (response) => {
        const list = Array.isArray(response) ? response : (response.data || []);
        this.sourceAccounts.set(list);


        if (list.length > 0) {
          this.virementForm.patchValue({
            source_account_id: list[0].id
          });
        }

        this.isLoading.set(false)
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des comptes', err);

        this.isLoading.set(false)
      }
    });
  }

  onDeleteBeneficiary(id: number): void {
    if (!confirm('Voulez-vous vraiment supprimer ce bénéficiaire ?')) return;

    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') || '' : '';

    this.virementService.deleteBeneficiary(id, token).subscribe({
      next: (res) => {
        if (res.status !== false) {
          this.beneficiaries.update((list) => list.filter(b => b.id !== id));
          this.showToast(res.message, 'success');
        }
      },
      error: (err) => {
        console.error('Erreur de suppression :', err);
        this.showToast(err.message, 'error');
      }
    });
  }

  openEditBeneficiaryModal(beneficiary: any): void {
    this.editingBeneficiary.set(beneficiary);

    this.addBeneficiaryForm.patchValue({
      account_number: beneficiary.account_number,
      nickname: beneficiary.nickname
    });

    this.showAddBeneficiaryModal.set(true);
  }

  loadBeneficiaries(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const token = localStorage.getItem('token') || '';
    if (!token) return;

    this.virementService.getBeneficiaries(token).subscribe({
      next: (response) => {
        const list = Array.isArray(response) ? response : (response.data || []);
        this.beneficiaries.set(list);

      },
      error: (err) => {
        console.error('Erreur lors du chargement des bénéficiaires', err);


      }
    });
  }

  openAddBeneficiaryModal(): void {
    this.addBeneficiaryForm.reset();
    this.showAddBeneficiaryModal.set(true);
  }

  closeAddBeneficiaryModal(): void {
    this.showAddBeneficiaryModal.set(false);
  }

  onSubmitBeneficiary(): void {
    if (this.addBeneficiaryForm.invalid) {
      this.addBeneficiaryForm.markAllAsTouched();
      return;
    }

    this.isSubmittingBeneficiary.set(true);

    const payload = {
      account_number: this.addBeneficiaryForm.value.account_number,
      nickname: this.addBeneficiaryForm.value.nickname
    };

    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') || '' : '';

    this.virementService.addBeneficiary(payload).subscribe({
      next: (res) => {
        this.isSubmittingBeneficiary.set(false);
        this.loadBeneficiaries();

        setTimeout(() => {
          this.closeAddBeneficiaryModal();
        }, 1500);

        this.showToast(res.message, 'success');
      },
      error: (err) => {
        this.isSubmittingBeneficiary.set(false);
        const msg = err.error?.message || "Erreur lors de l'ajout du bénéficiaire.";
        this.showToast(msg, 'error');
      }
    });
  }
}
