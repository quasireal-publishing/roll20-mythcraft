#!/usr/bin/env python3
"""Clean HTML: strip class/style/id, remove colgroup, br-only p, empty elements; add br between p; unwrap p in tables; normalize whitespace.
Usage:
  python3 clean_content.py <file.html>      # clean one file
  python3 clean_content.py <folder/>        # clean all .html files in folder

Cleanup actions (in order):
  1. Remove all class, style, id, and lang attributes from every tag.
  2. Replace all &nbsp; with a normal space.
  3. Remove all <colgroup> elements and their children.
  4. Remove <p> that only contain a <br> (or <br />), and remove any empty <p> that have no content (including only whitespace or &nbsp;).
  5. Remove empty elements: <a>, <b>, <em>, <span>, <i> when they have no content.
  6. Ensure every h1, h2, h3, h4 has its text wrapped in <b> (if not already).
  7. Collapse redundant nested <b> and <strong> (e.g. <b><b>text</b></b> → <b>text</b>).
  8. Normalize headers: one <b> wrapping all text; merge <b>A</b><b>B</b> into <b>A B</b>; &nbsp; → space.
  9. Insert <br /> between two consecutive <p> elements.
 10. Insert <br /> between a <table> and an adjacent <p> (before or after the table).
 11. Insert <br /> between </p> and <ul> (opening ul only, not closing </ul>).
 12. Unwrap <p> inside table cells: <td><p>...</p></td> becomes <td>...</td>.
 13. Normalize whitespace: trim trailing space on lines, collapse 3+ blank lines to 2.
 14. Final pass: remove any remaining empty <p></p>.
"""
import re
import sys
from pathlib import Path


