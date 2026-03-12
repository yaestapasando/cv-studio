# PRD — CV Builder SPA (Single HTML File)

> Aplicación web SPA para crear, editar y exportar currículums vitae de calidad profesional, completamente autocontenida en un único archivo `index.html`. Sin servidor, sin instalación, sin dependencias externas en tiempo de ejecución.

---

## Estado general

| Categoría | Progreso |
|---|---|
| Arquitectura base | `[ ]` |
| Editor de contenido | `[ ]` |
| Plantillas y estilos | `[ ]` |
| Vista previa | `[ ]` |
| Exportación | `[ ]` |
| Persistencia local | `[ ]` |
| UX / Accesibilidad | `[ ]` |
| Calidad y tests | `[ ]` |

---

## F-01 · Arquitectura base

> Estructura del archivo único `index.html` con toda la lógica embebida.

- [x] Definir estructura HTML semántica raíz (`<head>`, `<body>`, secciones de app)
- [x] Incluir CSS completo inline en `<style>` (reset, variables CSS, layout)
- [x] Incluir JavaScript completo inline en `<script>` (módulo IIFE o ES module)
- [x] Definir el modelo de datos del CV como objeto JSON plano
- [x] Implementar sistema de estado reactivo mínimo (sin frameworks externos)
- [x] Implementar motor de renderizado de plantilla → HTML (función `render()`)
- [x] Definir sistema de eventos interno (pub/sub ligero o event delegation)
- [x] Validar que el archivo funciona al abrirse directamente con `file://` en Chrome, Firefox y Safari
- [x] Validar que el tamaño del archivo es inferior a 500 KB sin assets externos

---

## F-02 · Editor de contenido — Secciones del CV

> Formulario dinámico para introducir y editar cada bloque del currículum.

### 2.1 Datos personales
- [x] Campo: nombre completo
- [x] Campo: título profesional / puesto objetivo
- [x] Campo: correo electrónico (validación de formato)
- [x] Campo: teléfono
- [x] Campo: ubicación (ciudad, país)
- [x] Campo: URL LinkedIn
- [x] Campo: URL portfolio / web personal
- [ ] Campo: foto de perfil (upload local → base64, sin servidor)
- [ ] Previsualización inline de la foto subida

### 2.2 Resumen / Extracto profesional
- [ ] Textarea de texto libre con contador de caracteres
- [ ] Límite configurable (recomendado: 300 caracteres)
- [ ] Ayuda contextual ("qué escribir aquí")

### 2.3 Experiencia laboral
- [ ] Añadir / duplicar / eliminar entradas
- [ ] Campos por entrada: empresa, cargo, fecha inicio, fecha fin, descripción
- [ ] Toggle "trabajo actual" (oculta fecha fin)
- [ ] Reordenación drag-and-drop entre entradas
- [ ] Validación: fecha inicio ≤ fecha fin

### 2.4 Educación
- [ ] Añadir / duplicar / eliminar entradas
- [ ] Campos por entrada: institución, título, especialidad, fecha inicio, fecha fin
- [ ] Toggle "en curso"
- [ ] Reordenación drag-and-drop

### 2.5 Habilidades
- [ ] Añadir etiquetas (chips) de habilidades con input + Enter
- [ ] Eliminar etiquetas individualmente
- [ ] Nivel de habilidad opcional (básico / intermedio / avanzado / experto)
- [ ] Agrupación por categorías (técnicas, blandas, idiomas)

### 2.6 Idiomas
- [ ] Añadir / eliminar entradas
- [ ] Campos: idioma, nivel (A1–C2 o desplegable libre)

### 2.7 Proyectos personales / portfolio
- [ ] Añadir / duplicar / eliminar entradas
- [ ] Campos: nombre del proyecto, descripción, URL, tecnologías usadas
- [ ] Reordenación drag-and-drop

### 2.8 Certificaciones y cursos
- [ ] Añadir / eliminar entradas
- [ ] Campos: nombre, organismo emisor, fecha, URL de verificación

### 2.9 Secciones opcionales configurables
- [ ] Voluntariado
- [ ] Publicaciones
- [ ] Premios y reconocimientos
- [ ] Referencias ("disponibles bajo petición" o texto libre)
- [ ] Cada sección opcional puede activarse / desactivarse con toggle

---

## F-03 · Plantillas y personalización visual

> El CV debe poder mostrarse con diferentes plantillas de diseño.

- [ ] Implementar sistema de plantillas intercambiables (mínimo 3 plantillas)
- [ ] **Plantilla Classic**: layout de una columna, tipografía serif, sobria
- [ ] **Plantilla Modern**: layout de dos columnas, sidebar de color, sans-serif
- [ ] **Plantilla Minimal**: espaciado generoso, líneas finas, monocromático
- [ ] Selector de plantilla en la barra de herramientas (previsualización thumbnail)
- [ ] Selector de color de acento (paleta de 8 colores predefinidos + input hex)
- [ ] Selector de tipografía (mínimo 3 pares: serif, sans-serif, moderna)
- [ ] Selector de tamaño de fuente base (pequeño / normal / grande)
- [ ] Todas las fuentes deben estar embebidas o ser del sistema (sin Google Fonts externas)
- [ ] Cambio de plantilla no pierde los datos del formulario

---

## F-04 · Vista previa en tiempo real

