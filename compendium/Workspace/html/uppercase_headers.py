#!/usr/bin/env python3
"""
Uppercase all text inside header tags (h1-h6) in an HTML file.
Handles both <hN><b>text</b></hN> and plain <hN>text</hN> patterns.
"""
import re
import sys
from pathlib import Path


def uppercase_headers(html: str) -> str:
    # Uppercase text inside <hN><b>text</b></hN>
    def repl(match):
        tag = match.group(1)
        text = match.group(2)
        return f"<{tag}><b>{text.upper()}</b></{tag}>"

    html = re.sub(
        r"<(h[1-6])><b>([^<]+)</b></\1>",
        repl,
        html,
    )
    # Also handle headers without <b>: <hN>text</hN>
    def repl_plain(match):
        tag = match.group(1)
        text = match.group(2)
        return f"<{tag}>{text.upper()}</{tag}>"

    return re.sub(
        r"<(h[1-6])>([^<]+)</\1>",
        repl_plain,
        html,
    )


def main():
    if len(sys.argv) < 2:
        path = Path(__file__).parent / "Chapter 10 - Manor Uvior.html"
    else:
        path = Path(sys.argv[1])

    if not path.exists():
        print(f"File not found: {path}", file=sys.stderr)
        sys.exit(1)

    html = path.read_text(encoding="utf-8")
    updated = uppercase_headers(html)
    path.write_text(updated, encoding="utf-8")
    print(f"Uppercased headers in: {path}")


if __name__ == "__main__":
    main()
