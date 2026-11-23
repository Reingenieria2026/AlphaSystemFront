import { CrearUsuarioComponent } from './components/crear-usuario/crear-usuario.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
//import { MomentPipe } from '../moment-pipe.pipe';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule } from 'primeng/keyfilter';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { SkeletonModule } from 'primeng/skeleton';
import { GalleriaModule } from 'primeng/galleria';
import { CarouselModule } from 'primeng/carousel';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';

import { DataViewModule } from 'primeng/dataview';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MessageService } from 'primeng/api';
import { AdminRoutingModule } from './admin-routing.module';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ListaUsuariosComponent } from './components/lista-usuarios/lista-usuarios.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { FutureComponent } from './components/future/future.component';
import { FileUploadModule } from 'primeng/fileupload';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { AccordionModule } from 'primeng/accordion';
import { TooltipModule } from 'primeng/tooltip';
import { CrearLibroComponent } from './components/crear-libro/crear-libro.component';
import { ListaLibrosComponent } from './components/lista-libros/lista-libros.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PrestamoComponent } from './components/prestamo/prestamo.component';
import { DialogModule } from 'primeng/dialog';
import { ListaPrestamosComponent } from './components/lista-prestamos/lista-prestamos.component';
import { ListaPrestamosDetallesComponent } from './components/lista-prestamos-detalles/lista-prestamos-detalles.component';
import { SelectModule } from 'primeng/select';
import { LottieComponent } from 'ngx-lottie';
import { InicioAdminComponent } from './components/inicio-admin/inicio-admin.component';
import { TableModule } from 'primeng/table';
import { PasswordModule } from 'primeng/password';
import { SpeedDialModule } from 'primeng/speeddial';

@NgModule({
    declarations: [
      FutureComponent,
      PerfilComponent,
      ListaUsuariosComponent,
      CrearUsuarioComponent,
      NavbarComponent,
      InicioComponent,
      FutureComponent,
      CrearLibroComponent,
      ListaLibrosComponent,
      PrestamoComponent,
      ListaPrestamosComponent,
      ListaPrestamosDetallesComponent,
      InicioAdminComponent,
    ],
    imports: [
      SpeedDialModule,
      PasswordModule,
      TableModule,
      LottieComponent,
      SelectModule,
      DialogModule,
      ConfirmDialogModule,
      TooltipModule,
      AccordionModule,
      RadioButtonModule,
      CheckboxModule,
      InputIconModule,
      IconFieldModule,
      ToolbarModule,
      ScrollPanelModule,
      FileUploadModule,
      AdminRoutingModule,
      SplitButtonModule,
      DataViewModule,
      SelectButtonModule,
      DividerModule,
      TagModule,
      GalleriaModule,
      CarouselModule,
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      PaginatorModule,
      CardModule, 
      ButtonModule,
      InputTextModule,
      KeyFilterModule,
      InputNumberModule,
      ToastModule,
      RippleModule,
      ConfirmPopupModule,
      SkeletonModule,
      DropdownModule
    ],
  })
  export class AdminModule { }
  