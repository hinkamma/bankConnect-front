import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VirementService {

  private apiUrl=environment.apiUrl
  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    };
  }

  /**
   * Ajoute un nouveau bénéficiaire
   * Route: POST /add_beneficiaires
   */
  addBeneficiary(payload: { account_number: string; nickname?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add_beneficiaires`, payload, {
      headers: this.getHeaders()
    });
  }

  /**
   * Récupère la liste des bénéficiaires
   */
  getBeneficiaries(token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any>(`${this.apiUrl}/Lister_beneficiaires`, { headers });
  }



  updateBeneficiary(id: number, payload: { nickname?: string }, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<any>(`${this.apiUrl}/Update_beneficiaires`, payload, { headers });
  }

  /**
   * Supprimer un bénéficiaire
   * Route : DELETE /Delete_beneficiaires/{id}
   */
  deleteBeneficiary(id: number, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.delete<any>(`${this.apiUrl}/Delete_beneficiaires/${id}`, { headers });
  }

  //permet de recuperer les compte de lutilisateur qui souhaite effectuer un virement
  getAccounts(id: number, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<any>(`${this.apiUrl}/display_account/${id}`, { headers });
  }

  // permet de faire le depot

  deposit(payload: { account_id: number; montant: number; description?: string }, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<any>(`${this.apiUrl}/deposite`, payload, { headers });
  }

    /**
   * Effectue un virement vers un bénéficiaire
   * Route : POST /bank_transfert
   */
  bankTransfer(payload: { source_account_id: number; account_number_dest: string; amount: number; description?: string }, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<any>(`${this.apiUrl}/bank_transfert`, payload, { headers });
  }


  programmerVirement(payload: { source_account_id: number; account_number_dest: string; amount: number; scheduled_date: string; description?: string }, token: string): Observable<any> {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });


    return this.http.post<any>(`${this.apiUrl}/virements-programmes`, payload, {
      headers
    });
  }


}
