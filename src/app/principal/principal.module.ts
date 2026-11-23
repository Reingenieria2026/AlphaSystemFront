import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';
import { PrincipalRoutingModule } from './principal-routing.module';

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
import { CatalogoComponent } from './components/catalogo/catalogo.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { QuienesComponent } from './components/quienes/quienes.component';
import { CarouselModule } from 'primeng/carousel';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';


import { DataViewModule } from 'primeng/dataview';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MessageService } from 'primeng/api';
import { VistaLibroComponent } from './components/vista-libro/vista-libro.component';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { OverlayModule } from '@angular/cdk/overlay';
import { BrowserModule } from '@angular/platform-browser';
import { NzFloatButtonModule } from 'ng-zorro-antd/float-button';
import { AccordionModule } from 'primeng/accordion';
import { RadioButtonModule } from 'primeng/radiobutton';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NZ_CAROUSEL_CUSTOM_STRATEGIES, NzCarouselFlipStrategy, NzCarouselModule, NzCarouselTransformNoLoopStrategy } from 'ng-zorro-antd/carousel';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ParatiComponent } from './components/parati/parati.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { LottieComponent } from 'ngx-lottie';
import { LibroDetallesComponent } from './components/libro-detalles/libro-detalles.component';
import { RatingModule } from 'primeng/rating';
import { ChipModule } from 'primeng/chip';
import { DialogModule } from 'primeng/dialog';
import { SafeUrlPipe } from '../services/safeUrl.pipe';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TextareaModule } from 'primeng/textarea';


@NgModule({
  declarations: [
    NavbarComponent,
    QuienesComponent,
    CatalogoComponent,
    InicioComponent,
    VistaLibroComponent,
    ParatiComponent,
    LibroDetallesComponent,
    
  ],
  imports: [
    TextareaModule,
    ProgressSpinnerModule,
    SafeUrlPipe,
    DialogModule,
    ChipModule,
    RatingModule,
    LottieComponent,
    ConfirmDialogModule,
    ScrollPanelModule,
    NzRadioModule,
    NzCarouselModule,
    NzButtonModule,
    RadioButtonModule,
    AccordionModule,
    NzFloatButtonModule,
    OverlayModule,
    NzModalModule,
    SplitButtonModule,
    DataViewModule,
    SelectButtonModule,
    DividerModule,
    TagModule,
    GalleriaModule,
    CarouselModule,
    CommonModule,
    PrincipalRoutingModule,
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
    SkeletonModule
  ],
  providers: [
    MessageService,
    {
      provide: NZ_CAROUSEL_CUSTOM_STRATEGIES,
      useValue: [
        { name: 'transform-no-loop', strategy: NzCarouselTransformNoLoopStrategy },
        { name: 'flip', strategy: NzCarouselFlipStrategy }
      ]
    }
  ]
})
export class PrincipalModule { }
