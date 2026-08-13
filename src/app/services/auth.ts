
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';


interface LoginPayload {
  email: string;
  password: string;
}

export interface SendTokenPayload {
  user_id: number;
  token: string;
}


export interface LoginResponse {
  user_id: string;
  success: any;
  message: any;
  back_flash: any;
  token: string;
  email: string;
  id: number;
}


export interface RegisterPayload {
  name?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
  role: string;
  accept?: boolean;
}


@Injectable({
  providedIn: 'root'
})
export class Auth {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // *************cette fonction se charge d'envoyer les données de connexion a l'api
  login(data: LoginPayload): Observable<LoginResponse> {
    const payload = {
      email: data.email.trim(),
      password: data.password,
    };

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap((response) => {
        localStorage.setItem('user_id',response.user_id)
        localStorage.setItem('token', response.token);
      })
    );
  }

  //********** cette fonction se charge de envoyer les données d'un utilisateur a l'api************
  register(data: RegisterPayload): Observable<LoginResponse> {
    const firstName = (data.first_name ?? '').trim();
    const lastName = (data.last_name ?? '').trim();
    const phone = (data.phone ?? '').trim();
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

    const payload = {
      name: data.name ?? fullName,
      first_name: firstName,
      last_name: lastName,
      email: data.email,
      phone: phone || '',
      password: data.password,
      password_confirmation: data.password_confirmation,
      role: data.role,
      accept: data.accept ?? true,
    };

    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, payload).pipe(
      tap((response) => {
        if (response?.token) {
          localStorage.setItem('token', response.token);
          
        }
      })
    );
  }

  // ***********cette fonction se charge de réenvoiyer le token***************
  resendCode(userId: number): Observable<{ message: string }> {
    const tokenBearer = localStorage.getItem('token') ?? '';

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${tokenBearer}`,
      'Content-Type': 'application/json'
    });

    const payload = {
      user_id: userId
    };

    return this.http.post<{ message: string }>(
      `${this.apiUrl}/resend_code`,
      payload,
      { headers }
    );
  }

  //**************cette fonction se charge de 2FA*******************
  SendToken(data: SendTokenPayload): Observable<LoginResponse> {
    
    // 1. Récupérer le jeton de connexion stocké dans le navigateur
    const tokenBearer = localStorage.getItem('token') ?? '';

    // 2. Créer l'en-tête d'autorisation que Laravel attend
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${tokenBearer}`,
      'Content-Type': 'application/json'
    });

    // 3. Préparer le payload avec le code nettoyé d'éventuels espaces
    const payload = {
      user_id: data.user_id,
      token: data.token.trim(),
    };
    // 4. L'ERREUR ÉTAIT ICI : Il faut passer l'objet { headers } en troisième paramètre !
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/verify_code`, 
      payload, 
      { headers } // <-- On donne la clé d'accès à la requête HTTP
    ).pipe(
    tap((response) => {
      // Si l'API renvoie un nouveau token final après validation, on met à jour le stockage
      if (response?.token && response?.user_id) {
        localStorage.setItem('user_id',response.user_id)
        localStorage.setItem('token', response.token);
 
      }
    }));
  }


  logout(): Observable<{ message: string }> {
    const tokenBearer = localStorage.getItem('token') ?? '';

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${tokenBearer}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<{ message: string }>(
      `${this.apiUrl}/logout`,{},{ headers }
    );
  }

}