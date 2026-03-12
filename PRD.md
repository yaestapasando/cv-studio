# PRD — SPA para creación, edición y exportación de currículums vitae

## 1. Resumen del producto

Aplicación web SPA que permite crear, editar y exportar currículums vitae de calidad profesional directamente en el navegador, sin instalación, sin servidor y sin dependencias externas en tiempo de ejecución. Todo el estado, la lógica y los estilos viven en un único archivo HTML.

## 2. Objetivo

Permitir a cualquier usuario crear un CV profesional de forma rápida, visual y privada, ejecutando toda la aplicación localmente en el navegador y pudiendo guardar, recuperar y exportar su trabajo sin depender de backend.

## 3. Propuesta de valor

- Privacidad total: los datos no salen del navegador.
- Portabilidad extrema: un único archivo HTML ejecutable.
- Uso offline una vez cargado el archivo.
- Experiencia rápida sin instalación.
- Exportación lista para compartir o imprimir.

## 4. Alcance

### Incluido
- Edición completa de datos de un currículum.
- Gestión de varias secciones típicas de un CV.
- Previsualización en tiempo real.
- Selección entre varias plantillas visuales.
- Persistencia local en navegador.
- Exportación a PDF e impresión.
- Exportación/importación del contenido en formato JSON.
- Funcionamiento en un único archivo HTML sin servidor.

### Excluido
- Autenticación de usuarios.
- Sincronización en la nube.
- Colaboración multiusuario.
- Backend o base de datos.
- Dependencias CDN o librerías externas en runtime.
- IA generativa de contenido en la primera versión.

## 5. Restricciones no funcionales

- La aplicación debe ejecutarse como SPA en un único archivo `index.html`.
- No debe requerir servidor para funcionar.
- No debe depender de recursos remotos en tiempo de ejecución.
- Toda la lógica, estilos y estructura deben estar embebidos en el HTML.
- Debe funcionar correctamente en navegadores modernos de escritorio.
- Debe mantener el estado en memoria y permitir persistencia local.
- Debe priorizar rendimiento, legibilidad y mantenibilidad pese a la restricción de archivo único.

## 6. Usuarios objetivo

- Personas que buscan empleo y quieren generar un CV rápido.
- Perfiles técnicos y no técnicos.
- Usuarios que valoran privacidad y uso offline.
- Usuarios que quieren personalizar el diseño sin herramientas complejas.

## 7. Casos de uso principales

1. Crear un CV desde cero.
2. Editar un CV existente y ver cambios al instante.
3. Reordenar experiencias, educación y habilidades.
4. Cambiar plantilla o estilo visual.
5. Guardar el CV en el navegador y reabrirlo más tarde.
6. Exportar el CV a PDF para enviar una candidatura.
7. Importar un JSON con un CV previamente guardado.

## 8. Requisitos funcionales

### RF-01. Edición de información personal
El usuario puede editar nombre, titular profesional, resumen, contacto y enlaces.

### RF-02. Gestión de secciones del CV
El usuario puede crear, editar, eliminar y reordenar entradas de experiencia, educación, proyectos, habilidades y otras secciones.

### RF-03. Previsualización en tiempo real
Cada cambio se refleja inmediatamente en una vista previa maquetada.

### RF-04. Plantillas y estilo
El usuario puede aplicar distintas plantillas y ajustes básicos de estilo.

### RF-05. Persistencia local
El usuario puede guardar y recuperar el CV desde el navegador.

### RF-06. Importación/exportación de datos
El usuario puede exportar e importar el contenido del CV en JSON.

### RF-07. Exportación final
El usuario puede imprimir o exportar a PDF con formato consistente.

### RF-08. Validaciones de formulario
La app informa de campos obligatorios, formatos inválidos y errores de datos.

### RF-09. Funcionamiento offline
La app puede seguir funcionando sin conexión una vez abierta localmente.

## 9. Requisitos no funcionales

### RNF-01. Rendimiento
- Tiempo de carga inicial bajo.
- Interacción fluida en edición y previsualización.
- Cambios renderizados sin bloqueos perceptibles.

