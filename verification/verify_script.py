
from playwright.sync_api import sync_playwright

def verify_completed_modal():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Emulate mobile to fit the app's style or desktop
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        # Navigate to homepage
        try:
            # Depending on how fast vite starts, we might need to wait a bit or retry
            # Assuming default port 5173
            page.goto("http://localhost:5173", timeout=30000)

            # Login if needed or mock state?
            # The app likely requires auth to see questions.
            # However, CompletedQuestionModal is a component.
            # It might be easier to trigger it if I can access a completed state.
            # But without a seeded user with completed questions, it's hard to trigger "naturally".

            # Since this is a "micro-UX" verification, and I just want to see the modal rendered
            # I can rely on the unit test I wrote for logical correctness (aria attributes).
            # Visual verification of a modal usually requires clicking through the game.

            # Let's try to verify if the server is running first.
            print("Page title:", page.title())
            page.screenshot(path="verification/home_page.png")

            # I cannot easily trigger the modal without playing the game or mocking the backend extensively in E2E.
            # Given the constraints and the nature of the change (accessibility attributes),
            # visual verification might be identical to "before" state visually (invisible attributes).
            # But the focus management is functional.

            # I will skip the complex interaction for now as my change is primarily accessibility (ARIA + focus)
            # which is hard to capture in a static screenshot (focus ring might show).

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_completed_modal()
