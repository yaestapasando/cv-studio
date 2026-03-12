from html.parser import HTMLParser
import json
from pathlib import Path
import subprocess
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
        cls.script_content = cls.content.split("<script>", 1)[1].split("</script>", 1)[0].replace("CVStudio.app.boot();", "")

    def run_js_scenario(self, scenario):
        node_program = f"""
const vm = require("node:vm");
const scriptContent = {json.dumps(self.script_content)};
const scenario = {json.dumps(scenario)};

function createElement() {{
  return {{
    innerHTML: "",
    textContent: "",
    dataset: {{}},
    open: false,
    addEventListener() {{}},
    showModal() {{ this.open = true; }},
    close() {{ this.open = false; }},
  }};
}}

const elements = new Map();
const document = {{
  body: {{ dataset: {{}} }},
  getElementById(id) {{
    if (!elements.has(id)) {{
      elements.set(id, createElement());
    }}
    return elements.get(id);
  }},
}};
const localStorage = {{
  store: new Map(),
  getItem(key) {{
    return this.store.has(key) ? this.store.get(key) : null;
  }},
  setItem(key, value) {{
    this.store.set(key, String(value));
  }},
  removeItem(key) {{
    this.store.delete(key);
  }},
}};
const sandbox = {{
  console,
  document,
  window: {{
    document,
    localStorage,
    location: {{ protocol: "file:" }},
  }},
  URL,
}};

vm.runInNewContext(scriptContent, sandbox);
const result = vm.runInNewContext(scenario, sandbox);
process.stdout.write(JSON.stringify(result));
"""
        completed = subprocess.run(
            ["node"],
            input=node_program,
            text=True,
            capture_output=True,
            check=True,
            cwd=ROOT,
        )
        return json.loads(completed.stdout)

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
            '<div class=\\"entry-card-actions\\">',
            '<div class=\\"entry-card-action-group\\">',
            '<h3 class=\\"entry-card-title\\">',
            'data-action=\\"move-experience-entry-up\\"',
            '>Subir</button>',
            'data-action=\\"move-experience-entry-down\\"',
            '>Bajar</button>',
            'data-action=\\"remove-experience-entry\\"',
            'data-experience-index=\\"" + String(index) + "\\"',
            '>Eliminar</button>',
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
            'id=\\"experience-current-',
            'name=\\"isCurrent\\"',
            'data-experience-field=\\"isCurrent\\"',
            'type=\\"checkbox\\"',
            'experience-current-help-',
            'Marca esta opcion si sigues trabajando en este puesto.',
            '(entry.isCurrent ? " checked" : "")',
            '(entry.isCurrent ? " disabled" : "")',
            'id=\\"experience-summary-',
            'name=\\"summary\\"',
            'data-experience-field=\\"summary\\"',
            'rows=\\"5\\"',
            'placeholder=\\"Describe responsabilidades, alcance y contexto del rol\\"',
            'ui.escapeHtml(entry.summary || "")',
            'id=\\"experience-achievements-',
            'name=\\"achievements\\"',
            'data-experience-field=\\"achievements\\"',
            'rows=\\"6\\"',
            'placeholder=\\"Escribe un logro por linea para crear multiples bullets\\"',
            'ui.escapeHtml(ui.getExperienceAchievements(entry).join("\\n"))',
            'id=\\"experience-notes-',
            'name=\\"notes\\"',
            'data-experience-field=\\"notes\\"',
            'rows=\\"4\\"',
            'placeholder=\\"Escribe notas opcionales, contexto o menciones, una por linea\\"',
            'ui.escapeHtml(ui.getEntryNotes(entry).join("\\n"))',
            'ui.escapeHtml(entry.location || "")',
            'ui.escapeHtml(ui.formatExperiencePeriod(entry))',
            '<span class=\\"entry-card-index\\">Experiencia ',
            'ui.escapeHtml(entry.role || "Puesto pendiente")',
            'ui.escapeHtml(entry.company || "Empresa pendiente")',
            'ui.escapeHtml(entry.summary || "Todavia no hay contenido en esta experiencia.")',
            'ui.renderAchievementList(ui.getExperienceAchievements(entry), "Todavia no hay logros definidos para esta experiencia.")',
            'ui.renderAchievementList(ui.getEntryNotes(entry), "Todavia no hay notas opcionales definidas para esta experiencia.")',
            '<div class=\\"editor-note\\" data-tone=\\"muted\\">Todavia no hay experiencias guardadas en el CV.</div>',
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_skills_section_supports_simple_and_categorized_modes(self):
        expected_snippets = [
            '{ id: "skills", label: "Habilidades" },',
            "skillFieldLabels: {",
            'mode: "Modo de habilidades"',
            'items: "Lista simple"',
            'categories: "Categorias"',
            'skills: {',
            'mode: "simple",',
            'items: [],',
            'categories: [],',
            'const skills = state.cv.skills;',
            'const skillsItemsValue = ui.escapeHtml(ui.getSkillItems(skills.items).join("\\n"));',
            'const skillsCategoriesValue = ui.escapeHtml(ui.serializeSkillCategories(ui.getSkillCategories(skills.categories)));',
            'skills: ""',
            'Elige si prefieres mostrar habilidades en una lista simple o agrupadas por categorias.',
            '<form class=\\"editor-form\\" id=\\"skills-form\\">',
            'id=\\"skills-mode-simple\\"',
            'data-skills-field=\\"mode\\"',
            '> Lista simple</label>',
            'id=\\"skills-mode-categories\\"',
            '> Por categorias</label>',
            'id=\\"skills-items-input\\"',
            'name=\\"items\\"',
            'data-skills-field=\\"items\\"',
            'placeholder=\\"Escribe una habilidad por linea\\"',
            'id=\\"skills-categories-input\\"',
            'name=\\"categories\\"',
            'data-skills-field=\\"categories\\"',
            'placeholder=\\"Frontend: HTML, CSS, JavaScript\\"',
            'Escribe una categoria por linea con el formato Categoria: habilidad, habilidad.',
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_skills_preview_renders_selected_format(self):
        expected_snippets = [
            'const normalizedSkillItems = ui.getSkillItems(skills.items);',
            'const normalizedSkillCategories = ui.getSkillCategories(skills.categories);',
            'const skillsPreview = skills.mode === "categories"',
            '<h3>Habilidades</h3>',
            'Formato: " + ui.escapeHtml(skills.mode === "categories" ? "Por categorias" : "Lista simple")',
            'Anade categorias con habilidades para completar esta vista previa.',
            'Anade tus habilidades principales para completar esta vista previa.',
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_app_normalizes_and_updates_skills(self):
        expected_snippets = [
            "getSkillItems(value) {",
            "getSkillCategories(value) {",
            "serializeSkillCategories(categories) {",
            "parseSkillCategories(value) {",
            "normalizeSkills(value) {",
            'mode: "simple",',
            'mode: "categories",',
            "items: ui.getSkillItems(value.items),",
            "categories: ui.getSkillCategories(value.categories),",
            "const skills = app.normalizeSkills(cvDocument.skills);",
            "updateSkillsField(fieldName, fieldValue) {",
            "!state.cv || !state.cv.skills || !state.hasOwn(config.skillFieldLabels, fieldName)",
            'fieldName === "mode"',
            ': fieldName === "items"',
            ": app.parseSkillsCategories(fieldValue),",
            "skills: nextSkills,",
            'text: config.skillFieldLabels[fieldName] + " actualizado.",',
            'state.ui.activeSection === "skills" && state.hasOwn(config.skillFieldLabels, fieldName)',
            "app.updateSkillsField(fieldName, input.type === \"radio\" ? input.value : input.value);",
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_normalize_skills_supports_legacy_simple_array(self):
        result = self.run_js_scenario(
            """
const skills = CVStudio.app.normalizeSkills(["HTML", " CSS ", "", "JavaScript"]);
({
  mode: skills.mode,
  items: skills.items,
  categories: skills.categories,
});
"""
        )
        self.assertEqual(result["mode"], "simple")
        self.assertEqual(result["items"], ["HTML", "CSS", "JavaScript"])
        self.assertEqual(result["categories"], [])

    def test_normalize_skills_supports_categorized_entries(self):
        result = self.run_js_scenario(
            """
const skills = CVStudio.app.normalizeSkills([
  { category: "Frontend", skills: ["HTML", "CSS"] },
  { name: "Backend", items: "Node.js\\nAPIs" },
]);
({
  mode: skills.mode,
  items: skills.items,
  categories: skills.categories,
});
"""
        )
        self.assertEqual(result["mode"], "categories")
        self.assertEqual(result["items"], [])
        self.assertEqual(
            result["categories"],
            [
                {"name": "Frontend", "items": ["HTML", "CSS"]},
                {"name": "Backend", "items": ["Node.js", "APIs"]},
            ],
        )

    def test_update_skills_field_supports_both_editor_modes(self):
        result = self.run_js_scenario(
            """
const cv = CVStudio.app.cloneInitialCV();
CVStudio.state.update({ cv, ui: { activeSection: "skills" } });
CVStudio.app.updateSkillsField("items", "HTML\\nCSS");
CVStudio.app.updateSkillsField("mode", "categories");
CVStudio.app.updateSkillsField("categories", "Frontend: HTML, CSS\\nBackend: Node.js, APIs");
({
  skills: CVStudio.state.cv.skills,
  message: CVStudio.state.ui.message.text,
});
"""
        )
        self.assertEqual(result["skills"]["mode"], "categories")
        self.assertEqual(result["skills"]["items"], ["HTML", "CSS"])
        self.assertEqual(
            result["skills"]["categories"],
            [
                {"name": "Frontend", "items": ["HTML", "CSS"]},
                {"name": "Backend", "items": ["Node.js", "APIs"]},
            ],
        )
        self.assertEqual(result["message"], "Categorias actualizado.")

    def test_experience_section_removes_entries_from_state(self):
        expected_snippets = [
            "removeExperienceEntry(index) {",
            "const nextExperience = state.cv.experience.filter((entry, entryIndex) => entryIndex !== index);",
            "experience: nextExperience,",
            'text: "Experiencia " + String(index + 1) + " eliminada.",',
            'if (actionButton.dataset.action === "remove-experience-entry") {',
            "app.removeExperienceEntry(experienceIndex);",
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_education_section_lists_existing_entries(self):
        expected_snippets = [
            'const educationEntries = state.cv.education.length',
            '<div class=\\"editor-note\\" data-tone=\\"muted\\">Listado de formacion existente en el documento.</div>',
            '<button type=\\"button\\" class=\\"toolbar-pill toolbar-button\\" data-action=\\"remove-education-entry\\"',
            'data-education-index=\\"" + String(index) + "\\"',
            '>Eliminar</button>',
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_education_section_removes_entries_from_state(self):
        expected_snippets = [
            "removeEducationEntry(index) {",
            "const nextEducation = state.cv.education.filter((entry, entryIndex) => entryIndex !== index);",
            "education: nextEducation,",
            'text: "Formacion " + String(index + 1) + " eliminada.",',
            'if (actionButton.dataset.action === "remove-education-entry") {',
            "app.removeEducationEntry(educationIndex);",
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_projects_section_lists_existing_entries(self):
        expected_snippets = [
            "projectFieldLabels: {",
            'name: "Nombre del proyecto"',
            'role: "Rol"',
            'url: "Enlace"',
            'stack: "Stack"',
            'summary: "Descripcion"',
            'highlights: "Hitos"',
            'const projectEntries = state.cv.projects.length',
            '<div class=\\"editor-note\\" data-tone=\\"muted\\">Listado de proyectos existentes en el documento.</div>',
            '<article class=\\"entry-card\\">',
            '<span class=\\"entry-card-index\\">Proyecto ',
            'data-action=\\"move-project-entry-up\\"',
            'data-action=\\"move-project-entry-down\\"',
            'data-action=\\"remove-project-entry\\"',
            'data-project-index=\\"" + String(index) + "\\"',
            '<form class=\\"editor-form project-form\\" data-project-index=\\"',
            'id=\\"project-name-',
            'name=\\"name\\"',
            'data-project-field=\\"name\\"',
            'placeholder=\\"Ej. Design System Atlas\\"',
            'id=\\"project-role-',
            'name=\\"role\\"',
            'data-project-field=\\"role\\"',
            'id=\\"project-url-',
            'name=\\"url\\"',
            'type=\\"url\\"',
            'data-project-field=\\"url\\"',
            'placeholder=\\"portfolio.dev/proyecto\\"',
            'id=\\"project-stack-',
            'name=\\"stack\\"',
            'data-project-field=\\"stack\\"',
            'placeholder=\\"Ej. HTML, CSS, JavaScript\\"',
            'id=\\"project-summary-',
            'name=\\"summary\\"',
            'data-project-field=\\"summary\\"',
            'placeholder=\\"Resume el problema, el alcance y el resultado del proyecto\\"',
            'id=\\"project-highlights-',
            'name=\\"highlights\\"',
            'data-project-field=\\"highlights\\"',
            'placeholder=\\"Escribe un hito por linea para destacar impacto, stack o resultados\\"',
            'ui.escapeHtml(ui.getProjectHighlights(entry).join("\\n"))',
            'ui.escapeHtml(entry.name || "Proyecto pendiente")',
            'ui.escapeHtml(entry.role || "Rol pendiente")',
            'ui.escapeHtml(entry.summary || "Todavia no hay descripcion para este proyecto.")',
            'ui.escapeHtml(entry.url || "Sin enlace publicado")',
            'ui.escapeHtml(entry.stack || "Stack pendiente")',
            'ui.renderAchievementList(ui.getProjectHighlights(entry), "Todavia no hay hitos definidos para este proyecto.")',
            '<div class=\\"editor-note\\" data-tone=\\"muted\\">Todavia no hay proyectos guardados en el CV.</div>',
            'data-action=\\"add-project-entry\\"',
            '>Anadir otro proyecto</button>',
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_app_manages_project_entries(self):
        expected_snippets = [
            "getProjectHighlights(entry) {",
            "if (entry && Array.isArray(entry.highlights)) {",
            'if (entry && typeof entry.highlights === "string") {',
            'if (entry && typeof entry.highlight === "string") {',
            "normalizeProjectHighlights(highlights) {",
            "return ui.getProjectHighlights({ highlights });",
            "normalizeProjectEntry(entry) {",
            'name: entry && typeof entry.name === "string"',
            '? entry.name',
            ': entry && typeof entry.title === "string"',
            '? entry.title',
            'role: entry && typeof entry.role === "string" ? entry.role : "",',
            'url: entry && typeof entry.url === "string" ? entry.url : "",',
            'stack: entry && typeof entry.stack === "string" ? entry.stack : "",',
            'summary: entry && typeof entry.summary === "string" ? entry.summary : "",',
            "highlights: ui.getProjectHighlights(entry),",
            "const projects = Array.isArray(cvDocument.projects)",
            "? cvDocument.projects.map((entry) => app.normalizeProjectEntry(entry))",
            "updateProjectField(index, fieldName, fieldValue) {",
            '!state.cv || !Array.isArray(state.cv.projects) || !state.hasOwn(config.projectFieldLabels, fieldName)',
            "const currentEntry = state.cv.projects[index];",
            'const normalizedFieldValue = fieldName === "highlights"',
            "? app.normalizeProjectHighlights(fieldValue)",
            ': fieldValue;',
            "const nextProjects = state.cv.projects.map((entry, entryIndex) => entryIndex === index",
            "projects: nextProjects,",
            'text: config.projectFieldLabels[fieldName] + " actualizado en proyecto " + String(index + 1) + ".",',
            "addProjectEntry() {",
            'name: "",',
            'role: "",',
            'url: "",',
            'stack: "",',
            'summary: "",',
            'highlights: [],',
            "const nextProjects = [...state.cv.projects, nextEntry];",
            'text: "Proyecto " + String(nextProjects.length) + " anadido.",',
            "removeProjectEntry(index) {",
            "!state.cv || !Array.isArray(state.cv.projects)",
            "!Number.isInteger(index) || index < 0 || index >= state.cv.projects.length",
            "const nextProjects = state.cv.projects.filter((entry, entryIndex) => entryIndex !== index);",
            'text: "Proyecto " + String(index + 1) + " eliminado.",',
            "moveProjectEntry(index, direction) {",
            'app.moveListEntry("projects", index, targetIndex, "Proyecto", "movido");',
            "moveProjectEntryToPosition(index, rawTargetPosition) {",
            'app.moveListEntry("projects", index, Number(rawTargetPosition) - 1, "Proyecto", "movido");',
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_app_reorders_project_entries_functionally(self):
        result = self.run_js_scenario(
            """
const cv = CVStudio.app.cloneInitialCV();
cv.projects = [
  { name: "Primero", role: "Design", url: "uno.dev", stack: "HTML", summary: "Uno", highlights: ["A"] },
  { name: "Segundo", role: "Code", url: "dos.dev", stack: "JS", summary: "Dos", highlights: ["B"] },
];
CVStudio.state.update({ cv, ui: { activeSection: "projects" } });
CVStudio.app.moveProjectEntry(1, "up");
({
  names: CVStudio.state.cv.projects.map((entry) => entry.name),
  message: CVStudio.state.ui.message.text,
});
"""
        )
        self.assertEqual(result["names"], ["Segundo", "Primero"])
        self.assertEqual(result["message"], "Proyecto 2 movido a la posicion 1.")

    def test_app_reorders_project_entries_to_manual_position(self):
        result = self.run_js_scenario(
            """
const cv = CVStudio.app.cloneInitialCV();
cv.projects = [
  { name: "Primero", role: "Design", url: "uno.dev", stack: "HTML", summary: "Uno", highlights: ["A"] },
  { name: "Segundo", role: "Code", url: "dos.dev", stack: "JS", summary: "Dos", highlights: ["B"] },
  { name: "Tercero", role: "Ship", url: "tres.dev", stack: "CSS", summary: "Tres", highlights: ["C"] },
];
CVStudio.state.update({ cv, ui: { activeSection: "projects" } });
CVStudio.app.moveProjectEntryToPosition(0, "3");
({
  names: CVStudio.state.cv.projects.map((entry) => entry.name),
  message: CVStudio.state.ui.message.text,
});
"""
        )
        self.assertEqual(result["names"], ["Segundo", "Tercero", "Primero"])
        self.assertEqual(result["message"], "Proyecto 1 movido a la posicion 3.")

    def test_normalize_project_entry_preserves_stack(self):
        result = self.run_js_scenario(
            """
const entry = CVStudio.app.normalizeProjectEntry({
  title: "Atlas",
  role: "Lead",
  url: "atlas.dev",
  stack: "HTML, CSS, JS",
  summary: "Sistema",
  highlights: "Uno\\nDos",
});
({
  name: entry.name,
  stack: entry.stack,
  highlights: entry.highlights,
});
"""
        )
        self.assertEqual(result["name"], "Atlas")
        self.assertEqual(result["stack"], "HTML, CSS, JS")
        self.assertEqual(result["highlights"], ["Uno", "Dos"])

    def test_normalize_project_entry_supports_legacy_single_highlight(self):
        result = self.run_js_scenario(
            """
const entry = CVStudio.app.normalizeProjectEntry({
  title: "Atlas",
  role: "Lead",
  summary: "Sistema",
  highlight: "Uno\\nDos",
});
({
  name: entry.name,
  highlights: entry.highlights,
});
"""
        )
        self.assertEqual(result["name"], "Atlas")
        self.assertEqual(result["highlights"], ["Uno", "Dos"])

    def test_update_project_field_normalizes_multiple_highlights(self):
        result = self.run_js_scenario(
            """
const cv = CVStudio.app.cloneInitialCV();
cv.projects = [
  { name: "Atlas", role: "Lead", url: "", stack: "HTML", summary: "Sistema", highlights: [] },
];
CVStudio.state.update({ cv, ui: { activeSection: "projects" } });
CVStudio.app.updateProjectField(0, "highlights", "Uno\\n\\nDos\\n Tres ");
({
  highlights: CVStudio.state.cv.projects[0].highlights,
  message: CVStudio.state.ui.message.text,
});
"""
        )
        self.assertEqual(result["highlights"], ["Uno", "Dos", "Tres"])
        self.assertEqual(result["message"], "Hitos actualizado en proyecto 1.")

    def test_projects_inputs_and_actions_sync_with_global_state(self):
        expected_snippets = [
            'actionButton.dataset.action === "add-project-entry"',
            "app.addProjectEntry();",
            'state.ui.activeSection === "projects" && state.hasOwn(config.projectFieldLabels, fieldName)',
            'const projectForm = input.closest("[data-project-index]");',
            "const projectIndex = projectForm ? Number(projectForm.dataset.projectIndex) : -1;",
            "app.updateProjectField(projectIndex, fieldName, input.value);",
            'const projectIndex = Number(actionButton.dataset.projectIndex);',
            'actionButton.dataset.action === "remove-project-entry"',
            "app.removeProjectEntry(projectIndex);",
            'actionButton.dataset.action === "move-project-entry-up"',
            'app.moveProjectEntry(projectIndex, "up");',
            'actionButton.dataset.action === "move-project-entry-down"',
            'app.moveProjectEntry(projectIndex, "down");',
            'actionButton.dataset.action === "move-project-entry-to-position"',
            'const targetInput = ui.editorCanvas.querySelector("[data-projectTargetPosition=\\"" + String(projectIndex) + "\\"]");',
            "app.moveProjectEntryToPosition(projectIndex, targetInput ? targetInput.value : \"\");",
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_experience_section_exposes_add_action_in_toolbar(self):
        expected_snippets = [
            'const contextualActions = state.ui.activeSection === "experience"',
            'data-action=\\"add-experience-entry\\"',
            '>Anadir experiencia</button>',
            'state.ui.activeSection === "projects"',
            'data-action=\\"add-project-entry\\"',
            '>Anadir proyecto</button>',
            'state.ui.activeSection === "education"',
            'data-action=\\"add-education-entry\\"',
            '>Anadir formacion</button>',
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
            'isCurrent: false,',
            'endDate: "",',
            'summary: "",',
            'achievements: [],',
            'notes: [],',
            "const nextExperience = [...state.cv.experience, nextEntry];",
            "experience: nextExperience,",
            'text: "Experiencia " + String(nextExperience.length) + " anadida.",',
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_app_removes_experience_entry(self):
        expected_snippets = [
            "removeExperienceEntry(index) {",
            "!state.cv || !Array.isArray(state.cv.experience)",
            "!Number.isInteger(index) || index < 0 || index >= state.cv.experience.length",
            "const nextExperience = state.cv.experience.filter((entry, entryIndex) => entryIndex !== index);",
            "experience: nextExperience,",
            'text: "Experiencia " + String(index + 1) + " eliminada.",',
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_app_reorders_experience_entries(self):
        expected_snippets = [
            "moveListEntry(collectionName, index, targetIndex, singularLabel, movementLabel) {",
            "!state.cv || !Array.isArray(state.cv[collectionName])",
            "const nextEntries = [...state.cv[collectionName]];",
            "const movedEntry = nextEntries.splice(index, 1)[0];",
            "nextEntries.splice(targetIndex, 0, movedEntry);",
            '[collectionName]: nextEntries,',
            'text: singularLabel + " " + String(index + 1) + " " + movementLabel + " a la posicion " + String(targetIndex + 1) + ".",',
            "moveExperienceEntry(index, direction) {",
            '!state.cv || !Array.isArray(state.cv.experience)',
            '!Number.isInteger(index) || index < 0 || index >= state.cv.experience.length',
            'const targetIndex = direction === "up"',
            ': direction === "down"',
            'app.moveListEntry("experience", index, targetIndex, "Experiencia", "movida");',
            "moveExperienceEntryToPosition(index, rawTargetPosition) {",
            'app.moveListEntry("experience", index, Number(rawTargetPosition) - 1, "Experiencia", "movida");',
            '(index === 0 ? " disabled" : "")',
            '(index === state.cv.experience.length - 1 ? " disabled" : "")',
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_app_reorders_experience_entries_functionally(self):
        result = self.run_js_scenario(
            """
const cv = CVStudio.app.cloneInitialCV();
cv.experience = [
  { role: "Primera", company: "A", location: "Madrid", startDate: "2024-01", isCurrent: false, endDate: "2024-06", summary: "Uno", achievements: [] },
  { role: "Segunda", company: "B", location: "Berlin", startDate: "2024-07", isCurrent: true, endDate: "", summary: "Dos", achievements: [] },
];
CVStudio.state.update({ cv, ui: { activeSection: "experience" } });
CVStudio.app.moveExperienceEntry(0, "down");
({
  roles: CVStudio.state.cv.experience.map((entry) => entry.role),
  message: CVStudio.state.ui.message.text,
});
"""
        )
        self.assertEqual(result["roles"], ["Segunda", "Primera"])
        self.assertEqual(result["message"], "Experiencia 1 movida a la posicion 2.")

    def test_app_reorders_experience_entries_to_manual_position(self):
        result = self.run_js_scenario(
            """
const cv = CVStudio.app.cloneInitialCV();
cv.experience = [
  { role: "Primera", company: "A", location: "Madrid", startDate: "2024-01", isCurrent: false, endDate: "2024-06", summary: "Uno", achievements: [] },
  { role: "Segunda", company: "B", location: "Berlin", startDate: "2024-07", isCurrent: true, endDate: "", summary: "Dos", achievements: [] },
  { role: "Tercera", company: "C", location: "Paris", startDate: "2025-01", isCurrent: false, endDate: "2025-06", summary: "Tres", achievements: [] },
];
CVStudio.state.update({ cv, ui: { activeSection: "experience" } });
CVStudio.app.moveExperienceEntryToPosition(2, "1");
({
  roles: CVStudio.state.cv.experience.map((entry) => entry.role),
  message: CVStudio.state.ui.message.text,
});
"""
        )
        self.assertEqual(result["roles"], ["Tercera", "Primera", "Segunda"])
        self.assertEqual(result["message"], "Experiencia 3 movida a la posicion 1.")

    def test_app_ignores_invalid_experience_reorder_direction(self):
        result = self.run_js_scenario(
            """
const cv = CVStudio.app.cloneInitialCV();
cv.experience = [
  { role: "Primera", company: "A", location: "Madrid", startDate: "2024-01", isCurrent: false, endDate: "2024-06", summary: "Uno", achievements: [] },
  { role: "Segunda", company: "B", location: "Berlin", startDate: "2024-07", isCurrent: true, endDate: "", summary: "Dos", achievements: [] },
];
CVStudio.state.update({ cv, ui: { activeSection: "experience" } });
CVStudio.app.moveExperienceEntry(0, "up");
({
  roles: CVStudio.state.cv.experience.map((entry) => entry.role),
  message: CVStudio.state.ui.message.text,
});
"""
        )
        self.assertEqual(result["roles"], ["Primera", "Segunda"])
        self.assertNotEqual(result["message"], "Experiencia 1 movida a la posicion 0.")

    def test_toolbar_click_handler_triggers_add_experience_action(self):
        expected_snippets = [
            'const actionButton = event.target.closest("[data-action]");',
            'actionButton.dataset.action === "add-experience-entry"',
            "app.addExperienceEntry();",
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_editor_click_handler_triggers_remove_experience_action(self):
        expected_snippets = [
            'ui.editorCanvas.addEventListener("click", (event) => {',
            'if (!actionButton) {',
            'actionButton.dataset.action === "remove-experience-entry"',
            "const experienceIndex = Number(actionButton.dataset.experienceIndex);",
            "app.removeExperienceEntry(experienceIndex);",
            'actionButton.dataset.action === "move-experience-entry-up"',
            'app.moveExperienceEntry(experienceIndex, "up");',
            'actionButton.dataset.action === "move-experience-entry-down"',
            'app.moveExperienceEntry(experienceIndex, "down");',
            'actionButton.dataset.action === "move-experience-entry-to-position"',
            'const targetInput = ui.editorCanvas.querySelector("[data-experienceTargetPosition=\\"" + String(experienceIndex) + "\\"]");',
            "app.moveExperienceEntryToPosition(experienceIndex, targetInput ? targetInput.value : \"\");",
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
            'ui.renderAchievementList(ui.getExperienceAchievements(entry), "Logros pendientes")',
            'ui.renderAchievementList(ui.getEntryNotes(entry), "Notas opcionales pendientes")',
            '<p>Anade tu primera experiencia para completar esta vista previa.</p>',
            '+ experiencePreview',
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_education_section_lists_existing_entries(self):
        expected_snippets = [
            "educationFieldLabels: {",
            'title: "Titulo"',
            'center: "Centro"',
            'dates: "Fechas"',
            'details: "Detalles"',
            'notes: "Menciones"',
            'const educationEntries = state.cv.education.length',
            '<div class=\\"editor-note\\" data-tone=\\"muted\\">Listado de formacion existente en el documento.</div>',
            '<article class=\\"entry-card\\">',
            '<span class=\\"entry-card-index\\">Formacion ',
            'data-action=\\"move-education-entry-up\\"',
            '>Subir</button>',
            'data-action=\\"move-education-entry-down\\"',
            '>Bajar</button>',
            'data-action=\\"remove-education-entry\\"',
            'data-education-index=\\"" + String(index) + "\\"',
            '<form class=\\"editor-form education-form\\" data-education-index=\\"',
            'id=\\"education-title-',
            'name=\\"title\\"',
            'data-education-field=\\"title\\"',
            'placeholder=\\"Ej. Grado en Diseno\\"',
            'id=\\"education-center-',
            'name=\\"center\\"',
            'data-education-field=\\"center\\"',
            'placeholder=\\"Ej. Universidad de Valencia\\"',
            'id=\\"education-dates-',
            'name=\\"dates\\"',
            'data-education-field=\\"dates\\"',
            'placeholder=\\"Ej. 2018 - 2022\\"',
            'id=\\"education-details-',
            'name=\\"details\\"',
            'data-education-field=\\"details\\"',
            'rows=\\"4\\"',
            'placeholder=\\"Contexto relevante, menciones, especializacion o logros academicos\\"',
            'ui.escapeHtml(entry.details || "")',
            'id=\\"education-notes-',
            'name=\\"notes\\"',
            'data-education-field=\\"notes\\"',
            'placeholder=\\"Escribe menciones, logros o notas opcionales, una por linea\\"',
            'ui.escapeHtml(ui.getEntryNotes(entry).join("\\n"))',
            'ui.escapeHtml(entry.title || "Titulo pendiente")',
            'ui.escapeHtml(entry.center || "Centro pendiente")',
            'ui.escapeHtml(entry.dates || "Pendiente")',
            'ui.escapeHtml(entry.details || "Sin detalles anadidos")',
            'ui.renderAchievementList(ui.getEntryNotes(entry), "Todavia no hay menciones definidas para esta formacion.")',
            '<div class=\\"editor-note\\" data-tone=\\"muted\\">Todavia no hay formacion guardada en el CV.</div>',
            'data-action=\\"add-education-entry\\"',
            '>Anadir otra formacion</button>',
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_app_manages_education_entries(self):
        expected_snippets = [
            "normalizeEducationEntry(entry) {",
            'title: entry && typeof entry.title === "string"',
            '? entry.title',
            ': entry && typeof entry.course === "string"',
            '? entry.course',
            'center: entry && typeof entry.center === "string"',
            '? entry.center',
            ': entry && typeof entry.school === "string"',
            '? entry.school',
            'dates: entry && typeof entry.dates === "string"',
            '? entry.dates',
            ': entry && typeof entry.period === "string"',
            '? entry.period',
            'details: entry && typeof entry.details === "string" ? entry.details : "",',
            'notes: app.normalizeEntryNotes(entry ? entry.notes : []),',
            'const education = Array.isArray(cvDocument.education)',
            '? cvDocument.education.map((entry) => app.normalizeEducationEntry(entry))',
            "updateEducationField(index, fieldName, fieldValue) {",
            '!state.cv || !Array.isArray(state.cv.education) || !state.hasOwn(config.educationFieldLabels, fieldName)',
            "const currentEntry = state.cv.education[index];",
            "const nextEducation = state.cv.education.map((entry, entryIndex) => entryIndex === index",
            '[fieldName]: fieldValue,',
            'text: config.educationFieldLabels[fieldName] + " actualizado en formacion " + String(index + 1) + ".",',
            "addEducationEntry() {",
            'title: "",',
            'center: "",',
            'dates: "",',
            'details: "",',
            'notes: [],',
            "const nextEducation = [...state.cv.education, nextEntry];",
            'text: "Formacion " + String(nextEducation.length) + " anadida.",',
            "removeEducationEntry(index) {",
            "!state.cv || !Array.isArray(state.cv.education)",
            "!Number.isInteger(index) || index < 0 || index >= state.cv.education.length",
            "const nextEducation = state.cv.education.filter((entry, entryIndex) => entryIndex !== index);",
            'text: "Formacion " + String(index + 1) + " eliminada.",',
            "moveEducationEntry(index, direction) {",
            'app.moveListEntry("education", index, targetIndex, "Formacion", "movida");',
            "moveEducationEntryToPosition(index, rawTargetPosition) {",
            'app.moveListEntry("education", index, Number(rawTargetPosition) - 1, "Formacion", "movida");',
            '(index === 0 ? " disabled" : "")',
            '(index === state.cv.education.length - 1 ? " disabled" : "")',
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_app_reorders_education_entries_functionally(self):
        result = self.run_js_scenario(
            """
const cv = CVStudio.app.cloneInitialCV();
cv.education = [
  { title: "Primera", center: "A", dates: "2018 - 2020", details: "" },
  { title: "Segunda", center: "B", dates: "2020 - 2022", details: "" },
];
CVStudio.state.update({ cv, ui: { activeSection: "education" } });
CVStudio.app.moveEducationEntry(1, "up");
({
  titles: CVStudio.state.cv.education.map((entry) => entry.title),
  message: CVStudio.state.ui.message.text,
});
"""
        )
        self.assertEqual(result["titles"], ["Segunda", "Primera"])
        self.assertEqual(result["message"], "Formacion 2 movida a la posicion 1.")

    def test_app_reorders_education_entries_to_manual_position(self):
        result = self.run_js_scenario(
            """
const cv = CVStudio.app.cloneInitialCV();
cv.education = [
  { title: "Primera", center: "A", dates: "2018 - 2020", details: "" },
  { title: "Segunda", center: "B", dates: "2020 - 2022", details: "" },
  { title: "Tercera", center: "C", dates: "2022 - 2024", details: "" },
];
CVStudio.state.update({ cv, ui: { activeSection: "education" } });
CVStudio.app.moveEducationEntryToPosition(0, "2");
({
  titles: CVStudio.state.cv.education.map((entry) => entry.title),
  message: CVStudio.state.ui.message.text,
});
"""
        )
        self.assertEqual(result["titles"], ["Segunda", "Primera", "Tercera"])
        self.assertEqual(result["message"], "Formacion 1 movida a la posicion 2.")

    def test_education_inputs_and_actions_sync_with_global_state(self):
        expected_snippets = [
            'actionButton.dataset.action === "add-education-entry"',
            "app.addEducationEntry();",
            'state.ui.activeSection !== "education" || !state.hasOwn(config.educationFieldLabels, fieldName)',
            'const educationForm = input.closest("[data-education-index]");',
            "const educationIndex = educationForm ? Number(educationForm.dataset.educationIndex) : -1;",
            "app.updateEducationField(educationIndex, fieldName, input.value);",
            'const educationIndex = Number(actionButton.dataset.educationIndex);',
            'actionButton.dataset.action === "remove-education-entry"',
            "app.removeEducationEntry(educationIndex);",
            'actionButton.dataset.action === "move-education-entry-up"',
            'app.moveEducationEntry(educationIndex, "up");',
            'actionButton.dataset.action === "move-education-entry-down"',
            'app.moveEducationEntry(educationIndex, "down");',
            'actionButton.dataset.action === "move-education-entry-to-position"',
            'const targetInput = ui.editorCanvas.querySelector("[data-educationTargetPosition=\\"" + String(educationIndex) + "\\"]");',
            "app.moveEducationEntryToPosition(educationIndex, targetInput ? targetInput.value : \"\");",
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_education_section_exposes_inline_add_action(self):
        expected_snippets = [
            'education: ""',
            '+ educationEntries',
            'data-action=\\"add-education-entry\\"',
            '>Anadir otra formacion</button>',
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_preview_section_renders_all_education_entries(self):
        expected_snippets = [
            'const educationPreview = state.cv.education.length',
            'state.cv.education.map((entry) => ""',
            '<h3>Formacion</h3>',
            'ui.escapeHtml(entry.title || "Titulo pendiente")',
            'ui.escapeHtml(entry.center || "Centro pendiente")',
            'ui.escapeHtml(entry.dates || "Fechas pendientes")',
            'ui.escapeHtml(entry.details || "Detalles pendientes")',
            'ui.renderAchievementList(ui.getEntryNotes(entry), "Menciones pendientes")',
            'Anade tu primera formacion para completar esta vista previa.',
            "+ educationPreview",
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_preview_section_renders_all_project_entries(self):
        expected_snippets = [
            'const projectPreview = state.cv.projects.length',
            'state.cv.projects.map((entry) => ""',
            '<h3>Proyectos</h3>',
            'ui.escapeHtml(entry.name || "Proyecto pendiente")',
            'ui.escapeHtml(entry.role || "Rol pendiente")',
            'ui.escapeHtml(entry.url || "Enlace pendiente")',
            'ui.escapeHtml(entry.stack || "Stack pendiente")',
            'ui.escapeHtml(entry.summary || "Descripcion pendiente")',
            'ui.renderAchievementList(ui.getProjectHighlights(entry), "Hitos pendientes")',
            'Anade tu primer proyecto para completar esta vista previa.',
            "+ projectPreview",
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
            'required: ["basics", "experience", "projects", "education", "meta"]',
            "additionalProperties: false,",
            'projects: {',
            'items: { $ref: "#/$defs/projectEntry" },',
            "projectEntry: {",
            'required: ["name", "role", "summary"],',
            'stack: { type: "string" },',
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
            'isCurrent: "Experiencia actual"',
            'endDate: "Fecha de fin"',
            'summary: "Descripcion"',
            'achievements: "Logros"',
            'notes: "Notas opcionales"',
            "educationFieldLabels: {",
            'title: "Titulo"',
            'center: "Centro"',
            'dates: "Fechas"',
            'details: "Detalles"',
            'notes: "Menciones"',
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
            'required: ["role", "company", "location", "startDate", "summary"],',
            'location: { type: "string", minLength: 1 },',
            'startDate: { type: "string", minLength: 1 },',
            'isCurrent: { type: "boolean" },',
            'endDate: { type: "string" },',
            'achievements: {',
            'type: "array",',
            'items: { type: "string", minLength: 1 },',
            'notes: {',
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
            'const normalizedFieldValue = fieldName === "isCurrent"',
            '? Boolean(fieldValue)',
            ': fieldName === "achievements"',
            '? app.normalizeExperienceAchievements(fieldValue)',
            ': fieldName === "notes"',
            '? app.normalizeEntryNotes(fieldValue)',
            ': fieldValue;',
            "const nextExperience = state.cv.experience.map((entry, entryIndex) => entryIndex === index",
            '[fieldName]: normalizedFieldValue,',
            'endDate: fieldName === "isCurrent" && normalizedFieldValue ? "" : entry.endDate,',
            'text: config.experienceFieldLabels[fieldName] + " actualizado en experiencia " + String(index + 1) + ".",',
            'state.ui.activeSection === "basics" && state.hasOwn(config.basicsFieldLabels, fieldName)',
            'state.ui.activeSection !== "experience" || !state.hasOwn(config.experienceFieldLabels, fieldName)',
            'const experienceForm = input.closest("[data-experience-index]");',
            "const experienceIndex = experienceForm ? Number(experienceForm.dataset.experienceIndex) : -1;",
            'const fieldValue = input.type === "checkbox" ? input.checked : input.value;',
            "app.updateExperienceField(experienceIndex, fieldName, fieldValue);",
            'isCurrent: Boolean(entry && entry.isCurrent),',
            'achievements: app.normalizeExperienceAchievements(entry ? entry.achievements : []),',
            'notes: app.normalizeEntryNotes(entry ? entry.notes : []),',
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_experience_achievements_support_multiple_bullets(self):
        expected_snippets = [
            ".achievement-list {",
            '.achievement-list[data-tone="muted"] {',
            "getExperienceAchievements(entry) {",
            "if (entry && Array.isArray(entry.achievements)) {",
            "getEntryNotes(entry) {",
            "if (entry && Array.isArray(entry.notes)) {",
            '.split("\\n")',
            "renderAchievementList(achievements, emptyMessage) {",
            'return "<p class=\\"achievement-list\\" data-tone=\\"muted\\">" + ui.escapeHtml(emptyMessage) + "</p>";',
            'return "<ul class=\\"achievement-list\\">"',
            'achievements.map((achievement) => "<li>" + ui.escapeHtml(achievement) + "</li>").join("")',
            "normalizeExperienceAchievements(achievements) {",
            "if (Array.isArray(achievements)) {",
            "if (typeof achievements === \"string\") {",
            "normalizeEntryNotes(notes) {",
            "if (Array.isArray(notes)) {",
            "if (typeof notes === \"string\") {",
        ]
        for snippet in expected_snippets:
            with self.subTest(snippet=snippet):
                self.assertIn(snippet, self.content)

    def test_notes_fields_normalize_into_arrays(self):
        result = self.run_js_scenario(
            """
const cv = CVStudio.app.cloneInitialCV();
cv.experience = [
  { role: "Lead", company: "Acme", location: "Madrid", startDate: "2024-01", isCurrent: false, endDate: "2024-12", summary: "Resumen", achievements: [], notes: "Remoto\\nMentoria" },
];
cv.education = [
  { title: "Master", center: "UAM", dates: "2020 - 2021", details: "", notes: "Matricula\\nPremio final" },
];
CVStudio.state.update({ cv: CVStudio.app.normalizeCvDocument(cv), ui: { activeSection: "experience" } });
({
  experienceNotes: CVStudio.state.cv.experience[0].notes,
  educationNotes: CVStudio.state.cv.education[0].notes,
});
"""
        )
        self.assertEqual(result["experienceNotes"], ["Remoto", "Mentoria"])
        self.assertEqual(result["educationNotes"], ["Matricula", "Premio final"])

    def test_experience_section_supports_current_role_toggle(self):
        expected_snippets = [
            'const isCurrent = Boolean(entry && entry.isCurrent);',
            'if (startDate && isCurrent) {',
            'return startDate + " - Actualidad";',
            '<label for=\\"experience-current-',
            'name=\\"isCurrent\\"',
            'data-experience-field=\\"isCurrent\\"',
            'type=\\"checkbox\\"',
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
            'const fieldValue = input.type === "checkbox" ? input.checked : input.value;',
            "app.updateExperienceField(experienceIndex, fieldName, fieldValue);",
            "app.updateEducationField(educationIndex, fieldName, input.value);",
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
            'const projectEntries = state.cv.projects.length',
            'const projectPreview = state.cv.projects.length',
            'const educationEntries = state.cv.education.length',
            'const educationPreview = state.cv.education.length',
            'state.cv.experience.map((entry, index) => ""',
            'state.cv.experience.map((entry) => ""',
            'state.cv.projects.map((entry, index) => ""',
            'state.cv.projects.map((entry) => ""',
            'state.cv.education.map((entry, index) => ""',
            'state.cv.education.map((entry) => ""',
            'entry.role || "Puesto pendiente"',
            'entry.company || "Empresa pendiente"',
            'entry.location || "Ubicacion pendiente"',
            'entry.summary || "Resumen pendiente"',
            'Todavia no hay experiencias guardadas en el CV.',
            'Anade tu primera experiencia para completar esta vista previa.',
            'Todavia no hay proyectos guardados en el CV.',
            'Anade tu primer proyecto para completar esta vista previa.',
            'Todavia no hay formacion guardada en el CV.',
            'Anade tu primera formacion para completar esta vista previa.',
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

    def test_cv_schema_includes_projects_collection(self):
        result = self.run_js_scenario(
            """
({
  required: CVStudio.config.cvSchema.required,
  hasProjectsProperty: Object.prototype.hasOwnProperty.call(CVStudio.config.cvSchema.properties, "projects"),
  projectItemsRef: CVStudio.config.cvSchema.properties.projects.items.$ref,
  projectEntryRequired: CVStudio.config.cvSchema.$defs.projectEntry.required,
  hasProjectStack: Object.prototype.hasOwnProperty.call(CVStudio.config.cvSchema.$defs.projectEntry.properties, "stack"),
});
"""
        )
        self.assertEqual(result["required"], ["basics", "experience", "projects", "education", "meta"])
        self.assertTrue(result["hasProjectsProperty"])
        self.assertEqual(result["projectItemsRef"], "#/$defs/projectEntry")
        self.assertEqual(result["projectEntryRequired"], ["name", "role", "summary"])
        self.assertTrue(result["hasProjectStack"])

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
