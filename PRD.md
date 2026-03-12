# Product Requirements Document (PRD) - Generador de CV "Single-File"

## 1. Visión General
Aplicación web tipo SPA (Single Page Application) que permite a los usuarios crear, editar y exportar currículums vitae de calidad profesional. 

**Restricciones Técnicas Principales:**
* **Zero-Install & Serverless:** Funciona directamente en el navegador sin backend.
* **Single-File:** Todo el código (HTML, CSS, JavaScript) debe residir en un único archivo `.html`.
* **Sin dependencias externas en tiempo de ejecución:** No se pueden usar CDNs para librerías o frameworks (ni React, ni Tailwind vía CDN, ni librerías de PDF externas que requieran red). Todo debe ser Vanilla JS/CSS o estar empaquetado/inlined en el archivo.

---

## 2. Desglose de Tareas por Feature (Roadmap)

### Feature 1: Estructura Base y Maquetación (Layout)
Configuración inicial del archivo único y la división de la pantalla entre el área de edición y el área de vista previa.

- [x] Crear el archivo base `index.html` con las etiquetas `<style>` y `<script>` preparadas.
- [x] Implementar un layout CSS Grid/Flexbox de dos columnas (Pantalla dividida: Formulario a la izquierda, Vista Previa a la derecha).
- [x] Implementar diseño responsive (en móviles, las columnas se apilan o se usa un sistema de pestañas Edición/Vista Previa).
- [x] Definir variables CSS (Custom Properties) para colores, tipografías y espaciados base del editor y del CV.

### Feature 2: Modelo de Datos y Gestión del Estado
Lógica pura de JavaScript para manejar la información del CV y su persistencia local.

- [x] Definir el esquema del objeto de estado (JSON) para el CV (Datos personales, extracto, experiencia, educación, habilidades).
- [x] Implementar patrón de estado reactivo (o funciones de actualización simples) que repinte la vista previa al cambiar los datos.
- [x] Implementar la función de guardado automático en `localStorage` (debounced para no penalizar rendimiento).
- [x] Implementar la función de carga desde `localStorage` al iniciar la aplicación.

### Feature 3: Formulario de Edición (Inputs)
Interfaz de usuario para introducir y modificar los datos del currículum.

- [x] Crear campos para **Datos Personales** (Nombre, email, teléfono, ubicación, enlaces/LinkedIn).
- [x] Crear área de texto para el **Extracto/Perfil Profesional**.
- [x] Crear sección dinámica de **Experiencia Laboral**:
  - [x] Botón para "Añadir nueva experiencia".
  - [x] Campos para puesto, empresa, fechas y descripción.
  - [x] Botones para eliminar o reordenar cada ítem.
- [x] Crear sección dinámica de **Educación** (titulación, institución, fechas).
- [x] Crear sección de **Habilidades** (input de texto simple o sistema de etiquetas/tags).
- [ ] Conectar todos los eventos `oninput`/`onchange` de los formularios al gestor del estado.

### Feature 4: Motor de Renderizado (Vista Previa en Tiempo Real)
La representación visual del currículum en formato documento.

- [ ] Maquetar el contenedor de la "hoja" (proporciones DIN A4, fondo blanco, sombra para simular papel).
- [ ] Diseñar un template profesional y limpio usando CSS puro dentro de la hoja.
- [ ] Implementar la función de JS que inyecta el JSON del estado en el HTML de la vista previa.
- [ ] Manejar estados vacíos en la vista previa (ej: si no hay experiencia, ocultar la sección "Experiencia").

### Feature 5: Importación y Exportación de Datos (Backup)
Permitir al usuario guardar su progreso en un archivo físico para llevarlo a otro ordenador.

- [ ] Crear botón de "Exportar Datos", que genere y descargue un archivo `.json` utilizando la API `Blob` y `URL.createObjectURL`.
- [ ] Crear botón/input file oculto para "Importar Datos", que lea un `.json` local usando `FileReader`.
- [ ] Implementar validación básica del JSON al importar para evitar romper la aplicación.

### Feature 6: Exportación a PDF
Aprovechar las capacidades de impresión del navegador para generar el PDF sin librerías pesadas.

- [ ] Crear el botón "Exportar a PDF" que dispare la función `window.print()`.
- [ ] Escribir reglas CSS dentro de `@media print`:
  - [ ] Ocultar el formulario, botones y cualquier elemento que no sea el currículum.
  - [ ] Forzar el tamaño de página (`@page { size: A4; margin: 0; }`).
  - [ ] Asegurar que el contenedor del CV ocupe el 100% de la página impresa.
  - [ ] Evitar saltos de página indeseados dentro de bloques de experiencia/educación (`break-inside: avoid`).

### Feature 7: Pulido y Testing Manual
Asegurar la calidad y robustez de la aplicación "Single-File".

- [ ] Revisar que la aplicación funciona completamente offline desconectando el Wi-Fi.
- [ ] Testear la generación de PDF en Chrome/Edge y Safari/Firefox para corregir discrepancias en la impresión.
- [ ] Minificar o limpiar código innecesario para mantener el archivo HTML lo más ligero posible.
- [ ] Validar la accesibilidad básica del formulario (labels, focus states).