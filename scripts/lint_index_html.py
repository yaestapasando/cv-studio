from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[1]
INDEX_HTML = ROOT / "index.html"


def main():
    content = INDEX_HTML.read_text(encoding="utf-8")
    errors = []
    section_markers = [
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

    if not content.startswith("<!DOCTYPE html>"):
        errors.append("Missing HTML5 doctype.")
    if "<html lang=\"es\">" not in content:
        errors.append("Missing `lang=\"es\"` in root html tag.")
    if "<meta name=\"viewport\"" not in content:
        errors.append("Missing responsive viewport meta tag.")
    if "<style>" not in content or "</style>" not in content:
        errors.append("Missing embedded CSS block.")
    if "<script>" not in content or "</script>" not in content:
        errors.append("Missing embedded JS block.")
    missing_markers = [marker for marker in section_markers if marker not in content]
    if missing_markers:
        errors.append("Missing internal section markers.")
    module_markers = [
        "// JS Module: config",
        "// JS Module: state",
        "// JS Module: ui",
        "// JS Module: app",
    ]
    module_positions = [content.find(marker) for marker in module_markers]
    if any(position == -1 for position in module_positions):
        errors.append("Missing logical module markers.")
    elif module_positions != sorted(module_positions):
        errors.append("Logical module markers are out of order.")
    if "http://" in content or "https://" in content:
        lines = [line.strip() for line in content.splitlines() if "http://" in line or "https://" in line]
        if lines:
            errors.append("Found remote HTTP(S) reference.")
    if "\t" in content:
        errors.append("Tabs are not allowed.")

    trailing = [number for number, line in enumerate(content.splitlines(), start=1) if line.rstrip() != line]
    if trailing:
        errors.append("Trailing whitespace found on lines: " + ", ".join(map(str, trailing)))

    if errors:
        for error in errors:
            print(error)
        return 1

    print("lint ok")
    return 0


if __name__ == "__main__":
    sys.exit(main())
