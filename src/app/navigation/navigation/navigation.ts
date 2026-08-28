import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgIf } from "@angular/common";
import { finalize } from 'rxjs';
import { Auth } from '../../services/auth';
import { ProfilService } from '../../services/profil-service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterModule, NgIf,],
  templateUrl: './navigation.html',
  styleUrl: './navigation.less',
})
export class Navigation implements OnInit {

  //  Chargement instantané (0 ms d'attente !)
  user = signal<{ first_name: string; profile_photo: string } | null>(null);

  showLogoutConfirm = false;
  isLoggingOut = false;

  // Propriété pour stocker les infos reçues du ProfilService
  userAccount: any = null;

  constructor(
    private auth: Auth,
    private router: Router,
    private profil: ProfilService,
    private cdr :ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userConnect();
    this.loadUserFromStorage();
    this.cdr.detectChanges();
  }

  loadUserFromStorage(): void {
    const savedUser = localStorage.getItem('user_display');

    if (savedUser) {
      this.user.set(JSON.parse(savedUser));
    }
    console.log("afficharge de la data: ",this.user())
  }


  userConnect(): void {
    // Récupération de l'ID utilisateur (depuis localStorage ou token)
    const userId = Number(localStorage.getItem('user_id')) || 1;

    this.profil.display_account(userId).subscribe({
      next: (response: any) => {
       const accounts = response.data || [];

      // 1. Chercher spécifiquement le compte 'courant', sinon prendre le premier par défaut
      this.userAccount = accounts.find((acc: any) => acc.type === 'courant') || accounts[0];
      this.userAccount=this.userAccount
      console.log('Compte actif :', this.userAccount);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération du profil :', err);
      }
    });
  }


  confirmLogout(): void {
    this.isLoggingOut = true;
    this.auth.logout().pipe(
      finalize(() => {
        this.isLoggingOut = false;
        this.showLogoutConfirm = false;
      })
    ).subscribe({
      next: () => {
        localStorage.removeItem('token');
        this.router.navigate(['/accountSelection']);
      },
      error: (err) => {
        console.log('Message Laravel:', err.error);
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    });
  }
}
