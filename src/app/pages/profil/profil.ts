import { Beneficiaire, ProfilResponse } from './../../services/profil-service';
import { Component, OnInit, signal, ViewChild, ElementRef, PLATFORM_ID, inject, ChangeDetectorRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ProfilService } from '../../services/profil-service';
import { Navigation } from "../../navigation/navigation/navigation";
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, Navigation, ReactiveFormsModule],
  templateUrl: './profil.html',
  styleUrl: './profil.less',
})
export class Profil implements OnInit {
  @ViewChild('avatarInput') avatarInput!: ElementRef<HTMLInputElement>;

  beneficiaires = signal<Beneficiaire[]>([]);

  totalBeneficiaires = computed(() => this.beneficiaires().length);


  // Signal pour contrôler l'ouverture de la modale d'e-mail
  showEmailModal = signal<boolean>(false);


  //  Signal de chargement global de la page
    isLoading = signal<boolean>(true);

  errorMessage: any;
  toastMessage: string = '';

  showToastFlag: boolean = false;
  toastType: 'error' | 'success' = 'error';


  // ===== Données du compte =====
  accountInfo = signal<any | null>(null);
  isLoadingInfo = signal(false);

  // ===== Avatar =====
  avatarPreview = signal<string | null>(null);
  isUploadingAvatar = signal(false);

  // ===== Modal d'édition des infos personnelles =====
  showEditModal = signal(false);
  isSaving = signal(false);
  editForm: FormGroup;

  // ===== Modal de modification du mot de passe =====
  showPasswordModal = signal(false);
  isSavingPassword = signal(false);
  passwordForm: FormGroup;


  private platformId = inject(PLATFORM_ID);

  // signal pour trouver le nombre de compte de lutilisateur connecté
  accountsCount = signal(0);

