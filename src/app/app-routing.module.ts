import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './auth.guard';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: ()=>import('./acceso/login.module').then(m => m.LoginModule),
    data: { animation: 'LoginPage' }
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [authGuard],
    data: { roles: [1] }
  },

    {
    path: 'usuario',
    loadChildren: () => import('./usuario/usuario.module').then(m => m.UsuarioModule),
    canActivate: [authGuard],
    data: { roles: [2] } // Protege para usuarios normales
  },
  {
    path: '',
    loadChildren: ()=> import('./principal/principal.module').then(m=>m.PrincipalModule),
    data: { animation: 'HomePage' }
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
