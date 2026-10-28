import os
import shutil
import time
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"
PROJECT_DIR = r"c:\Projects\MMS"
DEV_DB = os.path.join(PROJECT_DIR, "prisma", "dev.db")
CLEAN_BACKUP = os.path.join(PROJECT_DIR, "prisma", "dev.db.clean_backup")
DEMO_BACKUP = os.path.join(PROJECT_DIR, "backup_pre_cleanup", "dev.db")
SCREENSHOT_DIR = os.path.join(PROJECT_DIR, "documentation", "final-report", "screenshots")

os.makedirs(SCREENSHOT_DIR, exist_ok=True)

# 1. Safely swap in the demo DB for authentic screenshot capturing
print("Step 1: Preparing database for screenshot capture...")
if not os.path.exists(CLEAN_BACKUP):
    shutil.copy2(DEV_DB, CLEAN_BACKUP)
    print("Created clean backup of dev.db")

shutil.copy2(DEMO_BACKUP, DEV_DB)
print("Swapped in demo database with real institutional data for screenshots.")

time.sleep(1)

def capture():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            headless=True
        )
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=1.5
        )
        page = context.new_page()

        def login_as(email, password="password123"):
            page.goto(f"{BASE_URL}/login")
            page.wait_for_load_state("networkidle")
            # Call login API directly
            res = context.request.post(f"{BASE_URL}/api/auth/login", data={
                "email": email,
                "password": password
            })
            print(f"Logged in as {email}: status {res.status}")
            time.sleep(1)

        # 1. Public Pages
        print("Capturing 1. Landing Page...")
        page.goto(f"{BASE_URL}/")
        page.wait_for_load_state("networkidle")
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "fig10_1_landing_page.png"), full_page=False)

        print("Capturing 2. Role Selection Page...")
        page.goto(f"{BASE_URL}/login")
        page.wait_for_load_state("networkidle")
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "fig10_2_role_selection.png"), full_page=False)

        print("Capturing 3. Role Login (Faculty)...")
        page.goto(f"{BASE_URL}/login/faculty")
        page.wait_for_load_state("networkidle")
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "fig10_3_role_login.png"), full_page=False)

        print("Capturing 4. Password Reset & Activation...")
        page.goto(f"{BASE_URL}/reset-password")
        page.wait_for_load_state("networkidle")
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "fig10_4_password_reset.png"), full_page=False)

        # 2. Faculty Role
        print("Capturing Faculty Views...")
        login_as("libin@kristujayanti.com")
        page.goto(f"{BASE_URL}/dashboard")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "fig10_5_faculty_dashboard.png"), full_page=False)

        page.goto(f"{BASE_URL}/dashboard/events/new")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "fig10_6_event_registration.png"), full_page=False)

        page.goto(f"{BASE_URL}/dashboard/calendar")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "fig10_7_event_calendar.png"), full_page=False)

        page.goto(f"{BASE_URL}/dashboard/reports")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "fig10_8_dynamic_report_formats.png"), full_page=False)

        # Let's get an event ID to capture event details
        events_res = context.request.get(f"{BASE_URL}/api/events")
        events_data = events_res.json()
        if events_data.get("events") and len(events_data["events"]) > 0:
            evt_id = events_data["events"][0]["id"]
            page.goto(f"{BASE_URL}/dashboard/events/{evt_id}")
            page.wait_for_load_state("networkidle")
            time.sleep(1)
            page.screenshot(path=os.path.join(SCREENSHOT_DIR, "fig10_9_event_details.png"), full_page=False)

        # 3. Media Head Role
        print("Capturing Media Head Views...")
        login_as("ezra@kristujayanti.com")
        page.goto(f"{BASE_URL}/dashboard")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "fig10_10_media_head_dashboard.png"), full_page=False)

        page.goto(f"{BASE_URL}/dashboard/assignments")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "fig10_11_crew_assignment.png"), full_page=False)

        # 4. Media Member Role
        print("Capturing Media Member Views...")
        login_as("ashley@kju.com")
        page.goto(f"{BASE_URL}/dashboard")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "fig10_12_media_member_dashboard.png"), full_page=False)

        page.goto(f"{BASE_URL}/dashboard/uploads")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "fig10_13_media_upload.png"), full_page=False)

        # 5. Dean Role
        print("Capturing Dean Approvals...")
        login_as("kumar@kristujayanti.com")
        page.goto(f"{BASE_URL}/dashboard/approvals")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "fig10_14_dean_approvals.png"), full_page=False)

        # 6. HOD Role
        print("Capturing HOD Approvals...")
        login_as("muruganantham@kristujayanti.com")
        page.goto(f"{BASE_URL}/dashboard/approvals")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "fig10_15_hod_approvals.png"), full_page=False)

        # 7. Programme Coordinator Role
        print("Capturing Programme Coordinator Approvals...")
        login_as("velmurugan@kristujayanti.com")
        page.goto(f"{BASE_URL}/dashboard/approvals")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "fig10_16_coordinator_approvals.png"), full_page=False)

        # 8. Social Media Handler Role
        print("Capturing Social Media Handler Views...")
        login_as("mathew@kristujayanti.com")
        page.goto(f"{BASE_URL}/dashboard/social-media")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "fig10_17_social_media_workspace.png"), full_page=False)

        # 9. Admin Role
        print("Capturing Admin Views...")
        login_as("admin@kristujayanti.edu.in")
        page.goto(f"{BASE_URL}/dashboard")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "fig10_18_admin_dashboard.png"), full_page=False)

        page.goto(f"{BASE_URL}/dashboard/admin/users")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "fig10_19_admin_users.png"), full_page=False)

        page.goto(f"{BASE_URL}/dashboard/directory")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "fig10_20_directory.png"), full_page=False)

        page.goto(f"{BASE_URL}/dashboard/admin/audit-logs")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "fig10_21_audit_logs.png"), full_page=False)

        browser.close()
        print("All authentic screenshots captured successfully!")

try:
    capture()
finally:
    # 2. ALWAYS restore the clean backup DB
    print("Step 2: Restoring clean database baseline...")
    shutil.copy2(CLEAN_BACKUP, DEV_DB)
    print("Clean database restored successfully! Zero persistent modifications.")