def clean_html(html: str) -> str:
    # 1. Remove class="...", style="...", id="...", and lang="..." from all tags
    html = re.sub(r'\s+class="[^"]*"', '', html)
    html = re.sub(r'\s+style="[^"]*"', '', html)
    html = re.sub(r'\s+id="[^"]*"', '', html)
    html = re.sub(r'\s+lang="[^"]*"', '', html)

    # 2. Replace all &nbsp; with a normal space
    html = re.sub(r'&nbsp;?', ' ', html, flags=re.IGNORECASE)

    # 3. Remove <colgroup> and all its children
    html = re.sub(r'<colgroup[^>]*>.*?</colgroup>', '', html, flags=re.IGNORECASE | re.DOTALL)

    # 4. Remove <p> that only contain whitespace and <br> or <br />, and any empty <p> (no content)
    html = re.sub(r'<p[^>]*>\s*<br\s*/?>\s*</p>\s*', '', html, flags=re.IGNORECASE)
    html = re.sub(r'<p\s*[^>]*>\s*</p>\s*', '', html, flags=re.IGNORECASE)
    html = re.sub(r'<p[^>]*>(\s|&nbsp;)*</p>\s*', '', html, flags=re.IGNORECASE)

    # 5. Remove empty elements: <a...></a>, and empty <b>, <em>, <span>, <i>
    html = re.sub(r'<a\s*[^>]*>\s*</a>', '', html)
    for tag in ('b', 'em', 'span', 'i'):
        html = re.sub(rf'<{tag}\s[^>]*>\s*</{tag}>', '', html, flags=re.IGNORECASE)
        html = re.sub(rf'<{tag}>\s*</{tag}>', '', html, flags=re.IGNORECASE)

    # 5b. Ensure h1, h2, h3, h4 have their text wrapped in <b> (if not already)
    for tag in ('h1', 'h2', 'h3', 'h4'):
        pattern = rf'<{tag}>(.*?)</{tag}>'
        def repl(m, t=tag):
            content = m.group(1)
            stripped = content.strip()
            if (stripped.lower().startswith('<b>') and stripped.lower().endswith('</b>')) or \
               (stripped.lower().startswith('<strong>') and stripped.lower().endswith('</strong>')):
                return m.group(0)
            return f'<{t}><b>{content}</b></{t}>'
        html = re.sub(pattern, lambda m: repl(m), html, flags=re.IGNORECASE | re.DOTALL)

    # 5c. Collapse redundant nested <b> and <strong> (e.g. <b><b>text</b></b> → <b>text</b>)
    for _ in range(10):  # enough for deep nesting
        prev = html
        html = re.sub(r'<b\s*>\s*<b\s*>', '<b>', html, flags=re.IGNORECASE)
        html = re.sub(r'</b\s*>\s*</b\s*>', '</b>', html, flags=re.IGNORECASE)
        html = re.sub(r'<strong\s*>\s*<strong\s*>', '<strong>', html, flags=re.IGNORECASE)
        html = re.sub(r'</strong\s*>\s*</strong\s*>', '</strong>', html, flags=re.IGNORECASE)
        if html == prev:
            break

    # 5d. Normalize headers: single <b> with plain text (merge <b>chunk</b><b>chunk</b>, &nbsp; → space)
    for tag in ('h1', 'h2', 'h3', 'h4'):
        pattern = rf'<{tag}>(.*?)</{tag}>'
        def repl(m, t=tag):
            content = m.group(1)
            # Strip <b>, </b>, <strong>, </strong>; replace &nbsp; with space; collapse whitespace
            text = re.sub(r'</?b\s*>', '', content, flags=re.IGNORECASE)
            text = re.sub(r'</?strong\s*>', '', text, flags=re.IGNORECASE)
            text = text.replace('&nbsp;', ' ')
            text = re.sub(r'\s+', ' ', text).strip()
            return f'<{t}><b>{text}</b></{t}>'
        html = re.sub(pattern, lambda m: repl(m), html, flags=re.IGNORECASE | re.DOTALL)

    # 6. Insert <br /> between two consecutive </p> ... <p>
    html = re.sub(r'</p>\s*<p>', '</p>\n<br />\n<p>', html)

    # 7. Insert <br /> between table and p when adjacent (before or after table)
    html = re.sub(r'</table>\s*<p>', '</table>\n<br />\n<p>', html, flags=re.IGNORECASE)
    html = re.sub(r'</p>\s*<table>', '</p>\n<br />\n<table>', html, flags=re.IGNORECASE)

    # 7b. Insert <br /> between </p> and <ul> (opening ul only)
    html = re.sub(r'</p>\s*<ul>', '</p>\n<br />\n<ul>', html, flags=re.IGNORECASE)

    # 8. Unwrap <p> inside table cells (single <p> per <td>)
    html = re.sub(r'<td>\s*<p>(.*?)</p>\s*</td>', r'<td>\1</td>', html, flags=re.IGNORECASE | re.DOTALL)

    # 9. Normalize whitespace: trim trailing space, collapse 3+ blank lines to 2
    html = "\n".join(line.rstrip() for line in html.split("\n"))
    html = re.sub(r'\n{3,}', '\n\n', html)

    # 10. Final pass: remove any remaining empty <p></p> (in case of edge cases)
    while True:
        new_html = re.sub(r'<p\s*[^>]*>\s*</p>\s*', '', html, flags=re.IGNORECASE)
        if new_html == html:
            break
        html = new_html

    return html


def clean_file(path: Path) -> None:
    path = path.resolve()
    if not path.exists():
        print(f"Not found: {path}", file=sys.stderr)
        return
    if not path.is_file():
        print(f"Not a file: {path}", file=sys.stderr)
        return
    with open(path, "r", encoding="utf-8") as f:
        html = f.read()
    html = clean_html(html)
    with open(path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Cleaned: {path}")


def main():
    if len(sys.argv) != 2:
        print("Usage: python3 clean_content.py <file.html | folder/>", file=sys.stderr)
        sys.exit(1)

    target = Path(sys.argv[1]).resolve()

    if not target.exists():
        print(f"Not found: {target}", file=sys.stderr)
        sys.exit(1)

    if target.is_file():
        if target.suffix.lower() != ".html":
            print("Only .html files are supported.", file=sys.stderr)
            sys.exit(1)
        clean_file(target)
        return

    if target.is_dir():
        files = sorted(target.glob("*.html"))
        if not files:
            print(f"No .html files in {target}", file=sys.stderr)
            sys.exit(1)
        for f in files:
            clean_file(f)
        print(f"Done. Cleaned {len(files)} file(s).")
        return

    print(f"Invalid target: {target}", file=sys.stderr)
    sys.exit(1)


if __name__ == "__main__":
    main()
