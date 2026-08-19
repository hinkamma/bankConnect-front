
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AccountItem, ProfilService } from '../../services/profil-service';


@Component({
  selector: 'app-account-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-selection.html',
  styleUrl: './account-selection.less',
})
export class AccountSelection implements OnInit {
  accounts = signal<AccountItem[]>([]);
  isLoading = signal(false);

  private typeLabels: Record<string, string> = {
    courant: 'Compte courant',
    epagne: 'Compte épargne',
    pro: 'Compte professionnel',
  };

  constructor(private profil: ProfilService, private router:Router) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  goToRegiter(){
    localStorage.clear();
    this.router.navigate(['/register']);
  }

  goToLogin(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  loadAccounts(): void {
    const userId = Number(localStorage.getItem('user_id'));
    this.isLoading.set(true);
    if (!userId) {
      return;
    }


    this.profil.display_account(userId).subscribe({
      next: (res) => {
        console.log("Réponse brute complète:", res.data);
        this.accounts.set(res.data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des comptes :', error);
        this.isLoading.set(false);
      }
    });
  }

  getTypeLabel(type: string): string {
    return this.typeLabels[type] ?? type;
  }

  maskAccountNumber(accountNumber: string): string {
    const last4 = accountNumber.slice(-4);
    return `•••• •••• ${last4}`;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
