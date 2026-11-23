import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaPrestamosDetallesComponent } from './lista-prestamos-detalles.component';

describe('ListaPrestamosDetallesComponent', () => {
  let component: ListaPrestamosDetallesComponent;
  let fixture: ComponentFixture<ListaPrestamosDetallesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListaPrestamosDetallesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaPrestamosDetallesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
