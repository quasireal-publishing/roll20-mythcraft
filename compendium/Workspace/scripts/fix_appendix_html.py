#!/usr/bin/env python3
"""
Fix Appendix A, B, C HTML files for Prettier:
- Unescape \\" and \\n in content
- Wrap in valid HTML5 document structure
- Appendix B is empty: write minimal HTML5
"""

from pathlib import Path

WORKSPACE = Path(__file__).resolve().parent.parent
HTML_DIR = WORKSPACE / "html"

HTML5_HEADER = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title></title>
</head>
<body>
"""

HTML5_FOOTER = """
</body>
</html>
"""


def unescape(s: str) -> str:
    return s.replace('\\"', '"').replace("\\n", "\n").replace("\\u2019", "'").replace("\\u00bd", "½").replace("\\u201c", '"').replace("\\u201d", '"')


def fix_appendix_a():
    path = HTML_DIR / "Appendix A.html"
    raw = path.read_text(encoding="utf-8")
    body = unescape(raw.strip())
    out = HTML5_HEADER + body + HTML5_FOOTER
    path.write_text(out, encoding="utf-8")
    print(f"Fixed {path.name}")


def fix_appendix_b():
    path = HTML_DIR / "Appendix B.html"
    out = HTML5_HEADER.strip() + "\n  <p>Appendix B: Skills Reference</p>\n" + HTML5_FOOTER
    path.write_text(out, encoding="utf-8")
    print(f"Fixed {path.name} (minimal placeholder)")


def fix_appendix_c():
    path = HTML_DIR / "Appendix C.html"
    raw = path.read_text(encoding="utf-8")
    lines = raw.splitlines()
    # Find where escaped content starts (line containing \" or long line with \n)
    rest_start = 6  # default: original format had 6 lines of head
    for i, line in enumerate(lines):
        if '\\"' in line or ('\\n' in line and len(line) > 500):
            rest_start = i
            break
    head = "\n".join(lines[:rest_start])
    rest = "\n".join(lines[rest_start:]) if len(lines) > rest_start else ""
    rest_unescaped = unescape(rest)
    # Remove JSON tail
    if '"APPENDIX B' in rest_unescaped:
        rest_unescaped = rest_unescaped.split('"APPENDIX B')[0].rstrip(' "')
    if '"INDEX"' in rest_unescaped:
        rest_unescaped = rest_unescaped.split('"INDEX"')[0].rstrip(' "')
    body = head + "\n" + rest_unescaped
    # Avoid double HTML5 header if file already had one
    if body.strip().startswith("<!DOCTYPE"):
        out = body.strip() + HTML5_FOOTER
    else:
        out = HTML5_HEADER + body.strip() + HTML5_FOOTER
    path.write_text(out, encoding="utf-8")
    print(f"Fixed {path.name}")


def main():
    fix_appendix_a()
    fix_appendix_b()
    fix_appendix_c()
    print("Done. Run Prettier on the Appendix HTML files.")


if __name__ == "__main__":
    main()
