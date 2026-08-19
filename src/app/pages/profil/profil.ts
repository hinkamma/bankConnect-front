import { ProfilResponse } from './../../services/profil-service';
import { Component, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ProfilService } from '../../services/profil-service';
import { Navigation } from "../../navigation/navigation/navigation";

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, Navigation, ReactiveFormsModule],
  templateUrl: './profil.html',
  styleUrl: './profil.less',
})
export class Profil implements OnInit {
  @ViewChild('avatarInput') avatarInput!: ElementRef<HTMLInputElement>;

  // ===== Données du compte =====
  accountInfo = signal<any | null>(null);
  isLoadingInfo = signal(false);

  // ===== Avatar =====
  avatarPreview = signal<string | null>(null);
  isUploadingAvatar = signal(false);

  // ===== Modal d'édition =====
  showEditModal = signal(false);
  isSaving = signal(false);
  editForm: FormGroup;

  // ===== Toast =====
  toastMessage = signal('');
  showToastFlag = signal(false);
  toastType = signal<'error' | 'success'>('error');

  // signal pour trouver le nombre de compte de lutilisateur connecté
  accountsCount = signal(0);

  constructor(private profil: ProfilService, private fb: FormBuilder) {
    this.editForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: [''],
    });
  }

  ngOnInit(): void {
    this.loadAccountInfo();
    this.loadProfilPhoto();

  }



  onSubmitEditInforPerso(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      this.showToast('Veuillez remplir correctement tous les champs.', 'error');
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
          console.log("nous sommes a ce niveau")
          this.showEditModal.set(false);
          this.showToast(response.message ?? 'Informations mises à jour avec succès.', 'success');
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
        } else {
          this.avatarPreview.set(null);
        }

        console.log("Résultat du signal :", this.avatarPreview());
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
    if (!userId) {
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


          this.accountInfo.set(accounts[0] ?? null);
          const account = res.accounts?.[0] ?? res.data?.[0] ?? null;
          this.accountInfo.set(account);

        },
        error: (error) => {
          console.error('Erreur lors du chargement du profil :', error);
          this.showToast('Impossible de charger vos informations.', 'error');
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
    if (info) {
      this.editForm.patchValue({
        first_name: info.first_name ?? info.user?.first_name ?? '',
        last_name: info.last_name ?? info.user?.last_name ?? '',
        email: info.email ?? info.user?.email ?? '',
        phone: info.phone ?? info.user?.phone ?? '',
        address: info.address ?? info.user?.address ?? '',
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

    this.profil.updateAvatar(this.editForm.value)
      .pipe(
        finalize(() => {
          this.isSaving.set(false);
        })
      )
      .subscribe({
        next: (response: any) => {
          this.showEditModal.set(false);
          this.showToast(response.message ?? 'Informations mises à jour avec succès.', 'success');
          this.loadAccountInfo(); // recharge les données affichées après modification
        },
        error: (error) => {
          const message = error.error?.message ?? 'Impossible de mettre à jour vos informations.';
          this.showToast(message, 'error');
        }
      });
  }

  // ===== Toast =====

  showToast(message: string, type: 'error' | 'success' = 'error') {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.showToastFlag.set(true);

    setTimeout(() => {
      this.showToastFlag.set(false);
    }, 5000);
  }
}
