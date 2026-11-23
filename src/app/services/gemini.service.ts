import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  constructor(private http: HttpClient) {}

  generarSinopsisDesdeLaravel(titulo: string, autor: string): Observable<string> {
    const body = { titulo, autor };
    return this.http.post<{ sinopsis: string }>('http://localhost:8000/api/gemini-sinopsis', body).pipe(
      map(res => res.sinopsis)
    );
  }
}
