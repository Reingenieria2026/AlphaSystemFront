// auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpInterceptor, HttpRequest, HttpHandler, HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';  // ajusta la ruta
import { LocalstorageService } from './localstorage.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private ls: LocalstorageService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Solo accedemos al token si estamos en el navegador
    let token: string | null = null;
    if (typeof window !== 'undefined' && window.localStorage) {
      token = this.ls.getItem('token');
    }

    // Si hay token, clonamos la request con el header Authorization
    if (token) {
      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
      return next.handle(authReq);
    }

    // Si no hay token, enviamos la petición original
    return next.handle(req);
  }
}
