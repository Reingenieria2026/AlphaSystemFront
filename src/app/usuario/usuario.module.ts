import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LottieComponent } from 'ngx-lottie';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';

import { UsuarioRoutingModule } from './usuario-routing.module';

import { NavbarUsuarioComponent } from './components/navbar-usuario/navbar-usuario.component';
import { PerfilUsuarioComponent } from './components/perfil-usuario/perfil-usuario.component';
import { PrestamosComponent } from './components/prestamos/prestamos.component';
import { ListaLibrosComponent } from './components/lista-libros/lista-libros.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PaginatorModule } from 'primeng/paginator';
import { CheckboxModule } from 'primeng/checkbox';
import { FileUploadModule } from 'primeng/fileupload';

@NgModule({
  declarations: [
    NavbarUsuarioComponent,
    PerfilUsuarioComponent,
    PrestamosComponent,
    ListaLibrosComponent,

  ],
  imports: [
    CheckboxModule,
    LottieComponent,

    PaginatorModule,
    ConfirmDialogModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UsuarioRoutingModule,
    AccordionModule,
InputTextModule,
RadioButtonModule,

    // PrimeNG solo lo necesario
    CardModule,
    ButtonModule,
    TableModule,
    ToastModule,
    TagModule,
    DividerModule,
    TooltipModule,
    ScrollPanelModule,
    SkeletonModule,
    FileUploadModule,
  ]
})
export class UsuarioModule { }
