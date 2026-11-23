import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { LocalstorageService } from './localstorage.service';

export const authGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const ls = inject(LocalstorageService);
  const router = inject(Router);

  const token = ls.getItem('accessToken');
  const userDataStr = ls.getItem('userData');

  if (!token || !userDataStr) {
    return router.parseUrl('/login');
  }

  let user: any;
  try {
    user = JSON.parse(userDataStr);
  } catch (e) {
    console.error('Error al parsear userData', e);
    return router.parseUrl('/login');
  }



  const allowedRoles: number[] = route.data['roles'] || [];

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.idTipoUsr)) {
    console.warn(`Acceso denegado para el rol ${user.idTipoUsr}`);
    return router.parseUrl('/denegado');
  }

  // ✔️ Acceso permitido
  return true;
};
