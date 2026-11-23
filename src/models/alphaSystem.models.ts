export interface Pais {
    idPais: number;
    nombrePais: string;
    created_at: string | null;
    updated_at: string | null;
  }
  
  export interface Estado {
    idEstado: number;
    nombreEstado: string;
    idPais: number;
    created_at: string | null;
    updated_at: string | null;
  }
  
  export interface Municipio {
    idMunicipio: number;
    nombreMunicipio: string;
    idEstado: number;
    created_at: string | null;
    updated_at: string | null;
  }
  
  export interface Ciudad {
    idCiudad: number;
    nombreCiudad: string;
    idMunicipio: number;
    created_at: string | null;
    updated_at: string | null;
  }
  
  export interface TipoUsuario {
    idTipoUsr: number;
    nombreTipo: string;
    descripcion: string;
    created_at: string | null;
    updated_at: string | null;
  }
  
  export interface EstadoUsuario {
    idEstadoUsr: number;
    estadoUsr: string;
    created_at: string | null;
    updated_at: string | null;
  }
  
  export interface Usuario {
    idUsr: number;
    nombreUsr: string;
    apellidoP: string;
    apellidoM: string;
    fotoUsr: string;
    calle: string;
    colonia: string;
    idCiudad: number;
    telefonoUsr: string;
    correoUsr: string;
    contrasena: string;
    idTipoUsr: number;
    idEstadoUsr: number;
    created_at: string | null;
    updated_at: string | null;
  }
  
  export interface EstadoLibro {
    idEstadoU: number;
    estadoLibro: string;
    created_at: string | null;
    updated_at: string | null;
  }
  
  export interface Genero {
    idGenero: number;
    nombreGenero: string;
    created_at: string | null;
    updated_at: string | null;
  }
  
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
  
  export interface Prestamo {
  idPrestamo:       number;
  idUsuario:        number;
  idLibro:          string;      
  fechaPrestamo:    string;        
  fechaEntrega:     string;        
  multa:            number | null;  
  devuelto:         number;       
  created_at:       string;        
  updated_at:       string;         
}

export interface LibroReco {
  isbn: string;
  fotoUsr: string;
  autor: string;
  titulo: string;
}

// export interface RecoHistItem {
//   desc: string;
//   isbns: string[];
//   fecha: string; 
// }

export interface LibroDetalle {
  isbn: string;
  titulo: string;
  fotoUsr: string;
  autor: string;
}

export interface RecoHistItem {
  desc: string;
  isbns: string[];
  fecha: string;
  libros?: LibroDetalle[];
  loadingBooks?: boolean;
}