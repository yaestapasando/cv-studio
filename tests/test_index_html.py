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
        self.assertIn("workspace-panel", self.parser.class_names)

    def test_embeds_style_and_script(self):
        self.assertIn("style", self.parser.start_tags)
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

    def test_defines_internal_html_css_js_sections(self):
        expected_markers = [
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
