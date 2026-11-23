import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Ciudad, Municipio, LibroReco, LibroDetalle } from '../../models/alphaSystem.models';
import { Genero } from '../../models/alphaSystem.models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  public urlImagenes = 'http://localhost:8000';
  public baseUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // ---------- USUARIOS ----------
  getUsuarios(): Observable<any> {
    return this.http.get(`${this.baseUrl}/usuarios`);
  }

  getUsuario(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/usuarios/${id}`);
  }

  createUsuario(data: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuarios`, data);
  }
  
  updateUsuario(id: number, data: FormData): Observable<any> {
    // Usa put() para que el navegador ponga el multipart/form-data
    return this.http.post(
      `${this.baseUrl}/usuarios/${id}`,
      data
    );
  }

  deleteUsuario(id: number): Observable<any> {
    return this.http.request('delete', `${this.baseUrl}/usuarios`, { body: { id } });
  }

  getUsuarioByCorreo(correo: string): Observable<any> {
  const url = `${this.baseUrl}/usuarios/correo/${encodeURIComponent(correo)}`;
  return this.http.get<any>(url);
  }

  // ---------- LIBROS ----------
  getLibros(): Observable<any> {
    return this.http.get(`${this.baseUrl}/libros`);
  }

  getLibro(isbn: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/libros/${isbn}`);
  }

  createLibro(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/libros`, data);
  }

 updateLibro(isbn: string, data: FormData): Observable<any> {
  return this.http.post(`${this.baseUrl}/libros/${isbn}`, data);
}

eliminarLibroVirtual(isbn: string): Observable<any> {
  return this.http.put(`${this.baseUrl}/libros/eliminar-virtual`, { isbn });
}

restaurarLibro(isbn: string): Observable<any> {
  return this.http.put(`${this.baseUrl}/libros/restaurar`, { isbn });
}

generarSinopsis(titulo: string, autor: string): Observable<any> {
  return this.http.post(`${this.baseUrl}/generar-sinopsis`, {
    titulo,
    autor
  });
}


  // ---------- PRÉSTAMOS ----------
  getPrestamos(): Observable<any> {
    return this.http.get(`${this.baseUrl}/prestamos`);
  }

  createPrestamo(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/prestamos`, data);
  }


  deletePrestamo(data: any): Observable<any> {
    return this.http.request('delete', `${this.baseUrl}/prestamos`, { body: data });
  }

  

  // ---------- CIUDADES, ESTADOS, MUNICIPIOS, PAISES ----------
  getCiudades(): Observable<any> {
    return this.http.get(`${this.baseUrl}/ciudades`);
  }

  getEstados(): Observable<any> {
    return this.http.get(`${this.baseUrl}/estados`);
  }

  getMunicipios(): Observable<any> {
    return this.http.get(`${this.baseUrl}/municipios`);
  }

  getPaises(): Observable<any> {
    return this.http.get(`${this.baseUrl}/paises`);
  }

  getMunicipiosByEstado(idEstado: number): Observable<Municipio[]> {
    return this.getMunicipios().pipe(
      map((res: any) =>
        (res.data as Municipio[]).filter(m => m.idEstado === idEstado)
      )
    );
  }

  

  // ---------- GENEROS, ESTADOS LIBRO, TIPOS/ESTADOS USUARIO ----------
  getGeneros(): Observable<any> {
    return this.http.get(`${this.baseUrl}/generos`);
  }

  createGenero(data: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/generos`, data);
  }

  getGenero(idGenero: number) {
    return this.http
      .get<{ data: Genero }>(`${this.baseUrl}/generos/${idGenero}`)
      .pipe(map(res => res.data));
  }

  getEstadosLibro(): Observable<any> {
    return this.http.get(`${this.baseUrl}/estados-libro`);
  }

  getTiposUsuario(): Observable<any> {
    return this.http.get(`${this.baseUrl}/tipos-usuario`);
  }

  getEstadosUsuario(): Observable<any> {
    return this.http.get(`${this.baseUrl}/estados-usuario`);
  }

  // GET /api/prestamos/:id
getPrestamo(id: number): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/prestamos/${id}`);
}

// Actualiza un préstamo (multa o devuelto)
updatePrestamo(data: any): Observable<any> {
  return this.http.put<any>(`${this.baseUrl}/prestamos`, data);
}


marcarDevuelto1(id: number) {
  // Usamos el endpoint existente que SÍ tienes en backend
  return this.http.put<any>(`${this.baseUrl}/prestamos`, { id, devuelto: true });
}

marcarDevuelto(id: number) {
  return this.http.put<any>(`${this.baseUrl}/prestamo/devolver/${id}`, {});
}

pagarMulta(id: number) {
  return this.http.put<any>(`${this.baseUrl}/prestamo/${id}/pagar-multa`, {});
}

  getUserNames(): Observable<any> {
    return this.http.get(`${this.baseUrl}/usuarios/nombres`);
  }

  getBookTitles(): Observable<any> {
    return this.http.get(`${this.baseUrl}/libros/titulos`);
  }

  getLibroDesdeGoogle(titulo: string, autor: string): Observable<any> {
  const url = `${this.baseUrl}/libro/info`;
  return this.http.get(url, {
    params: {
      titulo,
      autor
    }
  });
}

recomendar(descripcion: string): Observable<LibroReco[]> {
    return this.http.post<{ ok: boolean; data: LibroReco[] }>(
      `${this.baseUrl}/libros/recomendar`,
      { descripcion },
      {
        headers: this.getAuthHeaders(), 
        withCredentials: true          
      }
    ).pipe(
      map(res => res.data ?? [])
    );
  }

 getHistorial(): Observable<{ desc: string; isbns: string[]; fecha: string }[]> {
    return this.http.get<{ ok: boolean; data: any[] }>(
      `${this.baseUrl}/libros/recomendar/historial`,
      {
        headers: this.getAuthHeaders(), 
        withCredentials: true
      }
    ).pipe(
      map(r => r.data ?? [])
    );
  }

 deleteHistorial(): Observable<boolean> {
    return this.http.delete<{ ok: boolean }>(
      `${this.baseUrl}/libros/recomendar/historial`,
      {
        headers: this.getAuthHeaders(), // ← y aquí
        withCredentials: true
      }
    ).pipe(
      map(r => !!r.ok)
    );
  }

  getLibrosByIsbns(isbns: string[]): Observable<LibroDetalle[]> {
  return this.http.post<{ ok: boolean; data: LibroDetalle[] }>(
    `${this.baseUrl}/libros/by-isbns`,
    { isbns },
    { withCredentials: true }
  ).pipe(map(r => r.data ?? []));
}

getMetrics(): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/prestamos/metrics`);
}

getLibroCompleto(titulo: string, autor: string): Observable<any> {
  return this.http
    .get<{ ok: boolean; data: any }>(
      `${this.baseUrl}/libro/info-completo`,
      { params: { titulo, autor } }
    )
    .pipe(
      map(res => res.ok ? res.data : null)
    );
}

}

