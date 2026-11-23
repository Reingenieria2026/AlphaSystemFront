import { Component } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';
import { AnimationItem } from 'lottie-web';

@Component({
  selector: 'app-quienes',
  templateUrl: './quienes.component.html',
  styleUrl: './quienes.component.scss',
  standalone: false,
})
export class QuienesComponent {

  gatoTecleando: AnimationOptions = {
    path: 'assets/CatTyping.json', 
    loop: true,
    autoplay: true
  };
  angularLogo: AnimationOptions = {
    path: 'assets/angugu.json', 
    loop: true,
    autoplay: true
  };
  googleLogo: AnimationOptions = {
    path: 'assets/googleLogo.json', 
    loop: true,
    autoplay: true
  };
  laravel: AnimationOptions = {
    path: 'assets/Laravel.json', 
    loop: true,
    autoplay: true
  };
  mySql: AnimationOptions = {
    path: 'assets/MySQL.json', 
    loop: true,
    autoplay: true
  };
  openAi: AnimationOptions = {
    path: 'assets/openAi.json', 
    loop: true,
    autoplay: true
  };
  docker: AnimationOptions = {
    path: 'assets/docker.json', 
    loop: true,
    autoplay: true
  };


  actualizado: AnimationOptions = {
    path: 'assets/actualizaciones.json', 
    loop: true,
    autoplay: true
  };
  ganancias: AnimationOptions = {
    path: 'assets/dinero.json', 
    loop: true,
    autoplay: true
  };
  inteligencia: AnimationOptions = {
    path: 'assets/inteligencia.json', 
    loop: true,
    autoplay: true
  };
  update: AnimationOptions = {
    path: 'assets/update.json', 
    loop: true,
    autoplay: true
  };
  registrarSencillo: AnimationOptions = {
    path: 'assets/registrarLibro.json', 
    loop: true,
    autoplay: true
  };
  ui: AnimationOptions = {
    path: 'assets/ui.json', 
    loop: true,
    autoplay: true
  };

  email = 'contacto@butterfly.com';

  features = [
    { title: 'UI intuitiva',               desc: 'Experiencia fluida, clara y accesible para cualquier usuario.',              opt: this.ui },
    { title: 'Registro y búsqueda rápida', desc: 'Filtros inteligentes y formularios simplificados para localizar en segundos.', opt: this.registrarSencillo },
    { title: 'Información actualizada',    desc: 'Datos de libros desde Google Books para mantener tu catálogo al día.',        opt: this.update },
    { title: 'Sinopsis con IA',            desc: 'Descripciones atractivas generadas con IA para atraer más lectores.',         opt: this.inteligencia },
    { title: 'Control de préstamos',       desc: 'Seguimiento claro de préstamos, devoluciones y multas.',                       opt: this.ganancias },
    { title: 'Evolución constante',        desc: 'Entrega continua de mejoras y nuevas funciones.',                              opt: this.actualizado },
  ];

  techs = [
    { title: 'Angular',         desc: 'Interfaz rápida y modular.',                              opt: this.angularLogo },
    { title: 'Laravel',         desc: 'API sólida y segura.',                                    opt: this.laravel },
    { title: 'MySQL',           desc: 'Almacenamiento confiable.',                               opt: this.mySql },
    { title: 'Docker',          desc: 'Entornos reproducibles para dev y despliegue.',           opt: this.docker },
    { title: 'Google Books API',desc: 'Metadatos reales y actualizados de libros.',              opt: this.googleLogo },
    { title: 'OpenAI',          desc: 'Sinopsis y recomendaciones potenciadas por IA.',          opt: this.openAi },
  ];

  

  strategy = 'transform-no-loop';
  array = [
    'assets/inicio2.jpg',
    'assets/inicio1.jpg',
    'assets/inicio3.jpg'
  ];
  dotPosition = 'bottom';

}
