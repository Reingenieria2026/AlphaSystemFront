import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HttpLaravelService {
  private apiUrl = 'http://localhost:8000/api'; // Cambia si tu backend usa otro host/puerto

  constructor(private http: HttpClient) {}

  login(credentials: { correoUsr: string; contrasena: string }): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/login`,
      credentials,
      {
        withCredentials: true    // ← para que guarde la nueva cookie reco_id
      }
    );
  }

  logout(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/logout`,
      {},
      {
        headers: this.getAuthHeaders(),
        withCredentials: true    
      }
    );
  }

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
} 
