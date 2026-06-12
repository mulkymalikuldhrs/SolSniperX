from playwright.sync_api import Page, expect, sync_playwright
import os

def verify_system(page: Page):
    # Navigate to Dashboard
    page.goto("http://localhost:5173", wait_until="networkidle")
    page.wait_for_timeout(5000)

    # Check for v3.3.0 in sidebar
    version_text = page.locator("text=v3.3.0 (Ultimate Intelligence Upgrade)")
    if version_text.is_visible():
        print("Success: Version label v3.3.0 is visible.")
    else:
        print("Warning: Version label v3.3.0 not found!")

    # Take dashboard screenshot
    page.screenshot(path="dashboard_v3_3_0.png")

    # Scroll sidebar to footer
    page.hover("nav")
    page.mouse.wheel(0, 1000)
    page.wait_for_timeout(1000)
    page.screenshot(path="sidebar_footer_v3_3_0.png")

    # Navigate to Wallet
    try:
        page.click("nav >> text=Wallet")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(3000)
        page.screenshot(path="wallet_v3_3_0.png")
    except Exception as e:
        print(f"Error navigating to Wallet: {e}")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_system(page)
        finally:
            browser.close()
