from pathlib import Path
import subprocess
import base64
import time
import os

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException, WebDriverException


# PROBLEM_ID = 3486
PROBLEM_ID = 3488
URL = f"https://judge.beecrowd.com/en/problems/fullscreen/{PROBLEM_ID}"
SAVE_PATH = Path(f"beecrowd_{PROBLEM_ID}.pdf")

DEBUG_PORT = 9222
DEBUG_ADDRESS = f"127.0.0.1:{DEBUG_PORT}"

# Chrome profile สำหรับ debug mode (แยกจาก Chrome ปกติ ไม่ชนกัน)
CHROME_DEBUG_PROFILE = Path(__file__).parent / ".chrome_debug_profile"


def find_chrome_exe():
    paths = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    ]
    for p in paths:
        if os.path.exists(p):
            return p
    raise RuntimeError("ไม่พบ Chrome ติดตั้งในเครื่อง")


def is_debug_chrome_alive():
    """เช็คว่า Chrome แบบ debug port เปิดอยู่หรือยัง"""
    try:
        opts = Options()
        opts.add_experimental_option("debuggerAddress", DEBUG_ADDRESS)
        d = webdriver.Chrome(options=opts)
        d.quit()
        return True
    except WebDriverException:
        return False


def launch_debug_chrome():
    """เปิด Chrome พร้อม remote debugging port + temp profile"""
    chrome_exe = find_chrome_exe()
    CHROME_DEBUG_PROFILE.mkdir(parents=True, exist_ok=True)

    cmd = [
        chrome_exe,
        f"--remote-debugging-port={DEBUG_PORT}",
        f"--user-data-dir={CHROME_DEBUG_PROFILE}",
        "--window-size=1000,1300",
        "--disable-blink-features=AutomationControlled",
    ]
    print("กำลังเปิด Chrome (debug mode)...")
    subprocess.Popen(cmd)
    time.sleep(3)

    # รอจนเชื่อมต่อได้
    for _ in range(10):
        if is_debug_chrome_alive():
            print("✓ Chrome พร้อมแล้ว")
            return
        time.sleep(1)
    raise RuntimeError("ไม่สามารถเชื่อมต่อ Chrome ได้ — ลองปิด Chrome ปกติก่อน")


# --- เปิด/ต่อ Chrome ---
if not is_debug_chrome_alive():
    launch_debug_chrome()

options = Options()
options.add_experimental_option("debuggerAddress", DEBUG_ADDRESS)

driver = webdriver.Chrome(options=options)
print("✓ เชื่อมต่อ Chrome สำเร็จ")

try:
    print("กำลังเปิดหน้าโจทย์...")
    driver.get(URL)

    WebDriverWait(driver, 30).until(
        lambda d: d.execute_script("return document.readyState") == "complete"
    )

    time.sleep(2)

    print("Title:", driver.title)
    print("Current URL:", driver.current_url)

    if "/login" in driver.current_url.lower():
        print()
        print("=" * 60)
        print("กรุณา login ในหน้าต่าง Chrome ที่เปิดอยู่")
        print("(login ครั้งเดียว ครั้งต่อไปไม่ต้อง login อีก)")
        print("เสร็จแล้วกด Enter...")
        print("=" * 60)
        input()

        driver.get(URL)
        WebDriverWait(driver, 30).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        time.sleep(2)

        if "/login" in driver.current_url.lower():
            raise RuntimeError("ยังไม่ได้ login — ยกเลิก")

    # --- จับภาพเฉพาะส่วนโจทย์ ---
    selectors = ["#problem-page", ".problem-description", ".problem", "main"]
    problem_element = None

    for sel in selectors:
        try:
            problem_element = driver.find_element(By.CSS_SELECTOR, sel)
            print(f"Found element: {sel}")
            break
        except NoSuchElementException:
            continue

    if problem_element is None:
        print("WARNING: ไม่พบ element โจทย์ — fallback จับภาพทั้งหน้าแทน")
        data = driver.execute_cdp_cmd(
            "Page.captureScreenshot",
            {"format": "png", "captureBeyondViewport": True, "fromSurface": True},
        )
    else:
        driver.execute_script(
            "arguments[0].scrollIntoView({block: 'start'});", problem_element
        )
        time.sleep(0.5)

        # ใช้ page-absolute coordinates (ไม่ใช่ viewport-relative)
        # เพราะ captureBeyondViewport=True ใช้พิกัดเทียบกับหน้าเต็ม
        rect = driver.execute_script(
            "var r=arguments[0].getBoundingClientRect();"
            "return {x: r.left + window.scrollX, y: r.top + window.scrollY,"
            " width: r.width, height: r.height};",
            problem_element,
        )

        dpr = driver.execute_script("return window.devicePixelRatio || 1;")

        PAD_X = 20  # padding ซ้าย-ขวา
        PAD_Y = 50  # padding บน-ล่าง
        clip_x = max(0, rect["x"] - PAD_X)
        clip_y = max(0, rect["y"] - PAD_Y)
        clip_w = (rect["width"] + PAD_X * 2)
        clip_h = (rect["height"] + PAD_Y * 2)

        data = driver.execute_cdp_cmd(
            "Page.captureScreenshot",
            {
                "format": "png",
                "clip": {
                    "x": clip_x * dpr,
                    "y": clip_y * dpr,
                    "width": clip_w * dpr,
                    "height": clip_h * dpr,
                    "scale": 1,
                },
                "captureBeyondViewport": True,
                "fromSurface": True,
            },
        )

    # --- แปลง PNG → PDF ---
    import io
    from PIL import Image

    png_bytes = base64.b64decode(data["data"])
    image = Image.open(io.BytesIO(png_bytes))
    rgb = image.convert("RGB")
    rgb.save(SAVE_PATH, "PDF", resolution=100.0)

    print("Saved:", SAVE_PATH.resolve())

finally:
    # ปิดแค่ Selenium connection — Chrome ยังเปิดอยู่
    driver.quit()