### RNF-02. Compatibilidad
- Últimas 2 versiones de Chrome, Edge, Firefox y Safari de escritorio.
- Degradación aceptable en funciones no críticas si alguna API difiere.

### RNF-03. Accesibilidad
- Navegación por teclado.
- Etiquetas accesibles en formularios.
- Contraste suficiente en UI y plantillas.

### RNF-04. Mantenibilidad
- Organización modular del código dentro del HTML.
- Separación clara por bloques de estilos, estado, utilidades, render y eventos.

### RNF-05. Privacidad
- Ningún dato del usuario se transmite a servidores externos.

## 10. Arquitectura propuesta

### Enfoque técnico
Aplicación cliente pura basada en:
- HTML para estructura.
- CSS embebido para layout, tema y plantillas.
- JavaScript embebido para estado, render, validación, persistencia y exportación.

### Módulos internos sugeridos
- Modelo de datos del CV.
- Estado global de la aplicación.
- Render de formularios.
- Render de vista previa.
- Motor de plantillas.
- Persistencia local.
- Importación/exportación JSON.
- Impresión/exportación PDF.
- Validación y utilidades.

## 11. Modelo de datos inicial

```json
{
  "basics": {
    "fullName": "",
    "headline": "",
    "summary": "",
    "email": "",
    "phone": "",
    "location": "",
    "website": "",
    "linkedin": "",
    "github": ""
  },
  "experience": [],
  "education": [],
  "projects": [],
  "skills": [],
  "languages": [],
  "certifications": [],
  "template": "classic",
  "theme": {
    "fontScale": 1,
    "accent": "#1f4b99",
    "spacing": "normal"
  },
  "meta": {
    "version": 1,
    "updatedAt": ""
  }
}
```

## 12. Features y desglose de tareas

## Feature 1 — Base de la SPA en archivo único
**Objetivo:** levantar la estructura técnica mínima del producto dentro de un único HTML.

### Tareas
- [ ] Crear el archivo único `index.html` con estructura base.
- [ ] Definir secciones internas para HTML, CSS y JS embebidos.
- [ ] Establecer convención de módulos lógicos dentro del script.
- [ ] Configurar layout principal de dos paneles: editor y preview.
- [ ] Implementar arranque inicial de la app sin dependencias externas.
- [ ] Verificar funcionamiento abriendo el HTML directamente en navegador.
- [ ] Documentar la estructura interna del archivo para mantenimiento.

### Criterios de aceptación
- La app se ejecuta abriendo un único HTML en el navegador.
- No hay llamadas a backend ni dependencias remotas.
- El layout base es usable y responsive en escritorio.

---

## Feature 2 — Modelo de datos y gestión de estado
**Objetivo:** definir una fuente única de verdad para el CV y el estado de la UI.

### Tareas
- [ ] Diseñar el esquema JSON del currículum.
- [ ] Implementar estado inicial por defecto.
- [ ] Crear utilidades de lectura/escritura del estado.
- [ ] Implementar actualización inmutable o controlada del estado.
- [ ] Añadir mecanismo de suscripción o render tras cambios.
- [ ] Gestionar estado UI adicional: sección activa, plantilla, mensajes, modales.
- [ ] Incluir control de versión del modelo de datos.

### Criterios de aceptación
- Todas las vistas leen de un único estado central.
- Cualquier cambio del usuario actualiza correctamente el modelo.
- El esquema permite exportación/importación consistente.

---

## Feature 3 — Editor de información personal
**Objetivo:** permitir editar los datos básicos del CV.

### Tareas
- [ ] Crear formulario para nombre completo.
- [ ] Crear formulario para titular profesional.
- [ ] Crear formulario para resumen/perfil.
- [ ] Crear campos de email, teléfono y ubicación.
- [ ] Crear campos de enlaces externos: web, LinkedIn, GitHub.
- [ ] Vincular inputs al estado global.
- [ ] Añadir placeholders y ayudas de uso.
- [ ] Añadir validación básica de formato para email y URLs.

### Criterios de aceptación
- Los datos básicos pueden editarse sin recargar.
- Los cambios se reflejan en preview en tiempo real.
- Los formatos inválidos se indican visualmente.

---

