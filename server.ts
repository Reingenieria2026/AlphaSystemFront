import { APP_BASE_HREF } from '@angular/common';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { readFileSync } from 'fs';
import { renderModule } from '@angular/platform-server';
import AppServerModule from './src/main.server';


// La función app() configura y retorna el servidor Express.
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtmlPath = join(browserDistFolder, 'index.html');
  const indexHtml = readFileSync(indexHtmlPath, 'utf8');

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Sirve archivos estáticos desde la carpeta del navegador.
  server.get('*.*', express.static(browserDistFolder, {
    maxAge: '1y'
  }));

  // Todas las rutas regulares usan la función renderModule para renderizar la aplicación Angular.
  server.get('*', (req, res, next) => {
    renderModule(AppServerModule, {
      document: indexHtml,
      url: req.url,
      extraProviders: [
        { provide: APP_BASE_HREF, useValue: req.baseUrl }
      ]
    })
      .then(html => res.send(html))
      .catch(err => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;
  const server = app();
  server.listen(port, () => {
    console.log(`Servidor Express escuchando en http://localhost:${port}`);
  });
}

run();
