from playwright.sync_api import sync_playwright

def smoke_test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to home page...")
            page.goto("http://localhost:5173/", timeout=10000)
            print("Navigation call returned.")

            # Wait for body to be visible
            page.wait_for_selector("body", timeout=5000)
            print("Body found.")

            # Take screenshot of home page
            page.screenshot(path="verification/home_page.png")
            print("Home page screenshot taken.")

            # Check for title
            title = page.title()
            print(f"Page title: {title}")

        except Exception as e:
            print(f"Error: {e}")
            try:
                page.screenshot(path="verification/error_state.png")
            except:
                pass
        finally:
            browser.close()

if __name__ == "__main__":
    smoke_test()
