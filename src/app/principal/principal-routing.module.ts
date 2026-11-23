import { LibroDetallesComponent } from './components/libro-detalles/libro-detalles.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import path from 'path';
import { NavbarComponent } from './components/navbar/navbar.component';
import { CatalogoComponent } from './components/catalogo/catalogo.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { QuienesComponent } from './components/quienes/quienes.component';
import { ParatiComponent } from './components/parati/parati.component';


const routes: Routes = [
  {
    path: '',
    component: NavbarComponent,
    children: [
      {
        path:'catalogo',
        component: CatalogoComponent,
        data: { animation: 'catalogo' }
      },
      {
        path:'catalogo/genero/:categoria',
        component: CatalogoComponent,
        data: { animation: 'catalogo' }
      },
      {
        path:'catalogo/buscar/:busqueda',
        component: CatalogoComponent,
        data: { animation: 'catalogo' }
      },
      {
        path:'',
        component: InicioComponent,
        data: { navbarOptions: 'inicio' }
      },
      {
        path: 'quienes',
        component: QuienesComponent,
        data: { animation: 'quienes' }
      },
      {
        path: 'makeawish',
        component: ParatiComponent
      },
      {
        path: 'libro/:libroId',
        component: LibroDetallesComponent
      },
      {
        path: '**',
        redirectTo: ''
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrincipalRoutingModule { }
