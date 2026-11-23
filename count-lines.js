// count-lines.js
const fs = require('fs');
const path = require('path');

// Si pasas una ruta por parámetro, la usará; si no, toma la carpeta actual del proyecto
const rootDir = process.argv[2] || process.cwd();

// Extensiones a analizar en un proyecto Angular
const extensions = ['.ts', '.html', '.css', '.scss', '.js'];

// Variables globales para acumulación
let totalPhysicalLines = 0;    // Líneas físicas (raw)
let totalLogicalLines = 0;     // Líneas lógicas (sin comentarios ni vacíos)
let fileCount = 0;

// Función que, dado el texto completo de un archivo, devuelve { physical, logical }
function countLinesInContent(content, ext) {
  const lines = content.split(/\r?\n/);
  let physical = lines.length;
  let logical = 0;
  let insideBlockComment = false;

  for (let line of lines) {
    let trimmed = line.trim();

    // 1. Detectar inicio de comentario multilinea (/* … */)
    if (!insideBlockComment && trimmed.startsWith('/*')) {
      insideBlockComment = true;
      // Si el mismo trimmed termina con */, cierra el bloque inmediatamente
      if (trimmed.endsWith('*/') && trimmed.length > 4) {
        insideBlockComment = false;
      }
      continue; // esta línea es comentario
    }

    // 2. Si estamos dentro de un bloque /* … */, buscar cierre */
    if (insideBlockComment) {
      if (trimmed.endsWith('*/')) {
        insideBlockComment = false;
      }
      continue; // ignorar mientras esté dentro del bloque
    }

    // 3. Comentarios de línea: // (aplica a .ts y .js)
    if ((ext === '.ts' || ext === '.js') && trimmed.startsWith('//')) {
      continue;
    }

    // 4. Comentarios en HTML/CSS: <!-- … --> o // (pocas veces se usa // en .html)
    if (
      (ext === '.html' || ext === '.css' || ext === '.scss') &&
      (trimmed.startsWith('<!--') || trimmed.startsWith('//'))
    ) {
      // Nota: los bloques multilínea de HTML (<!-- … -->) se ignoran línea a línea
      continue;
    }

    // 5. Ignorar líneas vacías
    if (trimmed === '') {
      continue;
    }

    // Si llegamos aquí, esta línea cuenta como "lógica"
    logical++;
  }

  return { physical, logical };
}

function traverseDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const name = entry.name;
    const fullPath = path.join(dir, name);

    // 1. Ignorar 'node_modules' por completo
    if (entry.isDirectory() && name === 'node_modules') {
      continue;
    }

    // 2. Ignorar cualquier carpeta oculta (cuyo nombre empiece con '.')
    if (entry.isDirectory() && name.startsWith('.')) {
      continue;
    }

    if (entry.isDirectory()) {
      traverseDirectory(fullPath);
    } else {
      const ext = path.extname(name).toLowerCase();
      if (extensions.includes(ext)) {
        fileCount++;
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const { physical, logical } = countLinesInContent(content, ext);
          totalPhysicalLines += physical;
          totalLogicalLines += logical;
        } catch (err) {
          console.warn(`No se pudo leer ${fullPath}: ${err.message}`);
        }
      }
    }
  }
}

console.log('Iniciando conteo en:', rootDir);
traverseDirectory(rootDir);
console.log('-------------------------------------');
console.log(`Archivos analizados: ${fileCount}`);
console.log(`Líneas físicas (raw): ${totalPhysicalLines}`);
console.log(`Líneas lógicas (sin comentarios/espacios): ${totalLogicalLines}`);
console.log('-------------------------------------');
