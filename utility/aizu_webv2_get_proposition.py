import sys
import io as std_io
sys.stdout = std_io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from pathlib import Path
import io
import json

from PIL import Image
from playwright.sync_api import sync_playwright


# ==== CONFIG ====
PROBLEM_ID = "ITP1_9_C"

# ถ้ามี COURSE (เช่น "lesson/2/ITP1/all") → จะใช้ /courses/ URL
# ถ้าไม่มี COURSE (ว่าง) → จะใช้ /problems/ URL
COURSE = ""  # เว้นว่างสำหรับ /problems/ format

if COURSE:
    URL = f"https://onlinejudge.u-aizu.ac.jp/courses/{COURSE}/{PROBLEM_ID}?lang=en"
else:
    URL = f"https://onlinejudge.u-aizu.ac.jp/problems/{PROBLEM_ID}?lang=en"

SAVE_PATH = Path(f"aizu2_{PROBLEM_ID}.pdf")

# API (ใช้ได้ทั้งสองแบบ)
DESC_API_EN = f"https://judgeapi.u-aizu.ac.jp/resources/descriptions/en/{PROBLEM_ID}"
DESC_API_JA = f"https://judgeapi.u-aizu.ac.jp/resources/descriptions/ja/{PROBLEM_ID}"

CDP_URL = "http://127.0.0.1:9222"
# ==== END CONFIG ====


with sync_playwright() as p:
    try:
        browser = p.chromium.connect_over_cdp(CDP_URL)
        print("[OK] Connected to existing Chrome")
    except Exception:
        print("Chrome not running on port 9222. Falling back to headless...")
        browser = p.chromium.launch(headless=True)

    if browser.contexts:
        context = browser.contexts[0]
        page = context.pages[0] if context.pages else context.new_page()
    else:
        context = browser.new_context(viewport={"width": 1000, "height": 1300})
        page = context.new_page()

    # Fetch description via API (English first)
    print("Fetching problem description via API...")
    resp_en = page.request.get(DESC_API_EN)
    data = {}
    html_body = ""

    if resp_en.status == 200:
        data = resp_en.json()
        html_body = data.get("html") or data.get("body") or data.get("description") or ""
        if not html_body:
            html_body = json.dumps(data)
        print("  [OK] Got English description")
    else:
        print(f"  EN not available (status {resp_en.status}), trying JA...")
        resp_ja = page.request.get(DESC_API_JA)
        if resp_ja.status == 200:
            data = resp_ja.json()
            html_body = data.get("html") or data.get("body") or data.get("description") or ""
            if not html_body:
                html_body = json.dumps(data)
            print("  [OK] Got Japanese description (no EN available)")
        else:
            print(f"  API not available (JA status {resp_ja.status})")
            html_body = f"<p>Could not fetch problem {PROBLEM_ID}</p>"

    # Extract title from HTML: first <H1> or <h2>/<h3> that is not a section heading
    import re
    section_keywords = ['Constraints', 'Input', 'Output', 'Sample', 'Note',
                        'Reference', 'Hint', 'Problem', 'Description']
    title_text = ""
    for m in re.finditer(r'<h([123])[^>]*>(.+?)</h\1>', html_body, re.IGNORECASE):
        candidate = m.group(2).strip()
        if not any(candidate.startswith(k) for k in section_keywords):
            title_text = candidate
            break
    if not title_text:
        title_text = f"Problem {PROBLEM_ID}"

    time_limit = data.get("time_limit") or data.get("timeLimit") or "N/A"
    memory_limit = data.get("memory_limit") or data.get("memoryLimit") or ""
    tl_str = f"Time Limit : {time_limit}"
    if memory_limit:
        tl_str += f" , Memory Limit : {memory_limit} KB"
    print(f"  Title: {title_text}")
    print(f"  {tl_str}")

    # Build clean HTML
    html_page = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
body {{
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 14px;
    line-height: 1.7;
    color: #333;
    background: #fff;
    padding: 30px 40px;
    max-width: 950px;
}}
h1, h2, h3, h4 {{ margin: 14px 0 6px 0; }}
p {{ margin: 8px 0; }}
pre, code {{
    font-family: 'Courier New', Consolas, monospace;
    font-size: 13px;
    background: #f5f5f5;
    padding: 2px 6px;
    border-radius: 3px;
}}
pre {{
    padding: 10px;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
    background: #f5f5f5;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
}}
table {{ border-collapse: collapse; margin: 8px 0; }}
td, th {{ border: 1px solid #ccc; padding: 4px 10px; text-align: left; }}
ul, ol {{ margin: 6px 0 6px 24px; }}
li {{ margin: 3px 0; }}
.meta {{ font-size: 13px; color: #666; margin-bottom: 16px; }}
.title {{ font-size: 20px; font-weight: bold; margin-bottom: 4px; }}
</style>
</head>
<body>
<div class="meta">{tl_str}</div>
<div class="title">{title_text}</div>
<hr style="margin: 12px 0;">
{html_body}
</body>
</html>"""

    # Write temp → load → PDF directly (avoids font timeout)
    temp_path = Path(__file__).parent / ".aizu2_temp.html"
    temp_path.write_text(html_page, encoding="utf-8")

    page.goto(f"file:///{temp_path.as_posix()}")
    page.wait_for_load_state("load")
    page.wait_for_timeout(500)

    page.pdf(path=SAVE_PATH, format="A4", print_background=True)

    temp_path.unlink(missing_ok=True)

    print(f"Saved: {SAVE_PATH.resolve()}")

    if CDP_URL not in str(browser):
        browser.close()