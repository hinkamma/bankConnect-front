import { Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HistoryService, Transaction } from '../../services/history-service';
import { Navigation } from '../../navigation/navigation/navigation'; // Vérifie le chemin exact

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [CommonModule, Navigation],
  templateUrl: './historique.html',
  styleUrl: './historique.less',
})
export class Historique implements OnInit {

  transactions = signal<Transaction[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');

  //Signals pour la pagination
  currentPage = signal<number>(1);
  lastPage = signal<number>(1);

  constructor(
    private historyService: HistoryService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadHistory(1);
  }

  /**
   * Charge l'historique pour une page donnée
   */
  loadHistory(page: number = 1): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading.set(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Aucun jeton d’authentification trouvé.');
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);

    this.historyService.getHistoryOperations(token, page).subscribe({
      next: (response: any) => {
        console.log('Structure brute reçue :', response);

        // Traitement de la réponse paginée de Laravel
        if (response && response.status && response.data) {
          // Si response.data est un LengthAwarePaginator de Laravel
          if (Array.isArray(response.data.data)) {
            this.transactions.set(response.data.data);
            this.currentPage.set(response.data.current_page || 1);
            this.lastPage.set(response.data.last_page || 1);
          } else {
            this.transactions.set([]);
          }
        }
        // Fallback si la structure est directement { data: [...] }
        else if (response && Array.isArray(response.data)) {
          this.transactions.set(response.data);
          this.currentPage.set(1);
          this.lastPage.set(1);
        }
        else {
          this.transactions.set([]);
        }

        this.isLoading.set(false);
        console.log('Transactions injectées dans le signal :', this.transactions());
      },
      error: (err) => {
        console.error('Erreur lors de la récupération de l’historique :', err);
        this.errorMessage.set(err.error?.message || 'Impossible de charger l’historique.');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Naviguer vers la page précédente
   */
  previousPage(): void {
    if (this.currentPage() > 1) {
      this.loadHistory(this.currentPage() - 1);
    }
  }

  /**
   * Naviguer vers la page suivante
   */
  nextPage(): void {
    if (this.currentPage() < this.lastPage()) {
      this.loadHistory(this.currentPage() + 1);
    }
  }

  /**
   * Naviguer vers une page spécifique
   */
  goToPage(page: number): void {
    if (page !== this.currentPage() && page >= 1 && page <= this.lastPage()) {
      this.loadHistory(page);
    }
  }

  /**
   * Génère le tableau des numéros de pages [1, 2, 3...] pour l'affichage (*ngFor)
   */
  get pagesArray(): number[] {
    return Array.from({ length: this.lastPage() }, (_, i) => i + 1);
  }
}
