from playwright.sync_api import Page, expect, sync_playwright
import os

def verify_dashboard(page: Page):
    # Navigate to Dashboard
    page.goto("http://localhost:5173", wait_until="networkidle")
    page.wait_for_timeout(10000)

    # Take dashboard screenshot
    page.screenshot(path="dashboard_final.png")

    # Navigate to Trading
    try:
        # Use selector to be more specific
        page.click("nav >> text=Trading")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(5000)
        # Scroll down to see Limit Order section
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        page.wait_for_timeout(2000)
        page.screenshot(path="trading_final.png")
    except Exception as e:
        print(f"Error navigating to Trading: {e}")

    # Navigate to Wallet
    try:
        page.click("nav >> text=Wallet")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(3000)
        page.screenshot(path="wallet_final.png")
    except Exception as e:
        print(f"Error navigating to Wallet: {e}")

if __name__ == "__main__":
    os.makedirs("video", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(record_video_dir="video")
        page = context.new_page()
        try:
            verify_dashboard(page)
        finally:
            context.close()
            browser.close()
