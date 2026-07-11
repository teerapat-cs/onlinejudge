import sys
import io as std_io
sys.stdout = std_io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from pathlib import Path
import subprocess
import base64
import time
import io
import os

from PIL import Image
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException, WebDriverException


PROBLEM_ID = "ITP1_5_D"
URL = f"https://judge.u-aizu.ac.jp/onlinejudge/description.jsp?id={PROBLEM_ID}"
SAVE_PATH = Path(f"aizu_{PROBLEM_ID}.pdf")

DEBUG_PORT = 9222
DEBUG_ADDRESS = f"127.0.0.1:{DEBUG_PORT}"

CHROME_DEBUG_PROFILE = Path(__file__).parent / ".chrome_debug_profile"


def find_chrome_exe():
    paths = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    ]
    for p in paths:
        if os.path.exists(p):
            return p
    raise RuntimeError("Chrome not found")


def is_debug_chrome_alive():
    try:
        opts = Options()
        opts.add_experimental_option("debuggerAddress", DEBUG_ADDRESS)
        d = webdriver.Chrome(options=opts)
        d.quit()
        return True
    except WebDriverException:
        return False


def launch_debug_chrome():
    chrome_exe = find_chrome_exe()
    CHROME_DEBUG_PROFILE.mkdir(parents=True, exist_ok=True)

    cmd = [
        chrome_exe,
        f"--remote-debugging-port={DEBUG_PORT}",
        f"--user-data-dir={CHROME_DEBUG_PROFILE}",
        "--window-size=1000,1300",
        "--disable-blink-features=AutomationControlled",
    ]
    print("Launching Chrome (debug mode)...")
    subprocess.Popen(cmd)
    time.sleep(3)

    for _ in range(10):
        if is_debug_chrome_alive():
            print("[OK] Chrome ready")
            return
        time.sleep(1)
    raise RuntimeError("Cannot connect to Chrome - close normal Chrome first")


# --- Open/connect Chrome ---
if not is_debug_chrome_alive():
    launch_debug_chrome()

options = Options()
options.add_experimental_option("debuggerAddress", DEBUG_ADDRESS)

driver = webdriver.Chrome(options=options)
print("[OK] Connected to Chrome")

try:
    print("Loading problem page...")
    driver.get(URL)

    WebDriverWait(driver, 30).until(
        lambda d: d.execute_script("return document.readyState") == "complete"
    )

    time.sleep(2)

    print("Title:", driver.title)

    # --- Find page container (title + description, minus navbar) ---
    container_selectors = [
        ".description_detail",
        "#description_detail",
        ".problem_content",
        ".content",
        "#content",
        "#pageBody",
        "#main-content",
        ".container",
        "main",
        "body",
    ]
    page_el = None

    for sel in container_selectors:
        try:
            el = driver.find_element(By.CSS_SELECTOR, sel)
            tag = el.tag_name
            if tag in ("nav", "header", "footer"):
                continue
            page_el = el
            print(f"Found page container: {sel}")
            break
        except NoSuchElementException:
            continue

    if page_el is None:
        page_el = driver.find_element(By.TAG_NAME, "body")
        print("fallback to <body>")

    # Extract: clone container -> strip nav/header/menu -> get HTML + CSS
    extracted = driver.execute_script(
        """
        var container = arguments[0].cloneNode(true);

        var removeSelectors = [
            '#nav', '#subtree', '#tree',
            '#menu', '#menubar',
            '#login_new', '#logout_new', '#mystatus',
            'nav', 'header', 'footer',
            '.navbar', '#navbar',
            '.global-header', '#global-header',
            '.global-navi', '#global-navi',
            '.sidebar', '#sidebar',
            '.breadcrumb', '#breadcrumb',
            '.header-area',
            '#header',
            '.site-header',
            '.panel-heading',
            'script',
        ];
        removeSelectors.forEach(function(sel) {
            var els = container.querySelectorAll(sel);
            els.forEach(function(el) { el.remove(); });
        });

        var html = container.outerHTML;

        var styles = '';
        var sheets = document.styleSheets;
        for (var i = 0; i < sheets.length; i++) {
            try {
                var rules = sheets[i].cssRules || sheets[i].rules;
                if (!rules) continue;
                for (var j = 0; j < rules.length; j++) {
                    styles += rules[j].cssText + '\\n';
                }
            } catch (e) {}
        }

        return { html: html, styles: styles };
        """,
        page_el,
    )

    # Build clean HTML page
    html_page = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=1000">
<style>
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
body {{
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: #333;
    background: #fff;
    padding: 30px 40px;
    width: 1000px;
}}
h1, h2, h3, h4 {{ margin: 12px 0 6px 0; }}
p {{ margin: 6px 0; }}
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
}}
table {{ border-collapse: collapse; margin: 8px 0; }}
td, th {{ border: 1px solid #ccc; padding: 4px 8px; text-align: left; }}
ul, ol {{ margin: 6px 0 6px 24px; }}
li {{ margin: 2px 0; }}

{extracted['styles']}
</style>
</head>
<body>
{extracted['html']}
</body>
</html>"""

    # Write temp HTML -> load in Chrome -> screenshot
    temp_path = Path(__file__).parent / ".aizu_temp.html"
    temp_path.write_text(html_page, encoding="utf-8")

    driver.get(f"file:///{temp_path.as_posix()}")

    WebDriverWait(driver, 30).until(
        lambda d: d.execute_script("return document.readyState") == "complete"
    )

    time.sleep(1)

    data = driver.execute_cdp_cmd(
        "Page.captureScreenshot",
        {"format": "png", "captureBeyondViewport": True, "fromSurface": True},
    )

    # --- Convert PNG to PDF ---
    png_bytes = base64.b64decode(data["data"])
    image = Image.open(io.BytesIO(png_bytes))
    rgb = image.convert("RGB")
    rgb.save(SAVE_PATH, "PDF", resolution=100.0)

    temp_path.unlink(missing_ok=True)

    print("Saved:", SAVE_PATH.resolve())

finally:
    driver.quit()