## Feature 4 — Gestión de experiencia profesional
**Objetivo:** administrar entradas de experiencia laboral.

### Tareas
- [ ] Crear UI para listar experiencias existentes.
- [ ] Implementar acción “añadir experiencia”.
- [ ] Implementar edición de puesto, empresa, ubicación y fechas.
- [ ] Implementar edición de descripción y logros.
- [ ] Permitir eliminar una experiencia.
- [ ] Permitir reordenar experiencias.
- [ ] Permitir marcar experiencia actual.
- [ ] Soportar múltiples bullets por experiencia.

### Criterios de aceptación
- El usuario puede crear varias experiencias.
- El orden visual coincide con el orden guardado.
- La vista previa renderiza cada experiencia correctamente.

---

## Feature 5 — Gestión de educación
**Objetivo:** administrar formación académica.

### Tareas
- [ ] Crear UI para listado de educación.
- [ ] Implementar alta de nueva entrada educativa.
- [ ] Implementar edición de título, centro, fechas y detalles.
- [ ] Permitir eliminar entradas.
- [ ] Permitir reordenar entradas.
- [ ] Soportar notas opcionales, logros o menciones.

### Criterios de aceptación
- El usuario puede mantener varias entradas de educación.
- La preview muestra la sección con estilo consistente.

---

## Feature 6 — Gestión de proyectos
**Objetivo:** mostrar proyectos relevantes en el CV.

### Tareas
- [ ] Crear UI para listado de proyectos.
- [ ] Implementar alta, edición y borrado de proyectos.
- [ ] Añadir campos de nombre, rol, enlace, stack y descripción.
- [ ] Permitir múltiples highlights por proyecto.
- [ ] Permitir reordenación manual.

### Criterios de aceptación
- Los proyectos pueden añadirse y editarse fácilmente.
- Los enlaces se renderizan correctamente en la preview.

---

## Feature 7 — Gestión de habilidades, idiomas y certificaciones
**Objetivo:** cubrir secciones complementarias del CV.

### Tareas
- [ ] Crear editor de habilidades por lista simple o categorías.
- [ ] Crear editor de idiomas con nivel.
- [ ] Crear editor de certificaciones con emisor y fecha.
- [ ] Permitir añadir, editar, eliminar y reordenar elementos.
- [ ] Definir representación visual compacta para preview.

### Criterios de aceptación
- Estas secciones pueden activarse y poblarse sin fricción.
- La maquetación mantiene legibilidad con muchos elementos.

---

## Feature 8 — Secciones dinámicas y configuración de visibilidad
**Objetivo:** permitir activar, ocultar y ordenar secciones del CV.

### Tareas
- [ ] Definir catálogo de secciones soportadas.
- [ ] Implementar toggles de mostrar/ocultar por sección.
- [ ] Implementar reordenación de secciones completas.
- [ ] Mantener consistencia entre editor, estado y preview.
- [ ] Ocultar automáticamente secciones vacías si procede.

### Criterios de aceptación
- El usuario controla qué secciones aparecen.
- El orden configurado se respeta en exportación e impresión.

---

## Feature 9 — Previsualización en tiempo real
**Objetivo:** ofrecer una representación profesional inmediata del CV.

### Tareas
- [ ] Diseñar componente de preview independiente del editor.
- [ ] Implementar render de cabecera del CV.
- [ ] Implementar render de cada tipo de sección.
- [ ] Sincronizar preview tras cada cambio del estado.
- [ ] Optimizar rerender para mantener fluidez.
- [ ] Preparar estilos específicos de impresión.

### Criterios de aceptación
- El preview se actualiza al instante.
- El resultado visual es limpio y coherente.
- La versión impresa coincide razonablemente con la preview.

---

## Feature 10 — Plantillas visuales
**Objetivo:** permitir al usuario elegir distintos estilos de CV sin alterar los datos.

### Tareas
- [ ] Diseñar al menos 3 plantillas iniciales: clásica, moderna y minimal.
- [ ] Separar datos y presentación para facilitar cambio de plantilla.
- [ ] Implementar selector de plantilla.
- [ ] Definir variables de estilo por plantilla.
- [ ] Ajustar jerarquía tipográfica, espaciado y cabecera por plantilla.
- [ ] Verificar compatibilidad de impresión para cada plantilla.

