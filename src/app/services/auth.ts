import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface LoginPayload {
  email: string;
  password: string;
}


export interface LoginResponse {
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

  
  login(data: LoginPayload): Observable<LoginResponse> {
    const payload = {
      email: data.email.trim(),
      password: data.password,
    };

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap((response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify({ id: response.id, email: response.email }));
      })
    );
  }

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
}