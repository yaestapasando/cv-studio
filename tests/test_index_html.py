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
            ".editor-input {",
            '<form class=\\"editor-form\\" id=\\"basics-form\\">',
            '<label for=\\"full-name-input\\"><span>Nombre completo</span></label>',
            'id=\\"full-name-input\\"',
            'name=\\"fullName\\"',
            'class=\\"editor-field editor-input\\"',
            'type=\\"text\\"',
            'autocomplete=\\"name\\"',
            'placeholder=\\"Escribe tu nombre completo\\"',
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
            'phone: ""',
            'website: ""',
            "experience: [],",
            "education: [],",
            "projects: [],",
            "theme: {",
            'accent: "#1f4b99"',
            "meta: {",
            "version: 1,",
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
            "const initialCV = JSON.parse(JSON.stringify(config.initialCV));",
            "initialCV.meta.version = config.dataModelVersion;",
            "return initialCV;",
            "formatJson(value) {",
            "JSON.stringify(value, null, 2)",
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
            "event.target.closest(\"[name=\\\"fullName\\\"]\")",
            'text: "Nombre completo actualizado."',
            "fullName: fullNameInput.value,",
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
            'experience.role || "Sin experiencia anadida"',
            'education.course || "Sin formacion anadida"',
            'experience.summary || "Anade tu primera experiencia para completar esta vista previa."',
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
