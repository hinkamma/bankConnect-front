import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface OpenAccountPayload {
  type: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {

  }

  /**
   * Envoie la demande d'ouverture de compte à Laravel
   * Route: POST /open_account
   */
  openAccount(payload: OpenAccountPayload): Observable<any> {
    const token = localStorage.getItem('token') || localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    };

    return this.http.post<any>(`${this.apiUrl}/open_account`, payload, { headers });
  }


 /**
 * Récupère les comptes d'un utilisateur spécifique par son ID
 * Route: GET /display_account/{id}
 */
getAccounts(id: number): Observable<any> {
  const token = localStorage.getItem('token') || localStorage.getItem('token');
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  };

  return this.http.post<any>(`${this.apiUrl}/display_account/${id}`, { headers });
}
}