  constructor(private profil: ProfilService, private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    this.editForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      adress: [''],
    });

    // Formulaire de modification de mot de passe
    this.passwordForm = this.fb.group({
      current_password: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', Validators.required],
    });
  }

  ngOnInit(): void {

    if (isPlatformBrowser(this.platformId)) {
      this.loadAccountInfo();
      this.loadProfilPhoto();
      this.chargerBeneficiaires()
    }


  }

  openEmailModal(): void {
  this.showEmailModal.set(true);
  }

  closeEmailModal(): void {
    this.showEmailModal.set(false);
  }

  chargerBeneficiaires(): void {
    this.isLoading.set(true);

    this.profil.getBeneficiaires().subscribe({
      next: (data: any) => {
        const liste = Array.isArray(data) ? data : (data.beneficiaires || data.data || []);
        this.beneficiaires.set(liste);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des bénéficiaires', err);
        this.isLoading.set(false);
      }
    });
  }

  formatActivityDate(dateString: string | null | undefined): string {
  if (!dateString) return 'Jamais';

  // 1. Conversion de la chaîne en objet Date (compatibilité Safari/Mobile)
  const date = new Date(dateString.replace(' ', 'T'));
  const now = new Date();

  // Différence globale en millisecondes et en jours
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // Heure au format HH:mm (ex: 08:47)
  const time = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // 2. Gestion des jours calendaires (Aujourd'hui / Hier)
  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return `Aujourd'hui à ${time}`;
  }

  if (isYesterday) {
    return `Hier à ${time}`;
  }

  // 3. Moins d'une semaine (ex: "Il y a 3 jours à 14:20")
  if (diffInDays < 7) {
    return `Il y a ${diffInDays} jours à ${time}`;
  }

  // 4. Moins d'un mois (ex: "Il y a 2 semaines")
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInDays < 30) {
    return `Il y a ${diffInWeeks} ${diffInWeeks > 1 ? 'semaines' : 'semaine'}`;
  }

  // 5. Dates plus anciennes (ex: "Le 12 juillet 2026")
  const fullDate = date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return `Le ${fullDate}`;
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


  onSubmitEditInforPerso(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      this.showToast("Veuillez remplir correctement tous les champs", 'error');
      return;
    }

    this.isSaving.set(true);

    // Appel du service ProfilService
    this.profil.updateProfilePerso(this.editForm.value)
      .pipe(
        finalize(() => {
          this.isSaving.set(false);
        })
      )
      .subscribe({
        next: (response: any) => {

          this.showEditModal.set(false);
          this.showToast(response.message ?? 'Informations mises à jour avec succès.', 'error');
          this.loadAccountInfo(); // Recharger les infos affichées sur la page
        },
        error: (error) => {
          let message = 'Impossible de mettre à jour vos informations.';

          console.log(error)
          if (error.error?.errors) {
            const firstKey = Object.keys(error.error.errors)[0];
            message = error.error.errors[firstKey][0];
          } else if (error.error?.message) {
            message = error.error.message;
          }
          this.showToast(message, 'error');
        }
      });
  }

  loadProfilPhoto(): void {
    this.profil.getProfilPhoto().subscribe({
      next: (res) => {
        console.log("Réponse complète :", res);

        if (res?.data) {
          // Forcer TypeScript à accepter res.data comme une string

          this.avatarPreview.set(res.data as unknown as string);

          console.log("photo: ",res)

        } else {
          this.avatarPreview.set(null);
        }




      },
      error: (error) => {
        console.error('Erreur lors du chargement de la photo :', error);
      }
    });
  }

  // formatage de la date
  formatDateFr(dateString: string): string {
    const date = new Date(dateString);

    const mois = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];

    const jour = date.getDate();
    const nomMois = mois[date.getMonth()];
    const annee = date.getFullYear();

    return `${jour} ${nomMois} ${annee}`;
  }

    loadAccountInfo(): void {
    const userId = Number(localStorage.getItem('user_id'));

    // Sécurité si pas de user_id dans le localStorage
    if (!userId) {
      console.warn('Aucun User ID trouvé dans le localStorage');
      return;
    }

    this.isLoadingInfo.set(true);

    this.profil.display_account(userId)
      .pipe(
        finalize(() => {
          this.isLoadingInfo.set(false);
        })
      )
      .subscribe({
        next: (res: any) => {
          const accounts = res.accounts ?? res.data ?? [];
          this.accountsCount.set(accounts.length);

          console.log("result :", accounts);
          const account = accounts[0] ?? null;
          this.accountInfo.set(account);

          this.isLoading.set(false)
        },
        error: (error) => {
          console.error('Erreur lors du chargement du profil :', error);
          this.showToast('Impossible de charger vos informations.', 'error');
          this.isLoading.set(false)
        }
      });
  }
  // ===== Gestion de l'avatar =====

  triggerAvatarInput(): void {
    this.avatarInput.nativeElement.click();
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const maxSizeInBytes = 3 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      this.showToast('L\'image ne doit pas dépasser 3 Mo.', 'error');
      input.value = '';
      return;
    }

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      this.showToast('Format d\'image non supporté (PNG, JPG ou WEBP uniquement).', 'error');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.avatarPreview.set(reader.result as string);
    };
    reader.readAsDataURL(file);

    this.isUploadingAvatar.set(true);

    this.profil.updateAvatar(file)
      .pipe(
        finalize(() => {
          this.isUploadingAvatar.set(false);
        })
      )
      .subscribe({
        next: (response: any) => {
          this.showToast('Photo de profil mise à jour.', 'success');
        },
        error: (error) => {
          const message = error.error?.message ?? 'Impossible de mettre à jour la photo.';
          this.showToast(message, 'error');
          this.avatarPreview.set(null);
        }
      });

    input.value = '';
  }

  // ===== Gestion de la modal d'édition =====

  openEditModal(): void {
    const info = this.accountInfo();
    console.log(info);
    if (info) {
      this.editForm.patchValue({
        first_name: info.first_name ?? info.user?.first_name ?? '',
        last_name: info.last_name ?? info.user?.last_name ?? '',
        email: info.email ?? info.user?.email ?? '',
        phone: info.phone ?? info.user?.phone ?? '',
        adress: info.adress ?? info.user.adress ?? '',
      });
    }
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
  }

  onSubmitEdit(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    this.profil.updateProfilePerso(this.editForm.value)
      .pipe(
        finalize(() => {
          this.isSaving.set(false);
        })
      )
      .subscribe({
        next: (response: any) => {
          this.showEditModal.set(false);
          this.showToast(response.message ?? 'Informations mises à jour avec succès.', 'success');

          // Recharge les données affichées dans la page
          this.loadAccountInfo();
        },
        error: (error) => {
          // Extraction précise de l'erreur
          let message = 'Impossible de mettre à jour vos informations.';
          if (error.error?.errors) {
            const firstKey = Object.keys(error.error.errors)[0];
            message = error.error.errors[firstKey][0];
          } else if (error.error?.message) {
            message = error.error.message;
          }
          // this.showToast(message, 'error');
        }
      });
  }

  // ===== Gestion de la modal du mot de passe =====

  openPasswordModal(): void {
    this.passwordForm.reset();
    this.showPasswordModal.set(true);
  }

  closePasswordModal(): void {
    this.showPasswordModal.set(false);
  }

  onSubmitPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      this.showToast('Veuillez remplir correctement tous les champs.', 'error');
      return;
    }

    const { password, password_confirmation } = this.passwordForm.value;

    if (password !== password_confirmation) {
      this.showToast('Le nouveau mot de passe et la confirmation ne correspondent pas.', 'error');
      return;
    }

    this.isSavingPassword.set(true);

    this.profil.updatePassword(this.passwordForm.value)
      .pipe(
        finalize(() => {
          this.isSavingPassword.set(false);
        })
      )
      .subscribe({
        next: (response: any) => {

          this.showPasswordModal.set(false);
          this.showToast(response.message ?? 'Mot de passe modifié avec succès.', 'success');
        },
        error: (error) => {
          let message = 'Impossible de modifier le mot de passe.';
          if (error.error?.errors) {
            const firstKey = Object.keys(error.error.errors)[0];
            message = error.error.errors[firstKey][0];
          } else if (error.error?.message) {
            message = error.error.message;
          }
          this.showToast(message, 'error');
        }
      });
  }
}