### Criterios de aceptación
- Cambiar de plantilla no altera los datos del CV.
- Todas las plantillas generan un resultado profesional.
- La impresión/exportación mantiene el diseño esperado.

---

## Feature 11 — Personalización visual básica
**Objetivo:** ofrecer ajustes simples sin convertir la app en un editor complejo.

### Tareas
- [ ] Permitir selección de color de acento.
- [ ] Permitir ajuste de escala tipográfica.
- [ ] Permitir ajuste de densidad/espaciado.
- [ ] Aplicar cambios a preview e impresión.
- [ ] Definir límites para evitar diseños rotos.

### Criterios de aceptación
- El usuario puede personalizar el aspecto sin romper layout.
- Las opciones afectan de forma consistente a todas las secciones.

---

## Feature 12 — Validaciones y calidad de datos
**Objetivo:** reducir errores de contenido antes de exportar.

### Tareas
- [ ] Definir campos obligatorios mínimos.
- [ ] Implementar validación de email, URLs y fechas.
- [ ] Marcar errores inline en formularios.
- [ ] Mostrar avisos de secciones vacías relevantes.
- [ ] Mostrar estado general de completitud del CV.
- [ ] Impedir exportación o advertir si faltan datos críticos.

### Criterios de aceptación
- Los errores son claros y accionables.
- El usuario puede detectar qué falta antes de exportar.

---

## Feature 13 — Persistencia local
**Objetivo:** guardar el trabajo del usuario sin backend.

### Tareas
- [ ] Evaluar y seleccionar mecanismo principal (`localStorage` o `IndexedDB`).
- [ ] Implementar guardado automático tras cambios relevantes.
- [ ] Implementar carga automática del último CV al abrir la app.
- [ ] Añadir acción de “nuevo CV”.
- [ ] Añadir acción de “restablecer demo” o datos de ejemplo.
- [ ] Gestionar errores de persistencia y almacenamiento lleno.
- [ ] Añadir mensaje de estado de guardado.

### Criterios de aceptación
- El usuario no pierde su trabajo al cerrar y reabrir.
- La app recupera el estado guardado localmente.
- Los errores de persistencia están controlados.

---

## Feature 14 — Importación y exportación JSON
**Objetivo:** permitir backup, portabilidad y edición avanzada.

### Tareas
- [ ] Implementar exportación del estado a archivo JSON.
- [ ] Implementar importación desde archivo JSON.
- [ ] Validar esquema mínimo al importar.
- [ ] Gestionar versiones del esquema y migraciones básicas.
- [ ] Mostrar errores legibles ante JSON inválido.

### Criterios de aceptación
- El usuario puede descargar su CV en JSON.
- El usuario puede restaurar un CV desde JSON válido.
- La importación no rompe el estado de la aplicación.

---

## Feature 15 — Impresión y exportación a PDF
**Objetivo:** generar una salida final lista para compartir.

### Tareas
- [ ] Diseñar hoja de estilos `@media print`.
- [ ] Ajustar márgenes y saltos de página.
- [ ] Evitar cortes visuales dentro de bloques críticos.
- [ ] Añadir botón de imprimir/exportar PDF.
- [ ] Probar exportación en navegadores objetivo.
- [ ] Ajustar diferencias de render entre navegadores.

### Criterios de aceptación
- El CV puede imprimirse desde el navegador con buen formato.
- La opción “Guardar como PDF” produce un documento usable.
- Los saltos de página no rompen severamente la legibilidad.

---

## Feature 16 — UX general y ergonomía de edición
**Objetivo:** hacer que la creación del CV sea rápida y agradable.

### Tareas
- [ ] Diseñar navegación clara entre bloques del editor.
- [ ] Añadir estados vacíos útiles y orientativos.
- [ ] Incluir acciones rápidas para añadir entradas.
- [ ] Minimizar clics repetitivos en operaciones comunes.
- [ ] Añadir confirmaciones para acciones destructivas.
- [ ] Mantener feedback visible en guardado, error e importación.

