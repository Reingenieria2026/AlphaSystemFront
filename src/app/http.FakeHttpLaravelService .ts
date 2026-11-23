import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

/* INTERFACES BASADAS EN LA ESTRUCTURA DE LA BASE DE DATOS */

/** Interfaz para Libro (Tabla: Libro) */
export interface Libro {
  isbn: string;
  titulo: string;
  fotoUsr: string;
  cantidad: number;
  anioPubli: number;
  edicion: string;
  autor: string;
  editorial: string;
  idGenero: number;
  idEstadoLibro: number;
  created_at: string | null;
  updated_at: string | null;
}

/** Interfaz para Usuario (Tabla: Usuario) */
export interface User {
  idUsr: number;
  nombreUsr: string;
  apellidoP: string;
  apellidoM?: string;
  fotoUsr: string;         // Para la simulación, se usará como URL
  calle?: string;
  colonia?: string;
  idCiudad?: number;
  telefonoUsr?: string;
  correoUsr: string;
  contrasena: string;      // Nota: en un sistema real se usaría hash
  idTipoUsr: number;
  idEstadoUsr: number;
  token?: string;          // Campo simulado para devolver un token de sesión
}

export interface Genero {
  idGenero: number;
  nombreGenero: string;
  created_at: string | null;
  updated_at: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class FakeHttpLaravelService {
  // Simulación de datos de la tabla Libro
  private libros: Libro[] = [
    {
      isbn: '9783161484100',
      titulo: 'El Quijote',
      fotoUsr: 'https://i.pinimg.com/736x/b5/0f/9c/b50f9c7c4969883cfa1dfe5a80763529.jpg',
      cantidad: 10,
      anioPubli: 1605,
      edicion: '1ª Edición',
      autor: 'Miguel de Cervantes',
      editorial: 'Editorial Ejemplo',
      // Asigna un idGenero por defecto (puedes cambiarlo si tienes una lista de géneros)
      idGenero: 1,
      idEstadoLibro: 1,
      created_at: '2025-04-15T00:00:00Z',
      updated_at: '2025-04-15T00:00:00Z'
    },
    {
      isbn: '9783161484101',
      titulo: 'Cien Años de Soledad',
      fotoUsr: 'https://m.media-amazon.com/images/I/71YoFJSz3LL._AC_UF894,1000_QL80_.jpg',
      cantidad: 8,
      anioPubli: 1967,
      edicion: '2ª Edición',
      autor: 'Gabriel García Márquez',
      editorial: 'Editorial Macondo',
      idGenero: 2,
      idEstadoLibro: 1,
      created_at: '2025-04-15T00:00:00Z',
      updated_at: '2025-04-15T00:00:00Z'
    },
    {
      isbn: '9788437604947',
      titulo: 'La sombra del viento',
      fotoUsr: 'https://www.planetadelibros.com.mx/usuaris/libros/fotos/334/m_libros/portada_la-sombra-del-viento-20-aniversario_carlos-ruiz-zafon_202104291844.jpg',
      cantidad: 12,
      anioPubli: 2001,
      edicion: 'Primera Edición',
      autor: 'Carlos Ruiz Zafón',
      editorial: 'Planeta',
      idGenero: 3,
      idEstadoLibro: 1,
      created_at: '2025-04-15T00:00:00Z',
      updated_at: '2025-04-15T00:00:00Z'
    },
    {
      isbn: '9780451524935',
      titulo: '1984',
      fotoUsr: 'https://i.etsystatic.com/25126483/r/il/826fdb/2932014615/il_570xN.2932014615_7vba.jpg',
      cantidad: 15,
      anioPubli: 1949,
      edicion: 'Primera Edición',
      autor: 'George Orwell',
      editorial: 'Secker & Warburg',
      idGenero: 4,
      idEstadoLibro: 1,
      created_at: '2025-04-15T00:00:00Z',
      updated_at: '2025-04-15T00:00:00Z'
    },
    {
      isbn: '9780156012195',
      titulo: 'El Principito',
      fotoUsr: 'https://gandhi.vtexassets.com/arquivos/ids/4368502/9786078678006.jpg',
      cantidad: 20,
      anioPubli: 1943,
      edicion: 'Primera Edición',
      autor: 'Antoine de Saint-Exupéry',
      editorial: 'Reynal & Hitchcock',
      idGenero: 5,
      idEstadoLibro: 1,
      created_at: '2025-04-15T00:00:00Z',
      updated_at: '2025-04-15T00:00:00Z'
    },
    {
      isbn: '9780060935467',
      titulo: 'Matar a un ruiseñor',
      fotoUsr: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/To_Kill_a_Mockingbird_%28first_edition_cover%29.jpg/1200px-To_Kill_a_Mockingbird_%28first_edition_cover%29.jpg',
      cantidad: 9,
      anioPubli: 1960,
      edicion: 'Primera Edición',
      autor: 'Harper Lee',
      editorial: 'J.B. Lippincott & Co.',
      idGenero: 6,
      idEstadoLibro: 1,
      created_at: '2025-04-15T00:00:00Z',
      updated_at: '2025-04-15T00:00:00Z'
    },
    {
      isbn: '9780439554930',
      titulo: 'Harry Potter y la piedra filosofal',
      fotoUsr: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1716663382i/56151606.jpg',
      cantidad: 12,
      anioPubli: 1997,
      edicion: '1ª Edición',
      autor: 'J.K. Rowling',
      editorial: 'Bloomsbury',
      idGenero: 2,
      idEstadoLibro: 1,
      created_at: '2025-04-16T00:00:00Z',
      updated_at: '2025-04-16T00:00:00Z'
    },
    {
      isbn: '9780142437230',
      titulo: 'Orgullo y prejuicio',
      fotoUsr: 'https://images.cdn3.buscalibre.com/fit-in/360x360/46/6b/466b0b47e932561b186c56358acbe55e.jpg',
      cantidad: 8,
      anioPubli: 1813,
      edicion: '1ª Edición',
      autor: 'Jane Austen',
      editorial: 'T. Egerton',
      idGenero: 3,
      idEstadoLibro: 1,
      created_at: '2025-04-16T00:00:00Z',
      updated_at: '2025-04-16T00:00:00Z'
    },
    {
      isbn: '9780140449266',
      titulo: 'Crimen y castigo',
      fotoUsr: 'https://m.media-amazon.com/images/I/713hTReVysL._AC_UF894,1000_QL80_.jpg',
      cantidad: 7,
      anioPubli: 1866,
      edicion: '1ª Edición',
      autor: 'Fiódor Dostoyevski',
      editorial: 'The Russian Messenger',
      idGenero: 4,
      idEstadoLibro: 1,
      created_at: '2025-04-16T00:00:00Z',
      updated_at: '2025-04-16T00:00:00Z'
    },
    {
      isbn: '9780307474278',
      titulo: 'La carretera',
      fotoUsr: 'https://pendulo.com/imagenes/9786074/978607429325.GIF',
      cantidad: 6,
      anioPubli: 2006,
      edicion: '1ª Edición',
      autor: 'Cormac McCarthy',
      editorial: 'Alfred A. Knopf',
      idGenero: 5,
      idEstadoLibro: 1,
      created_at: '2025-04-16T00:00:00Z',
      updated_at: '2025-04-16T00:00:00Z'
    },
    {
      isbn: '9788420431838',
      titulo: 'Rayuela',
      fotoUsr: 'https://m.media-amazon.com/images/I/61Hje5q9CRL.jpg',
      cantidad: 9,
      anioPubli: 1963,
      edicion: '1ª Edición',
      autor: 'Julio Cortázar',
      editorial: 'Editorial Sudamericana',
      idGenero: 6,
      idEstadoLibro: 1,
      created_at: '2025-04-16T00:00:00Z',
      updated_at: '2025-04-16T00:00:00Z'
    },
    {
      isbn: '9781982137274',
      titulo: 'Donde cantan los cangrejos',
      fotoUsr: 'https://cdn.kobo.com/book-images/b843a4fa-beda-436c-9cb8-7aadaa730297/353/569/90/False/donde-cantan-los-cangrejos-de-delia-owens-conversaciones-escritas.jpg',
      cantidad: 11,
      anioPubli: 2018,
      edicion: '1ª Edición',
      autor: 'Delia Owens',
      editorial: "G.P. Putnam's Sons",
      idGenero: 2,
      idEstadoLibro: 1,
      created_at: '2025-04-16T00:00:00Z',
      updated_at: '2025-04-16T00:00:00Z'
    },
    {
      isbn: '9786073141737',
      titulo: 'Personas decentes',
      fotoUsr: 'https://www.planetadelibros.com.mx/usuaris/libros/fotos/358/m_libros/357790_portada_personas-decentes_leonardo-padura_202207061031.jpg',
      cantidad: 0,
      anioPubli: 2022,
      edicion: '1ª Edición',
      autor: 'Leonardo Padura',
      editorial: 'Tusquets Editores',
      idGenero: 5,
      idEstadoLibro: 1,
      created_at: '2025-04-16T00:00:00Z',
      updated_at: '2025-04-16T00:00:00Z'
    },
    {
      isbn: '9780451526342',
      titulo: 'Rebelión en la granja',
      fotoUsr: 'https://m.media-amazon.com/images/I/81W3teIatpL.jpg',
      cantidad: 10,
      anioPubli: 1945,
      edicion: '1ª Edición',
      autor: 'George Orwell',
      editorial: 'Secker and Warburg',
      idGenero: 4,
      idEstadoLibro: 1,
      created_at: '2025-04-16T00:00:00Z',
      updated_at: '2025-04-16T00:00:00Z'
    },
    {
      isbn: '9789500720581',
      titulo: 'Sobre héroes y tumbas',
      fotoUsr: 'https://m.media-amazon.com/images/I/8109qQMSr3L._AC_UF894,1000_QL80_.jpg',
      cantidad: 6,
      anioPubli: 1961,
      edicion: '1ª Edición',
      autor: 'Ernesto Sabato',
      editorial: 'Losada',
      idGenero: 6,
      idEstadoLibro: 0,
      created_at: '2025-04-16T00:00:00Z',
      updated_at: '2025-04-16T00:00:00Z'
    }
  ];

  // Simulación de datos de la tabla Usuario: ahora tenemos varios usuarios
  private users: User[] = [
    {
      idUsr: 1,
      nombreUsr: 'Juan',
      apellidoP: 'Perez',
      apellidoM: 'Gomez',
      fotoUsr: 'https://i.etsystatic.com/34654177/r/il/473bc7/6012583563/il_570xN.6012583563_hs1s.jpg',
      correoUsr: 'juan@example.com',
      telefonoUsr: '1234567890',
      calle: 'Calle Falsa 123',
      colonia: 'Colonia Ejemplo',
      contrasena: 'password',
      idTipoUsr: 1,
      idEstadoUsr: 1,
      token: 'fake-token-1'

    },
    {
      idUsr: 2,
      nombreUsr: 'María',
      apellidoP: 'Lopez',
      apellidoM: 'Sanchez',
      fotoUsr: 'https://i.pinimg.com/736x/6b/d6/f7/6bd6f749c90d4670a4b610d299cbca5d.jpg',
      correoUsr: 'maria@example.com',
      telefonoUsr: '1234567890',
      calle: 'Calle Falsa 123',
      colonia: 'Colonia Ejemplo',
      contrasena: 'password',
      idTipoUsr: 2,
      idEstadoUsr: 1,
      token: 'fake-token-2'
    },
    {
      idUsr: 3,
      nombreUsr: 'Pedro',
      apellidoP: 'Martinez',
      apellidoM: 'Hernandez',
      fotoUsr: 'https://i.pinimg.com/736x/ab/fe/70/abfe7061bf6fb7d10332143315bed278.jpg',
      telefonoUsr: '1234567890',
      calle: 'Calle Falsa 123',
      colonia: 'Colonia Ejemplo',
      correoUsr: 'pedro@example.com',
      contrasena: 'password',
      idTipoUsr: 2,
      idEstadoUsr: 0,
      token: 'fake-token-3'
    }
  ];

  private generos: Genero[] = [
    {
      idGenero: 1,
      nombreGenero: 'Realismo mágico',
      created_at: '2025-04-15T00:00:00Z',
      updated_at: '2025-04-15T00:00:00Z'
    },
    {
      idGenero: 2,
      nombreGenero: 'Novela clásica',
      created_at: '2025-04-15T00:00:00Z',
      updated_at: '2025-04-15T00:00:00Z'
    },
    {
      idGenero: 3,
      nombreGenero: 'Misterio',
      created_at: '2025-04-15T00:00:00Z',
      updated_at: '2025-04-15T00:00:00Z'
    },
    {
      idGenero: 4,
      nombreGenero: 'Ciencia ficción',
      created_at: '2025-04-15T00:00:00Z',
      updated_at: '2025-04-15T00:00:00Z'
    },
    {
      idGenero: 5,
      nombreGenero: 'Infantil',
      created_at: '2025-04-15T00:00:00Z',
      updated_at: '2025-04-15T00:00:00Z'
    },
    {
      idGenero: 6,
      nombreGenero: 'Contemporáneo',
      created_at: '2025-04-15T00:00:00Z',
      updated_at: '2025-04-15T00:00:00Z'
    }
  ];

  private apiDelay = 500; // milisegundos para simular latencia de red

  constructor() { }

  /** 
   * Simula un endpoint GET.
   * - Si Modelo es 'libro' y Dato es un ISBN, retorna el libro correspondiente.
   * - Si Modelo es 'libros', retorna la lista completa de libros.
   * - Si Modelo es 'usuario', retorna el usuario correspondiente al id.
   */
  Service_Get(Modelo: string, Dato: string | number): Observable<any> {
    const model = Modelo.toLowerCase();
    if (model === 'libro') {
      const book = this.libros.find(b => b.isbn === Dato);
      return of({ estatus: 1, data: book }).pipe(delay(this.apiDelay));
    }
    if (model === 'libros') {
      return of({ estatus: 1, data: this.libros }).pipe(delay(this.apiDelay));
    }
    if (model === 'genero') {
      const genero = this.generos.find(g => g.idGenero === Number(Dato));
      return of({ estatus: 1, data: genero }).pipe(delay(this.apiDelay));
    }
    if (model === 'generos') {
      return of({ estatus: 1, data: this.generos }).pipe(delay(this.apiDelay));
    }
    if (model === 'usuario') {
      const userFound = this.users.find(u => u.idUsr === Number(Dato));
      if (userFound) {
        return of({ estatus: 1, data: userFound }).pipe(delay(this.apiDelay));
      } else {
        return of({ estatus: 0, mensaje: 'Usuario no encontrado' }).pipe(delay(this.apiDelay));
      }
    }
    if (model === 'usuarios') {
      return of({ estatus: 1, data: this.users }).pipe(delay(this.apiDelay));
    }
    return of({ estatus: 0, mensaje: 'Modelo no encontrado' }).pipe(delay(this.apiDelay));
  }

  /**
   * Simula un endpoint GET con paginación para libros.
   */
  Service_Get_Paginator(Modelo: string, Dato: string | number, page: number, rows: number): Observable<any> {
    if (Modelo.toLowerCase() === 'libros') {
      const start = (page - 1) * rows;
      const paginatedBooks = this.libros.slice(start, start + rows);
      return of({
        estatus: 1,
        data: paginatedBooks,
        total: this.libros.length
      }).pipe(delay(this.apiDelay));
    }
    return of({ estatus: 0, mensaje: 'Modelo no encontrado' }).pipe(delay(this.apiDelay));
  }


  /**
   * Simula un endpoint POST.
   * Se usa para login y registro.
   */
  Service_Post(Modelo: string, Dato: string | number, Parametros: any): Observable<any> {
    const model = Modelo.toLowerCase();
    // Lógica para login: buscamos el usuario en el array
    if(model === 'user' && Dato === 'login') {
      const foundUser = this.users.find(u => u.correoUsr === Parametros.correoUsr && u.contrasena === Parametros.contrasena);
      if (foundUser) {
        return of({
          estatus: 1,
          data: foundUser,
          mensaje: 'Inicio de sesión exitoso'
        }).pipe(delay(this.apiDelay));
      } else {
        return of({
          estatus: 0,
          mensaje: 'Credenciales incorrectas'
        }).pipe(delay(this.apiDelay));
      }
    }
    // Simulación de registro
    if(model === 'usuario' || (model === 'user' && Dato === 'register')) {
      const newUser: User = {
        idUsr: Math.floor(Math.random() * 1000) + 2, // Simula un nuevo id
        nombreUsr: Parametros.nombre,
        apellidoP: Parametros.apellidoPaterno,
        apellidoM: Parametros.apellidoMaterno,
        fotoUsr: Parametros.fotoUsr || 'https://via.placeholder.com/50/000000/FFFFFF?text=No+Img',
        correoUsr: Parametros.correo,
        contrasena: Parametros.contrasena,
        idTipoUsr: Number(Parametros.tipoUsuario) || 1, // Ajusta según convenga
        idEstadoUsr: 1,
        token: 'fake-jwt-token'
      };
      // Agregamos el nuevo usuario al array de usuarios
      this.users.push(newUser);
      return of({
        estatus: 1,
        data: newUser,
        mensaje: 'Usuario registrado exitosamente'
      }).pipe(delay(this.apiDelay));
    }
    return of({ estatus: 0, mensaje: 'Endpoint no implementado' }).pipe(delay(this.apiDelay));
  }

  /**
   * Simula un endpoint PATCH para actualizar un libro.
   */
  Service_Patch(Modelo: string, Dato: string | number, Parametros: any): Observable<any> {
    if (Modelo.toLowerCase() === 'libro') {
      const index = this.libros.findIndex(b => b.isbn === Dato);
      if (index !== -1) {
        this.libros[index] = { ...this.libros[index], ...Parametros };
        return of({ estatus: 1, data: this.libros[index], mensaje: 'Libro actualizado' }).pipe(delay(this.apiDelay));
      } else {
        return of({ estatus: 0, mensaje: 'Libro no encontrado' }).pipe(delay(this.apiDelay));
      }
    }
    return of({ estatus: 0, mensaje: 'Modelo no implementado' }).pipe(delay(this.apiDelay));
  }

  /**
   * Simula un endpoint DELETE para eliminar un libro.
   */
  Service_Delete(Modelo: string, Dato: string | number): Observable<any> {
    if (Modelo.toLowerCase() === 'libro') {
      const index = this.libros.findIndex(b => b.isbn === Dato);
      if (index !== -1) {
        this.libros.splice(index, 1);
        return of({ estatus: 1, mensaje: 'Libro eliminado' }).pipe(delay(this.apiDelay));
      } else {
        return of({ estatus: 0, mensaje: 'Libro no encontrado' }).pipe(delay(this.apiDelay));
      }
    }
    return of({ estatus: 0, mensaje: 'Modelo no implementado' }).pipe(delay(this.apiDelay));
  }
}
