import { Component, OnInit, signal, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfilService } from '../../services/profil-service';
import { Navigation } from '../../navigation/navigation/navigation';
import { finalize } from 'rxjs';
import { VirementService } from '../../services/virement-service';

type ActionType = 'virement' | 'depot' | 'retrait' | 'factures' | null;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, Navigation],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.less',
})
export class Dashboard implements OnInit {


  // Signals principaux
  isLoading = signal<boolean>(true);
  accounts = signal<any[]>([]);
  primaryAccount = signal<any | null>(null);
  user = signal<any | null>(null);
  avatarPreview = signal<string | null>(null);

  // Signal pour la liste des bénéficiaires
  beneficiaries = signal<any[]>([]);

  // Signals pour la modale
  activeModal = signal<ActionType>(null);
  isLoadingActionData = signal<boolean>(false);
  isSubmittingAction = signal<boolean>(false);

  // Structure des données à envoyer lors du virement
  virementForm = {
    accountFromId: '',    // ID ou numéro du compte à débiter
    beneficiaryId: '',    // ID ou numéro de compte du bénéficiaire sélectionné
    amount: null as number | null,
    reason: ''            // Motif / libellé du virement
  };

  private platformId = inject(PLATFORM_ID);

  constructor(private profilService: ProfilService, private virementService: VirementService) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadDashboardData();
      this.loadProfilPhoto();
    } else {
      this.isLoading.set(false);
    }
  }

  loadBeneficiaries(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const token = localStorage.getItem('token') || '';
    if (!token) return;

    this.virementService.getBeneficiaries(token).subscribe({
      next: (response) => {
        const list = Array.isArray(response) ? response : (response.data || []);
        this.beneficiaries.set(list);
        this.isLoadingActionData.set(false);
        console.log(this.beneficiaries())
      },
      error: (err) => {
        console.error('Erreur lors du chargement des bénéficiaires', err);
        this.isLoadingActionData.set(false);

      }
    });
  }

  loadDashboardData(): void {
    const userId = Number(localStorage.getItem('user_id'));

    if (!userId) {
      this.isLoading.set(false);
      return;
    }

    this.profilService.display_account(userId)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: (res: any) => {
          const list = res.accounts ?? res.data ?? [];
          this.accounts.set(list);

          if (list.length > 0) {
            this.primaryAccount.set(list[0]);
            this.user.set(list[0].user ?? null);
          }
        },
        error: (err) => console.error('Erreur chargement dashboard:', err)
      });
  }

  loadProfilPhoto(): void {
    this.profilService.getProfilPhoto().subscribe({
      next: (res) => {
        if (res?.data) {
          this.avatarPreview.set(res.data as unknown as string);
        }
      },
      error: (err) => console.error('Erreur photo:', err)
    });
  }


  openActionModal(type: ActionType): void {
    this.activeModal.set(type);
    this.isLoadingActionData.set(true);

    // Reset du formulaire
    this.virementForm = {
      accountFromId: '',
      beneficiaryId: '',
      amount: null,
      reason: ''
    };

    // Pré-sélection du compte émetteur par défaut
    if (this.accounts().length > 0) {
      const firstAcc = this.accounts()[0];
      this.virementForm.accountFromId = firstAcc.id || firstAcc.account_number;
    }


    if (type === 'virement') {
      this.loadBeneficiaries();
    }

    setTimeout(() => {
      this.isLoadingActionData.set(false);
    }, 300);
  }

  closeModal(): void {
    this.activeModal.set(null);
  }

  submitVirement(): void {
    if (!this.virementForm.accountFromId || !this.virementForm.beneficiaryId || !this.virementForm.amount) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    this.isSubmittingAction.set(true);

    // Données prêtes à envoyer à Laravel API
    const payload = {
      account_from_id: this.virementForm.accountFromId,
      beneficiary_id: this.virementForm.beneficiaryId,
      amount: this.virementForm.amount,
      reason: this.virementForm.reason
    };

    console.log('Payload du virement à envoyer :', payload);

    // Appel vers ton service backend Laravel
    /*
    this.profilService.makeTransfer(payload).subscribe({
      next: (res) => {
        this.isSubmittingAction.set(false);
        this.closeModal();
        alert('Virement effectué avec succès !');
        this.loadDashboardData();
      },
      error: (err) => {
        this.isSubmittingAction.set(false);
        alert(err?.error?.message || 'Erreur lors du virement.');
      }
    });
    */

    setTimeout(() => {
      this.isSubmittingAction.set(false);
      this.closeModal();
      alert('Virement effectué avec succès !');
      this.loadDashboardData();
    }, 1000);
  }

  // --- HELPERS ---

  getTotalBalance(): number {
    return this.accounts().reduce((acc, curr) => acc + Number(curr.balance || curr.solde || 0), 0);
  }

  getUserInitials(): string {
    const u = this.user();
    if (!u) return 'BC';
    const first = u.first_name?.charAt(0) || '';
    const last = u.last_name?.charAt(0) || '';
    return `${first}${last}`.toUpperCase();
  }
}
