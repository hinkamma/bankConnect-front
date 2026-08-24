
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface AccountItem {
  id: number;
  type: 'courant' | 'epagne' | 'pro';
  account_number: string;
  balance: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    adress:string;
  };
}

export interface AccountListResponse {
  data: AccountItem[];
}


export interface deviceResponse{
  status: boolean;
  id :number;
  name: string;
  last_used : Date;
  token :string;
  devices : deviceUser[];
}

export interface deviceUser{
  id : number;
  name : string;
  last_used_at : Date;
  is_current : boolean;
}


export interface ProfilData {
  id: number;
  first_name: string;
  last_name: string;
  name: string | null;
  username: string | null;
  email: string;
  email_verified_at: string | null;
  phone: string | null;
  gender: string | null;
  date_of_birth: string | null;
  place_of_birth: string | null;
  nationality: string | null;
  national_id: string | null;
  national_id_photo: string | null;
  profession: string | null;
  adress: string | null;
  city: string | null;
  country: string | null;
  profile_photo: string | null;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ProfilResponse {
  status: boolean;
  message: string;
  data: ProfilData;
}


@Injectable({
  providedIn: 'root',
})
export class ProfilService {

  private apiUrl = environment.apiUrl;


    constructor(private http: HttpClient) {}

  // **********cette fonction se charge de récupérer tous les appareils actifs sur ce compte*********
  display_all_users(): Observable<deviceResponse> {
    const tokenBearer = localStorage.getItem('token') ?? '';

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${tokenBearer}`
    });

    return this.http.get<deviceResponse>(
      `${this.apiUrl}/display_all_users`,
      { headers }
    ).pipe(
      tap((response) => {
        console.log("voici la reponse dans le tap",response.devices)
      })
    );
  }

  //cette fonction se charge de recuperer tous les comptes et utilisateur
  display_account(id: number): Observable<AccountListResponse> {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const payload = { id: id };

    return this.http.post<AccountListResponse>(
      `${this.apiUrl}/display_account/${id}`,
      payload,
      { headers }
    );
  }

  updateAvatar(file: File): Observable<{ message: string; avatar_url?: string }> {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
      // Ne PAS fixer 'Content-Type' ici — le navigateur le génère automatiquement
      // avec le bon "boundary" pour le multipart/form-data
    });

    const formData = new FormData();
    formData.append('profile_photo', file);

    return this.http.post<{ message: string; avatar_url?: string }>(
      `${this.apiUrl}/profil/photo`,
      formData,
      { headers }
    );
  }

  getProfilPhoto(): Observable<ProfilResponse> {
  const token = localStorage.getItem('token');

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  return this.http.get<ProfilResponse>(
    `${this.apiUrl}/profilShow`,
    { headers }
  );
}

  updateProfilePerso(data: { first_name: string; last_name: string; email: string; phone?: string; adress?: string }): Observable<any> {
    const token = localStorage.getItem('token');

    console.log(token)
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.put(`${this.apiUrl}/profilUpdate`, data, { headers });
  }


  updatePassword(data: { current_password: string; password: string; password_confirmation: string }): Observable<any> {
    const token = localStorage.getItem('token'); // Vérifie le nom de ta clé dans le localStorage

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.put(`${this.apiUrl}/updatePassword`, data, { headers });
  }
}
