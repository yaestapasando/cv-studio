from html.parser import HTMLParser
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
INDEX_HTML = ROOT / "index.html"


class StructureParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.start_tags = []
        self.ids = set()
        self.html_lang = None
        self.remote_refs = []
        self.class_names = set()
        self.aria_labels = set()

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        self.start_tags.append(tag)
        element_id = attrs_dict.get("id")
        if element_id:
            self.ids.add(element_id)
        class_attr = attrs_dict.get("class", "")
        if class_attr:
            self.class_names.update(class_attr.split())
        aria_label = attrs_dict.get("aria-label")
        if aria_label:
            self.aria_labels.add(aria_label)
        if tag == "html":
            self.html_lang = attrs_dict.get("lang")
        for attr_name in ("src", "href"):
            value = attrs_dict.get(attr_name)
            if value and value.startswith(("http://", "https://", "//")):
                self.remote_refs.append(value)


class IndexHtmlTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.content = INDEX_HTML.read_text(encoding="utf-8")
        cls.parser = StructureParser()
        cls.parser.feed(cls.content)

    def test_file_exists(self):
        self.assertTrue(INDEX_HTML.exists())

    def test_has_required_shell(self):
        self.assertIn("<!DOCTYPE html>", self.content)
        self.assertEqual(self.parser.html_lang, "es")
        self.assertIn("app", self.parser.ids)
        self.assertIn("editor-panel", self.parser.ids)
        self.assertIn("preview-panel", self.parser.ids)
        self.assertIn("editor-toolbar", self.parser.ids)
        self.assertIn("editor-canvas", self.parser.ids)
        self.assertIn("preview-content", self.parser.ids)
        self.assertIn("app-modal", self.parser.ids)
        self.assertIn("workspace-panel", self.parser.class_names)

    def test_embeds_style_and_script(self):
        self.assertIn("style", self.parser.start_tags)
        self.assertIn("dialog", self.parser.start_tags)
        self.assertIn("script", self.parser.start_tags)
        self.assertIn("const CVStudio = (() => {", self.content)
        self.assertIn("CVStudio.app.boot();", self.content)

    def test_defines_two_panel_workspace_layout(self):
        expected_snippets = [
            ".workspace {",
            "grid-template-columns: minmax(280px, 1fr) minmax(320px, 1.15fr);",
            ".workspace-panel {",
            "grid-template-rows: auto 1fr;",
            ".panel-header,",
            ".panel-body {",
            ".editor-layout {",
            ".preview-layout {",
            "@media (max-width: 900px) {",
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_exposes_editor_and_preview_regions(self):
        expected_classes = {
            "panel-header",
            "panel-body",
            "editor-layout",
            "editor-toolbar",
            "editor-canvas",
            "preview-layout",
            "preview-placeholder",
        }
        self.assertTrue(expected_classes.issubset(self.parser.class_names))
        self.assertIn("Area de trabajo del editor", self.parser.aria_labels)
        self.assertIn("Acciones del editor", self.parser.aria_labels)
        self.assertIn("Vista previa del curriculum", self.parser.aria_labels)

    def test_basics_section_renders_full_name_form(self):
        expected_snippets = [
            ".editor-form {",
            ".editor-help {",
            ".editor-input {",
            '<form class=\\"editor-form\\" id=\\"basics-form\\">',
            '<label for=\\"full-name-input\\"><span>Nombre completo</span></label>',
            'id=\\"full-name-input\\"',
            'name=\\"fullName\\"',
            'class=\\"editor-field editor-input\\"',
            'type=\\"text\\"',
            'autocomplete=\\"name\\"',
            'aria-describedby=\\"full-name-help\\"',
            'placeholder=\\"Escribe tu nombre completo\\"',
            '<p class=\\"editor-help\\" id=\\"full-name-help\\">Usa el mismo nombre que aparecera en tus perfiles profesionales.</p>',
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_basics_section_renders_professional_headline_form(self):
        expected_snippets = [
            '<label for=\\"headline-input\\"><span>Titular profesional</span></label>',
            'id=\\"headline-input\\"',
            'name=\\"headline\\"',
            'class=\\"editor-field editor-input\\"',
            'autocomplete=\\"organization-title\\"',
            'aria-describedby=\\"headline-help\\"',
            'placeholder=\\"Describe tu perfil profesional\\"',
            'value=\\"" + ui.escapeHtml(basics.headline) + "\\">',
            '<p class=\\"editor-help\\" id=\\"headline-help\\">Resume tu especialidad y seniority en una sola linea.</p>',
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_basics_section_renders_contact_fields(self):
        expected_snippets = [
            '<label for=\\"email-input\\"><span>Email</span></label>',
            'id=\\"email-input\\"',
            'name=\\"email\\"',
            'type=\\"email\\"',
            'autocomplete=\\"email\\"',
            'inputmode=\\"email\\"',
            'aria-describedby=\\"email-help\\"',
            'placeholder=\\"tu@email.com\\"',
            'value=\\"" + ui.escapeHtml(basics.email) + "\\">',
            '<p class=\\"editor-help\\" id=\\"email-help\\">Introduce un correo que revises con frecuencia.</p>',
            '<label for=\\"phone-input\\"><span>Telefono</span></label>',
            'id=\\"phone-input\\"',
            'name=\\"phone\\"',
            'type=\\"tel\\"',
            'autocomplete=\\"tel\\"',
            'inputmode=\\"tel\\"',
            'aria-describedby=\\"phone-help\\"',
            'placeholder=\\"+34 600 000 000\\"',
            'value=\\"" + ui.escapeHtml(basics.phone) + "\\">',
            '<p class=\\"editor-help\\" id=\\"phone-help\\">Anade prefijo internacional si buscas fuera de tu pais.</p>',
            '<label for=\\"location-input\\"><span>Ubicacion</span></label>',
            'id=\\"location-input\\"',
            'name=\\"location\\"',
            'autocomplete=\\"address-level2\\"',
            'aria-describedby=\\"location-help\\"',
            'placeholder=\\"Ciudad, pais\\"',
            'value=\\"" + ui.escapeHtml(basics.location) + "\\">',
            '<p class=\\"editor-help\\" id=\\"location-help\\">Indica ciudad y pais; no hace falta incluir la direccion completa.</p>',
            '<label for=\\"web-input\\"><span>Web</span></label>',
            'id=\\"web-input\\"',
            'name=\\"web\\"',
            'type=\\"url\\"',
            'autocomplete=\\"url\\"',
            'inputmode=\\"url\\"',
            'aria-describedby=\\"web-help\\"',
            'placeholder=\\"tuweb.com\\"',
            'value=\\"" + ui.escapeHtml(basics.web) + "\\">',
            '<p class=\\"editor-help\\" id=\\"web-help\\">Incluye tu portfolio o web personal si aporta contexto a tu perfil.</p>',
            '<label for=\\"linkedin-input\\"><span>LinkedIn</span></label>',
            'id=\\"linkedin-input\\"',
            'name=\\"linkedin\\"',
            'aria-describedby=\\"linkedin-help\\"',
            'placeholder=\\"linkedin.com/in/tu-perfil\\"',
            'value=\\"" + ui.escapeHtml(basics.linkedin) + "\\">',
            '<p class=\\"editor-help\\" id=\\"linkedin-help\\">Pega la URL publica de tu perfil para que el enlace sea directo.</p>',
            '<label for=\\"github-input\\"><span>GitHub</span></label>',
            'id=\\"github-input\\"',
            'name=\\"github\\"',
            'aria-describedby=\\"github-help\\"',
            'placeholder=\\"github.com/tu-usuario\\"',
            'value=\\"" + ui.escapeHtml(basics.github) + "\\">',
            '<p class=\\"editor-help\\" id=\\"github-help\\">Anade tu usuario si tu trabajo tecnico esta publicado ahi.</p>',
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_basics_section_renders_summary_profile_form(self):
        expected_snippets = [
            'textarea.editor-input {',
            '<label for=\\"summary-input\\"><span>Resumen / perfil</span></label>',
            '<textarea',
            'id=\\"summary-input\\"',
            'name=\\"summary\\"',
            'class=\\"editor-field editor-input\\"',
            'rows=\\"6\\"',
            'aria-describedby=\\"summary-help\\"',
            'placeholder=\\"Resume tu experiencia, fortalezas y propuesta de valor\\"',
            'ui.escapeHtml(basics.summary)',
            '<p class=\\"editor-help\\" id=\\"summary-help\\">Cuenta impacto, foco y diferencial sin repetir el titular.</p>',
            'Usa este bloque para presentar tu perfil en tres o cuatro frases concretas.',
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_experience_section_lists_existing_entries(self):
        expected_snippets = [
            ".entry-list {",
            ".entry-card {",
            ".entry-card-header {",
            ".entry-card-title {",
            ".entry-card-index {",
            'const experienceEntries = state.cv.experience.length',
            '<div class=\\"editor-note\\" data-tone=\\"muted\\">Listado de experiencias existentes en el documento.</div>',
            '<div class=\\"entry-list\\">',
            '<article class=\\"entry-card\\">',
            '<div class=\\"entry-card-header\\">',
            '<h3 class=\\"entry-card-title\\">',
            '<form class=\\"editor-form experience-form\\" data-experience-index=\\"',
            'id=\\"experience-role-',
            'name=\\"role\\"',
            'data-experience-field=\\"role\\"',
            'placeholder=\\"Ej. Product Designer\\"',
            'id=\\"experience-company-',
            'name=\\"company\\"',
            'data-experience-field=\\"company\\"',
            'placeholder=\\"Ej. Acme Studio\\"',
            'id=\\"experience-location-',
            'name=\\"location\\"',
            'data-experience-field=\\"location\\"',
            'id=\\"experience-start-date-',
            'name=\\"startDate\\"',
            'data-experience-field=\\"startDate\\"',
            'type=\\"month\\"',
            'id=\\"experience-end-date-',
            'name=\\"endDate\\"',
            'data-experience-field=\\"endDate\\"',
            'id=\\"experience-summary-',
            'name=\\"summary\\"',
            'data-experience-field=\\"summary\\"',
            'rows=\\"5\\"',
            'placeholder=\\"Describe responsabilidades, alcance y contexto del rol\\"',
            'ui.escapeHtml(entry.summary || "")',
            'id=\\"experience-achievements-',
            'name=\\"achievements\\"',
            'data-experience-field=\\"achievements\\"',
            'rows=\\"4\\"',
            'placeholder=\\"Resume resultados, metricas o hitos clave\\"',
            'ui.escapeHtml(entry.achievements || "")',
            'ui.escapeHtml(entry.location || "")',
            'ui.escapeHtml(ui.formatExperiencePeriod(entry))',
            '<span class=\\"entry-card-index\\">Experiencia ',
            'ui.escapeHtml(entry.role || "Puesto pendiente")',
            'ui.escapeHtml(entry.company || "Empresa pendiente")',
            'ui.escapeHtml(entry.summary || "Todavia no hay contenido en esta experiencia.")',
            'ui.escapeHtml(entry.achievements || "Todavia no hay logros definidos para esta experiencia.")',
            '<div class=\\"editor-note\\" data-tone=\\"muted\\">Todavia no hay experiencias guardadas en el CV.</div>',
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_experience_section_exposes_add_action_in_toolbar(self):
        expected_snippets = [
            'const contextualActions = state.ui.activeSection === "experience"',
            'data-action=\\"add-experience-entry\\"',
            '>Anadir experiencia</button>',
            "+ contextualActions",
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_app_adds_empty_experience_entry(self):
        expected_snippets = [
            "addExperienceEntry() {",
            "const nextEntry = {",
            'role: "",',
            'company: "",',
            'location: "",',
            'startDate: "",',
            'endDate: "",',
            'summary: "",',
            'achievements: "",',
            "const nextExperience = [...state.cv.experience, nextEntry];",
            "experience: nextExperience,",
            'text: "Experiencia " + String(nextExperience.length) + " anadida.",',
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_toolbar_click_handler_triggers_add_experience_action(self):
        expected_snippets = [
            'const actionButton = event.target.closest("[data-action]");',
            'actionButton.dataset.action === "add-experience-entry"',
            "app.addExperienceEntry();",
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_preview_section_renders_all_experience_entries(self):
        expected_snippets = [
            'const experiencePreview = state.cv.experience.length',
            'state.cv.experience.map((entry) => ""',
            '<div class=\\"preview-card\\">',
            'ui.escapeHtml(entry.role || "Puesto pendiente")',
            'ui.escapeHtml(entry.location || "Ubicacion pendiente")',
            'ui.escapeHtml(ui.formatExperiencePeriod(entry))',
            'ui.escapeHtml(entry.summary || "Resumen pendiente")',
            'ui.escapeHtml(entry.achievements || "Logros pendientes")',
            '<p>Anade tu primera experiencia para completar esta vista previa.</p>',
            '+ experiencePreview',
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_bootstrap_defines_initial_state_and_capabilities(self):
        expected_snippets = [
            'storageKey: "cv-studio-document"',
            "dataModelVersion: 1,",
            "templates: [",
            '{ id: "classic", label: "Classic" }',
            '{ id: "compact", label: "Compact" }',
            "uiDefaults: {",
            'activeSection: "basics"',
            'template: "classic"',
            'tone: "info"',
            "cvSchema: {",
            '$comment: "Compatible con JSON Schema Draft 2020-12."',
            '$id: "cv-studio/schema/cv"',
            'title: "Curriculum Vitae"',
            'required: ["basics", "experience", "education", "meta"]',
            "additionalProperties: false,",
            'meta: { $ref: "#/$defs/meta" },',
            'required: ["version", "updatedAt"],',
            'version: { type: "integer", const: 1 },',
            "initialCV: {",
            'fullName: ""',
            'email: ""',
            'phone: ""',
            'location: ""',
            'web: ""',
            'linkedin: ""',
            'github: ""',
            "experience: [],",
            "education: [],",
            "projects: [],",
            "theme: {",
            'accent: "#1f4b99"',
            "meta: {",
            "version: 1,",
            "basicsFieldLabels: {",
            'fullName: "Nombre completo"',
            'summary: "Resumen profesional"',
            "basicsValidationMessages: {",
            'email: "Introduce un email valido, por ejemplo nombre@dominio.com.",',
            'url: "Introduce una URL valida, por ejemplo tuweb.com o tuweb.com/ruta.",',
            "experienceFieldLabels: {",
            'startDate: "Fecha de inicio"',
            'endDate: "Fecha de fin"',
            'summary: "Descripcion"',
            'achievements: "Logros"',
            "cv: null,",
            "ui: {",
            "message: { ...config.uiDefaults.message },",
            "modal: { ...config.uiDefaults.modal },",
            "read() {",
            "write() {",
            "detectCapabilities() {",
            "window.localStorage.setItem(probeKey, \"ok\");",
            'fileProtocol: window.location.protocol === "file:",',
            "cloneInitialCV() {",
            "const initialCV = app.normalizeCvDocument(JSON.parse(JSON.stringify(config.initialCV)));",
            "initialCV.meta.version = config.dataModelVersion;",
            "return initialCV;",
            "normalizeCvDocument(cvDocument) {",
            "formatJson(value) {",
            "JSON.stringify(value, null, 2)",
            'phone: { type: "string" },',
            'web: { type: "string", format: "uri-reference" },',
            'linkedin: { type: "string", format: "uri-reference" },',
            'github: { type: "string", format: "uri-reference" },',
            'required: ["role", "company", "location", "startDate", "endDate", "summary"],',
            'location: { type: "string", minLength: 1 },',
            'startDate: { type: "string", minLength: 1 },',
            'endDate: { type: "string", minLength: 1 },',
            'achievements: { type: "string" },',
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_bootstrap_validates_email_and_url_formats(self):
        expected_snippets = [
            "getNormalizedUrlCandidate(value) {",
            'return /^[a-z][a-z\\d+\\-.]*:\\/\\//i.test(trimmedValue)',
            ': "https:" + "//" + trimmedValue;',
            "validateBasicFormat(fieldName, fieldValue) {",
            'if (fieldName === "email") {',
            'const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;',
            'return emailPattern.test(normalizedValue) ? "" : config.basicsValidationMessages.email;',
            'if (["web", "linkedin", "github"].includes(fieldName)) {',
            "const url = new URL(app.getNormalizedUrlCandidate(normalizedValue));",
            'url.hostname.includes(".") || url.hostname === "localhost"',
            'return hasValidHost ? "" : config.basicsValidationMessages.url;',
            "syncBasicFieldValidation(input, options = {}) {",
            "input.setCustomValidity(validationMessage);",
            "input.reportValidity();",
            "app.syncBasicFieldValidation(input);",
            "app.syncBasicFieldValidation(input, { report: true });",
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_basics_inputs_sync_with_global_state(self):
        expected_snippets = [
            'updateBasicsField(fieldName, fieldValue) {',
            '!state.cv || !state.cv.basics || !state.hasOwn(config.basicsFieldLabels, fieldName)',
            '[fieldName]: fieldValue,',
            'text: config.basicsFieldLabels[fieldName] + " actualizado.",',
            'const input = event.target.closest("[name]");',
            'const fieldName = input ? input.name : "";',
            'state.ui.activeSection !== "basics"',
            '!state.hasOwn(config.basicsFieldLabels, fieldName)',
            'app.updateBasicsField(fieldName, input.value);',
            'ui.escapeHtml(basics.web || "Web pendiente")',
            'ui.escapeHtml(basics.linkedin || "LinkedIn pendiente")',
            'ui.escapeHtml(basics.github || "GitHub pendiente")',
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_experience_inputs_sync_with_global_state(self):
        expected_snippets = [
            'updateExperienceField(index, fieldName, fieldValue) {',
            '!state.cv || !Array.isArray(state.cv.experience) || !state.hasOwn(config.experienceFieldLabels, fieldName)',
            "const currentEntry = state.cv.experience[index];",
            "const nextExperience = state.cv.experience.map((entry, entryIndex) => entryIndex === index",
            'text: config.experienceFieldLabels[fieldName] + " actualizado en experiencia " + String(index + 1) + ".",',
            'state.ui.activeSection === "basics" && state.hasOwn(config.basicsFieldLabels, fieldName)',
            'state.ui.activeSection !== "experience" || !state.hasOwn(config.experienceFieldLabels, fieldName)',
            'const experienceForm = input.closest("[data-experience-index]");',
            "const experienceIndex = experienceForm ? Number(experienceForm.dataset.experienceIndex) : -1;",
            "app.updateExperienceField(experienceIndex, fieldName, input.value);",
            'achievements: entry && typeof entry.achievements === "string" ? entry.achievements : "",',
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_state_utilities_read_and_write_local_snapshot(self):
        expected_snippets = [
            "listeners: [],",
            "hasOwn(value, key) {",
            "Object.prototype.hasOwnProperty.call(value, key);",
            "isValidSection(sectionId) {",
            "config.sections.some((section) => section.id === sectionId);",
            "isValidTemplate(templateId) {",
            "config.templates.some((template) => template.id === templateId);",
            "getCvModelVersion(cvDocument) {",
            "return cvDocument.meta.version;",
            "isCompatibleCv(cvDocument) {",
            "return state.getCvModelVersion(cvDocument) === config.dataModelVersion;",
            "normalizeSnapshot(snapshot) {",
            'modelVersion: state.hasOwn(snapshot, "modelVersion")',
            "if (normalizedSnapshot.modelVersion !== config.dataModelVersion) {",
            "if (!state.isCompatibleCv(normalizedSnapshot.cv)) {",
            "normalizedSnapshot.cv = app.normalizeCvDocument(normalizedSnapshot.cv);",
            "sanitizeUi(uiPatch) {",
            "const nextUi = {",
            'activeSection: state.ui.activeSection,',
            'template: state.ui.template,',
            "subscribe(listener) {",
            'if (typeof listener !== "function") {',
            "state.listeners.push(listener);",
            "state.listeners = state.listeners.filter((entry) => entry !== listener);",
            "notify() {",
            "state.listeners.forEach((listener) => {",
            "listener(state);",
            "update(patch) {",
            "const nextState = {",
            'booted: state.hasOwn(patch, "booted") ? patch.booted : state.booted,',
            'capabilities: state.hasOwn(patch, "capabilities")',
            'cv: state.hasOwn(patch, "cv") ? patch.cv : state.cv,',
            'ui: state.hasOwn(patch, "ui") ? state.sanitizeUi(patch.ui) : state.ui,',
            "state.booted = nextState.booted;",
            "state.capabilities = nextState.capabilities;",
            "state.ui = nextState.ui;",
            "state.notify();",
            "if (!state.capabilities.storage) {",
            "const rawState = window.localStorage.getItem(config.storageKey);",
            "const parsedState = JSON.parse(rawState);",
            "return state.normalizeSnapshot(parsedState);",
            "if (!state.capabilities.storage || !state.cv) {",
            "const snapshot = {",
            "modelVersion: config.dataModelVersion,",
            "ui: state.ui,",
            "cv: state.cv,",
            "window.localStorage.setItem(config.storageKey, JSON.stringify(snapshot));",
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_bootstrap_renders_initial_ui_and_binds_interactions(self):
        expected_snippets = [
            "renderToolbar() {",
            "renderEditor() {",
            "renderPreview() {",
            "renderModal() {",
            "app.bindEvents();",
            "app.updateStatus();",
            "syncDom() {",
            'document.body.dataset.activeSection = state.ui.activeSection;',
            'document.body.dataset.activeTemplate = state.ui.template;',
            'document.body.dataset.modalOpen = String(state.ui.modal.open);',
            'document.body.dataset.runtimeMode = state.capabilities.fileProtocol ? "file" : "browser";',
            "handleStateChange() {",
            "if (!state.booted || !state.cv) {",
            "app.render();",
            "app.syncDom();",
            "state.write();",
            "subscribeToState() {",
            "state.subscribe(() => {",
            "app.handleStateChange();",
            "ui.toolbar.addEventListener(\"click\"",
            "ui.editorCanvas.addEventListener(\"input\"",
            "event.target.closest(\"[name]\")",
            "app.updateBasicsField(fieldName, input.value);",
            "app.updateExperienceField(experienceIndex, fieldName, input.value);",
            "updatedAt: new Date().toISOString(),",
            "event.target.closest(\"[data-section]\")",
            "event.target.closest(\"[data-template]\")",
            "event.target.closest(\"[data-modal]\")",
            "ui.modal.addEventListener(\"click\"",
            "event.target.closest(\"[data-close-modal]\")",
            "document.body.dataset.appReady = \"true\";",
            "La app ha arrancado en local con estado inicial en memoria y sin dependencias externas.",
            'text: "Editando la seccion " + button.textContent + "."',
            'text: "Plantilla activa: " + templateButton.textContent + "."',
            'text: "Consulta rapida de plantillas abierta."',
            'text: "Modal cerrado. Puedes seguir editando el CV."',
            'data-template=\\"',
            'data-modal=\\"template-help\\"',
            "ui.modal.showModal();",
            "ui.modal.close();",
            'basics.fullName || "Nombre pendiente"',
            'basics.email || "Email pendiente"',
            'basics.phone || "Telefono pendiente"',
            'basics.location || "Ubicacion pendiente"',
            'const experienceEntries = state.cv.experience.length',
            'const experiencePreview = state.cv.experience.length',
            'education.course || "Sin formacion anadida"',
            'state.cv.experience.map((entry, index) => ""',
            'state.cv.experience.map((entry) => ""',
            'entry.role || "Puesto pendiente"',
            'entry.company || "Empresa pendiente"',
            'entry.location || "Ubicacion pendiente"',
            'entry.summary || "Resumen pendiente"',
            'Todavia no hay experiencias guardadas en el CV.',
            'Anade tu primera experiencia para completar esta vista previa.',
            'state.ui.template',
            '<p class=\\"preview-template\\">',
            'id=\\"cv-schema-output\\"',
            'aria-label=\\"Esquema JSON del curriculum\\"',
            "ui.formatJson(config.cvSchema)",
            'config.cvSchema.required.join(", ")',
            "<h3>Esquema JSON</h3>",
            "config.cvSchema.$comment",
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_boot_uses_persisted_state_when_available(self):
        expected_snippets = [
            "app.subscribeToState();",
            "const persistedState = state.read();",
            "const persistedUi = persistedState && persistedState.ui",
            "state.update({ capabilities: app.detectCapabilities() });",
            "state.update({",
            "cv: persistedState && persistedState.cv ? persistedState.cv : app.cloneInitialCV(),",
            'activeSection: persistedState && persistedState.activeSection ? persistedState.activeSection : config.uiDefaults.activeSection,',
            'template: persistedState && persistedState.cv && persistedState.cv.template ? persistedState.cv.template : config.uiDefaults.template,',
            "ui: persistedUi,",
            "booted: true,",
            "app.syncDom();",
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_manages_additional_ui_state_for_template_message_and_modal(self):
        expected_snippets = [
            '<dialog class="app-modal" id="app-modal" aria-labelledby="app-modal-title"></dialog>',
            '.editor-note[data-tone="success"] {',
            '.editor-note[data-tone="muted"] {',
            '.preview-template {',
            ".app-modal {",
            ".modal-card {",
            'kind: modalButton.dataset.modal,',
            "open: true,",
            'kind: null,',
            "open: false,",
            'data-close-modal=\\"true\\"',
            "Plantillas disponibles",
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_surfaces_direct_file_open_verification_in_status(self):
        expected_snippets = [
            ".app-status[data-runtime-mode=\"file\"] {",
            "const runtimeMode = state.capabilities.fileProtocol ? \"file\" : \"browser\";",
            "const protocolLabel = state.capabilities.fileProtocol ? \"verificada al abrir index.html directamente en el navegador\" : \"abierta desde navegador\";",
            "ui.status.dataset.runtimeMode = runtimeMode;",
            '", modelo v" + config.dataModelVersion;',
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_defines_internal_html_css_js_sections(self):
        expected_markers = [
            "<!-- Maintenance: head contains inline CSS only; keep visual tokens before layout and components. -->",
            "<!-- Maintenance: body is split into app shell markup followed by one self-contained bootstrap script. -->",
            "<!-- HTML Section: App Shell -->",
            "<!-- HTML Section: Header -->",
            "<!-- HTML Section: Workspace -->",
            "<!-- HTML Section: Editor Panel -->",
            "<!-- HTML Section: Preview Panel -->",
            "/* CSS Section: Theme */",
            "/* CSS Section: Base */",
            "/* CSS Section: Layout */",
            "/* CSS Section: Components */",
            "/* CSS Section: Responsive */",
            "// JS Section: Namespace",
            "// JS Section: Modules",
            "// JS Section: Bootstrap",
            "// Maintenance map:",
            "// 1. config centralizes static labels, section definitions and seed CV data.",
            "// 2. state stores the active UI section plus runtime capability flags.",
            "// 3. ui owns DOM references, escaping, and all HTML rendering.",
            "// 4. app coordinates cloning, capability detection, event binding and boot.",
            "// Module convention: declare modules in config -> state -> ui -> app order.",
            "// JS Module: config",
            "// JS Module: state",
            "// JS Module: ui",
            "// JS Module: app",
        ]
        for marker in expected_markers:
            with self.subTest(marker=marker):
                self.assertIn(marker, self.content)

    def test_declares_logical_modules_in_convention_order(self):
        markers = [
            "// JS Module: config",
            "// JS Module: state",
            "// JS Module: ui",
            "// JS Module: app",
        ]
        positions = [self.content.index(marker) for marker in markers]
        self.assertEqual(positions, sorted(positions))

    def test_has_no_remote_runtime_dependencies(self):
        self.assertEqual(self.parser.remote_refs, [])


if __name__ == "__main__":
    unittest.main()
