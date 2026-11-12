# GERİ DÖNMEYENLER — Plataforma Editorial y Lector Digital

## Estructura de Archivos
- `index.html`: Estructura principal de la plataforma web y modales.
- `css/styles.css`: Hoja de estilos con la paleta cinematográfica oscura (`#090A0D`, `#191C22`, `#641E24`, `#D5C9B5`, `#A7B1BE`, `#E8E5DF`) y diseño responsive de libro abierto.
- `data/book-data.js`: Estructura del libro (Prólogo + índice oficial de 20 capítulos en Español y Turco).
- `js/reader.js`: Motor del lector digital (paginación automática, modo nocturno/papel, tamaño de fuente, marcadores, guardado de progreso y viento ambiental opcional).
- `js/admin.js`: Panel privado de administración (clave por defecto: `19221959`) con exportación e importación de copias de seguridad `.json`.
- `js/app.js`: Controlador bilingüe (`ES` / `TR`), navegación y efectos atmosféricos.

## Cómo Publicar Online
1. Sube todos los archivos manteniendo la estructura de carpetas (`index.html`, `css/`, `js/`, `data/`) a cualquier hosting estático gratuito o profesional (**Netlify**, **Vercel**, **GitHub Pages** o tu propio servidor cPanel).
2. Accede al **Panel de Autor** desde el enlace del pie de página o pulsando `Ctrl + Shift + A` (clave: `19221959`) para ir publicando los siguientes capítulos y descargar tus copias de seguridad `.json`.
