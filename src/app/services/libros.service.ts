import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LibrosService {
  private googleTranslateApiKey = 'API_KEY_AQUI'; // <-- tu clave aquí

  constructor(private http: HttpClient) {}

  /** Obtiene la sinopsis del libro desde Google Books por ISBN */
  getSinopsisPorISBN(isbn: string) {
    return this.http.get<any>(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`).pipe(
      map(res => {
        const desc = res?.items?.[0]?.volumeInfo?.description;
        return desc || 'Sin sinopsis disponible.';
      })
    );
  }

  /** Traduce un texto al español usando Google Translate API */
  traducirTexto(texto: string) {
    const url = `https://translation.googleapis.com/language/translate/v2?key=${this.googleTranslateApiKey}`;
    const body = {
      q: texto,
      target: 'es',
      format: 'text'
    };
    return this.http.post<any>(url, body).pipe(
      map(res => res.data.translations[0].translatedText)
    );
  }

  /** Sinopsis traducida */
  getSinopsisTraducidaPorISBN(isbn: string) {
    return this.getSinopsisPorISBN(isbn).pipe(
      switchMap(desc => this.traducirTexto(desc))
    );
  }
}