### Criterios de aceptación
- Un usuario puede completar un CV sin ayuda externa.
- El flujo de edición resulta claro y predecible.

---

## Feature 17 — Accesibilidad
**Objetivo:** asegurar una experiencia inclusiva y navegable.

### Tareas
- [ ] Asociar etiquetas y controles correctamente.
- [ ] Garantizar navegación por teclado en formularios y acciones.
- [ ] Añadir estados focus visibles.
- [ ] Revisar contraste de colores en UI y plantillas.
- [ ] Usar jerarquía semántica correcta en el HTML.
- [ ] Validar lectura razonable con tecnologías de asistencia.

### Criterios de aceptación
- La app puede usarse por teclado en flujos principales.
- Los formularios y mensajes son comprensibles para lectores de pantalla.

---

## Feature 18 — Rendimiento y robustez
**Objetivo:** mantener buena experiencia incluso con CVs largos.

### Tareas
- [ ] Evitar renders innecesarios del preview.
- [ ] Optimizar listeners y actualizaciones del DOM.
- [ ] Probar con CVs extensos y múltiples secciones.
- [ ] Controlar errores no capturados en importación y render.
- [ ] Añadir utilidades de logging de desarrollo desactivables.

### Criterios de aceptación
- La edición sigue siendo fluida con contenido abundante.
- Los errores no dejan la app en estado inconsistente.

---

## Feature 19 — QA y compatibilidad cross-browser
**Objetivo:** validar el producto en escenarios reales de uso.

### Tareas
- [ ] Definir checklist de pruebas manuales por feature.
- [ ] Probar apertura local del HTML en navegadores objetivo.
- [ ] Probar persistencia, importación y exportación.
- [ ] Probar impresión/PDF en Chrome, Edge, Firefox y Safari.
- [ ] Verificar comportamiento sin conexión.
- [ ] Verificar manejo de datos corruptos o parciales.

### Criterios de aceptación
- Las funcionalidades principales funcionan en navegadores soportados.
- Existen evidencias de prueba para cada feature crítica.

---

## Feature 20 — Documentación y entrega
**Objetivo:** facilitar uso, mantenimiento y futuras iteraciones.

### Tareas
- [ ] Documentar objetivo, alcance y restricciones del proyecto.
- [ ] Documentar estructura interna del archivo único.
- [ ] Documentar modelo de datos y formato JSON.
- [ ] Documentar limitaciones conocidas de impresión/PDF.
- [ ] Añadir guía rápida de uso para usuario final.
- [ ] Añadir guía de mantenimiento para desarrollo futuro.

### Criterios de aceptación
- Un tercero puede entender cómo usar y mantener la app.
- La entrega incluye documentación suficiente del archivo único.

## 13. Priorización sugerida

### MVP
- Base SPA en archivo único.
- Modelo de datos y estado.
- Editor de información personal.
- Experiencia y educación.
- Preview en tiempo real.
- Una plantilla inicial.
- Persistencia local.
- Impresión/exportación PDF.

### Post-MVP
- Proyectos, idiomas y certificaciones.
- Varias plantillas.
- Personalización visual.
- Importación/exportación JSON.
- Mejoras de accesibilidad y robustez avanzadas.

## 14. Riesgos y mitigaciones

### Riesgo: complejidad creciente en un solo archivo
- Mitigación: modularizar por bloques y documentar convenciones estrictas.

### Riesgo: diferencias de impresión entre navegadores
- Mitigación: pruebas tempranas y estilos `print` específicos.

### Riesgo: limitaciones de persistencia local
- Mitigación: exportación JSON como mecanismo de backup.

### Riesgo: mantenimiento difícil por restricción “single file”
- Mitigación: separar claramente estado, render, estilos y utilidades dentro del HTML.

## 15. Definición de hecho

Una feature se considera completada cuando:
- [ ] Todas sus tareas de implementación aplicables están cerradas.
- [ ] Cumple sus criterios de aceptación.
- [ ] Ha sido probada manualmente en navegadores objetivo.
- [ ] No introduce dependencias externas en runtime.
- [ ] Mantiene la restricción de archivo único HTML.
- [ ] Está documentada si afecta arquitectura o uso.
