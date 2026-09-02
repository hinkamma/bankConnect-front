import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Interface pour typer correctement une transaction
export interface Transaction {
  id: number;
  reference: string;
  sens: 'DEBIT' | 'CREDIT';
  montant: string;
  type: string;
  description: string | null;
  statut: string;
  date: string;
  partenaire: any; // Ajuste le type si le partenaire contient des champs spécifiques (ex: { name: string })
}

// Interface pour la réponse globale de Laravel
export interface HistoryResponse {
  status: boolean;
  data: Transaction[];
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  private apiUrl = environment.apiUrl


  constructor(private http: HttpClient) {}

  getHistoryOperations(token: any, page:number): Observable<HistoryResponse> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });

    return this.http.get<HistoryResponse>(`${this.apiUrl}/history_operations?page=${page}`, { headers });
  }
}