> Panel de previsualización del CV que se actualiza conforme el usuario edita.

- [ ] Layout de pantalla partida: editor (izquierda) + preview (derecha)
- [ ] Preview se actualiza en tiempo real (debounce de 300 ms)
- [ ] Preview fiel al aspecto del PDF que se exportará (WYSIWYG)
- [ ] Scroll independiente en panel editor y panel preview
- [ ] Modo "solo preview" (ocultar editor para revisar el resultado)
- [ ] Modo "solo editor" (ocultar preview para más espacio de escritura)
- [ ] Indicador visual de secciones vacías en la preview (placeholder en gris)
- [ ] Preview responsive: simula correctamente una página A4

---

## F-05 · Exportación

> Generación de los artefactos finales descargables.

### 5.1 Exportar a PDF
- [ ] Exportar usando `window.print()` con `@media print` optimizado
- [ ] CSS de impresión: márgenes A4, saltos de página controlados, sin elementos de UI
- [ ] Nombre del archivo sugerido: `CV_NombreApellido.pdf`
- [ ] Botón dedicado "Descargar PDF" visible en todo momento
- [ ] Validar que el PDF resultante tiene calidad vectorial (texto seleccionable)
- [ ] Validar que la foto de perfil se incluye correctamente en el PDF

### 5.2 Exportar a JSON
- [ ] Exportar el objeto de estado del CV como archivo `.json`
- [ ] El JSON puede reimportarse para continuar editando
- [ ] Botón "Exportar datos (JSON)"

### 5.3 Importar desde JSON
- [ ] Input de archivo que acepta `.json`
- [ ] Validación del esquema antes de cargar
- [ ] Confirmación al usuario si hay datos existentes ("¿sobrescribir?")

### 5.4 Copiar HTML del CV al portapapeles
- [ ] Botón "Copiar HTML" que copia solo el bloque de la previsualización
- [ ] Feedback visual de confirmación ("¡Copiado!")

---

## F-06 · Persistencia local (sin servidor)

> Los datos del usuario deben sobrevivir al cierre accidental del navegador.

- [ ] Guardar el estado del CV en `localStorage` de forma automática (autosave cada 2 s)
- [ ] Restaurar el estado desde `localStorage` al abrir la aplicación
- [ ] Indicador de estado "Guardado" / "Guardando…" en la UI
- [ ] Botón "Nuevo CV" que limpia el estado (con confirmación)
- [ ] Gestión de múltiples CVs: lista de CVs guardados en localStorage
- [ ] Renombrar / duplicar / eliminar un CV guardado
- [ ] Exportar todos los CVs como un único archivo JSON de backup

---

## F-07 · UX general y accesibilidad

> La aplicación debe ser usable, agradable y accesible.

- [ ] Diseño responsive: usable en tableta (≥ 768 px) y escritorio (≥ 1280 px)
- [ ] Tema claro / oscuro con toggle y respeto de `prefers-color-scheme`
- [ ] Todos los inputs tienen `label` asociado correctamente
- [ ] Navegación completa por teclado (Tab, Shift+Tab, Enter, Escape)
- [ ] Focus visible en todos los elementos interactivos
- [ ] ARIA roles y `aria-label` en secciones dinámicas
- [ ] Mensajes de error de validación accesibles (`aria-live`)
- [ ] Tooltips de ayuda en campos con formato esperado (email, URL, fechas)
- [ ] Internacionalización básica: soporte para ES / EN (switch de idioma de la UI)
- [ ] Confirmación antes de acciones destructivas (eliminar sección, nuevo CV)
- [ ] Animaciones y transiciones respetan `prefers-reduced-motion`

---

## F-08 · Calidad, tests y entrega

> Asegurar robustez y preparación para distribución.

- [ ] Validar HTML con W3C Validator (cero errores)
- [ ] Validar que no hay llamadas de red en tiempo de ejecución (Network tab = vacío)
- [ ] Test manual en Chrome ≥ 110, Firefox ≥ 110, Safari ≥ 16, Edge ≥ 110
- [ ] Test de apertura directa desde sistema de archivos (`file://`)
- [ ] Test de rendimiento: tiempo hasta interactivo < 1 s en hardware moderado
- [ ] Test de exportación PDF en cada navegador
- [ ] Test de importación / exportación JSON (round-trip sin pérdida de datos)
- [ ] Test de persistencia: editar → cerrar pestaña → reabrir → datos intactos
- [ ] Minificar CSS y JS inline para reducir tamaño del archivo final
- [ ] Documentar en comentario al inicio del HTML: versión, fecha, instrucciones de uso
- [ ] Publicar archivo como release en repositorio (si aplica)

---

## Notas de diseño y restricciones técnicas

| Restricción | Detalle |
|---|---|
| **Sin dependencias externas** | Todo CSS, JS y fuentes deben estar embebidos en el HTML |
| **Sin servidor** | La app funciona abriendo el `.html` directamente en el navegador |
| **Tamaño objetivo** | < 500 KB (HTML + assets en base64) |
| **Compatibilidad** | Navegadores modernos con soporte ES2020+ |
| **Almacenamiento** | Solo `localStorage`; no se envía ningún dato a ningún servidor |
| **PDF** | Generado vía `window.print()`, sin librerías de terceros |

---

*Última actualización: 2026-03-12*
