import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

DIAGRAM_DIR = r"c:\Projects\MMS\documentation\final-report\diagrams"
os.makedirs(DIAGRAM_DIR, exist_ok=True)

# Common styling
NAVY = "#0f2942"
LIGHT_BLUE = "#e0e7ff"
BLUE = "#2563eb"
ACCENT_GREEN = "#10b981"
ACCENT_AMBER = "#f59e0b"
ACCENT_RED = "#ef4444"
BG_CARD = "#f8fafc"
BORDER_COLOR = "#cbd5e1"
TEXT_DARK = "#0f172a"
TEXT_MUTED = "#64748b"

def draw_header(ax, title, subtitle):
    ax.text(0.5, 0.96, title, fontsize=16, fontweight='bold', ha='center', va='top', color=NAVY, transform=ax.transAxes)
    ax.text(0.5, 0.925, subtitle, fontsize=10, ha='center', va='top', color=TEXT_MUTED, transform=ax.transAxes)

# -------------------------------------------------------------
# 1. USE CASE DIAGRAM
# -------------------------------------------------------------
def generate_use_case_diagram():
    fig, ax = plt.subplots(figsize=(14, 10), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    draw_header(ax, "Figure 2.1: Use Case Diagram — KJIT Media Management System", "UML 2.5 Use Case Model Covering 8 Institutional Roles & RBAC Boundaries")

    # System Boundary Box
    rect = patches.FancyBboxPatch((24, 4), 52, 85, boxstyle="round,pad=1", edgecolor=NAVY, facecolor="#fcfcfd", linewidth=2.5)
    ax.add_patch(rect)
    ax.text(50, 87, "KJIT Media Management System Boundary", fontsize=12, fontweight='bold', ha='center', va='center', color=NAVY)

    # Actors (Left & Right)
    actors = [
        # Left side
        ("Admin", 8, 80),
        ("Faculty", 8, 60),
        ("Media Team Head", 8, 40),
        ("Media Member", 8, 20),
        # Right side
        ("Dean", 92, 80),
        ("HOD", 92, 60),
        ("Programme Coord.", 92, 40),
        ("Social Media Handler", 92, 20)
    ]

    for name, x, y in actors:
        # Actor head
        circle = plt.Circle((x, y + 2.5), 1.5, edgecolor=NAVY, facecolor="#e2e8f0", linewidth=1.8)
        ax.add_patch(circle)
        # Body & limbs
        ax.plot([x, x], [y + 1, y - 2], color=NAVY, linewidth=1.8)
        ax.plot([x - 2, x + 2], [y, y], color=NAVY, linewidth=1.8)
        ax.plot([x, x - 1.8], [y - 2, y - 4.5], color=NAVY, linewidth=1.8)
        ax.plot([x, x + 1.8], [y - 2, y - 4.5], color=NAVY, linewidth=1.8)
        # Label
        ax.text(x, y - 6.5, name, fontsize=9.5, fontweight='bold', ha='center', va='top', color=NAVY)

    # Use Cases (Ovals in center)
    use_cases = [
        ("UC1: Authenticate & Provision Users", 50, 81),
        ("UC2: Register Event & Upload Poster", 50, 73),
        ("UC3: View Calendar & Historical Events", 50, 65),
        ("UC4: Assign Crew (Photo/Video/Editor)", 50, 57),
        ("UC5: Upload Media (GeoTag/Raw/Reel)", 50, 49),
        ("UC6: Dean Approval & Review", 50, 41),
        ("UC7: HOD Review & Endorsement", 50, 33),
        ("UC8: Programme Coord. Final Approval", 50, 25),
        ("UC9: AI Caption & Social Media Posting", 50, 17),
        ("UC10: Generate Dynamic Activity Reports", 50, 9)
    ]

    for text, cx, cy in use_cases:
        ellipse = patches.Ellipse((cx, cy), 36, 5.2, edgecolor=BLUE, facecolor=LIGHT_BLUE, linewidth=1.4)
        ax.add_patch(ellipse)
        ax.text(cx, cy, text, fontsize=8.5, fontweight='bold', ha='center', va='center', color=NAVY)

    # Association Lines
    lines = [
        # Admin -> UC1, UC3, UC10
        ((11, 78), (32, 81)), ((11, 78), (32, 65)),
        # Faculty -> UC2, UC3, UC10
        ((11, 58), (32, 73)), ((11, 58), (32, 65)), ((11, 58), (32, 9)),
        # Media Head -> UC3, UC4, UC5
        ((11, 38), (32, 65)), ((11, 38), (32, 57)), ((11, 38), (32, 49)),
        # Media Member -> UC5
        ((11, 18), (32, 49)),
        # Dean -> UC6
        ((89, 78), (68, 41)),
        # HOD -> UC7
        ((89, 58), (68, 33)),
        # Coordinator -> UC8
        ((89, 38), (68, 25)),
        # Social Media Handler -> UC9
        ((89, 18), (68, 17)),
    ]

    for (x1, y1), (x2, y2) in lines:
        ax.plot([x1, x2], [y1, y2], color="#94a3b8", linewidth=1.2, linestyle="-")

    out_file = os.path.join(DIAGRAM_DIR, "fig2_1_use_case_diagram.png")
    plt.tight_layout()
    plt.savefig(out_file, dpi=300)
    plt.close()
    print("Generated:", out_file)

# -------------------------------------------------------------
# 2. SEQUENCE DIAGRAM
# -------------------------------------------------------------
def generate_sequence_diagram():
    fig, ax = plt.subplots(figsize=(14, 10), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    draw_header(ax, "Figure 2.2: Sequence Diagram — End-to-End Event Media Lifecycle", "Chronological Message Exchanges Across Actors, App Router, Handlers & Storage")

    lifelines = [
        ("Faculty", 10),
        ("Media Head", 24),
        ("Editor", 38),
        ("Approver Chain\n(Dean->HOD->Coord)", 55),
        ("Next.js App / API", 72),
        ("Prisma / SQLite\n& Storage", 88)
    ]

    for name, x in lifelines:
        box = patches.FancyBboxPatch((x - 6.5, 87), 13, 6, boxstyle="round,pad=0.3", edgecolor=NAVY, facecolor=LIGHT_BLUE, linewidth=1.5)
        ax.add_patch(box)
        ax.text(x, 90, name, fontsize=8.5, fontweight='bold', ha='center', va='center', color=NAVY)
        ax.plot([x, x], [87, 8], color="#94a3b8", linestyle="--", linewidth=1.2)

    messages = [
        # (step, sender_x, receiver_x, y, label, is_return)
        (1, 10, 72, 82, "1. POST /api/events (Register event & poster)", False),
        (2, 72, 88, 77, "2. INSERT Event & AuditLog", False),
        (3, 88, 72, 73, "3. Event created (status: REGISTERED)", True),
        (4, 24, 72, 67, "4. POST /api/events/[id]/assign (Crew)", False),
        (5, 72, 88, 62, "5. INSERT Assignments (status: ASSIGNED)", False),
        (6, 38, 72, 56, "6. POST /api/media/upload (Final Reel)", False),
        (7, 72, 88, 51, "7. Persist MediaAsset (status: REEL_SUBMITTED)", False),
        (8, 55, 72, 45, "8. POST /api/approvals (Stage 1: Dean Approve)", False),
        (9, 72, 88, 40, "9. UPDATE ApprovalStep (DEAN_APPROVED)", False),
        (10, 55, 72, 34, "10. POST /api/approvals (Stage 2: HOD Approve)", False),
        (11, 72, 88, 29, "11. UPDATE ApprovalStep (HOD_APPROVED)", False),
        (12, 55, 72, 23, "12. POST /api/approvals (Stage 3: Coord Final)", False),
        (13, 72, 88, 18, "13. Set status: PUBLISHED / AWAITING_SOCIAL", False),
        (14, 10, 72, 12, "14. POST /api/reports (Generate 8 Activity Formats)", False),
    ]

    for step, x1, x2, y, label, is_ret in messages:
        color = BLUE if not is_ret else ACCENT_GREEN
        style = "->" if not is_ret else "->"
        ls = "-" if not is_ret else ":"
        ax.annotate(
            "", xy=(x2, y), xytext=(x1, y),
            arrowprops=dict(arrowstyle=style, color=color, lw=1.3, linestyle=ls)
        )
        mid_x = (x1 + x2) / 2
        ax.text(mid_x, y + 1.2, label, fontsize=8, fontweight='bold', ha='center', va='bottom', color=NAVY, bbox=dict(boxstyle="round,pad=0.2", fc="white", ec="none", alpha=0.9))

    out_file = os.path.join(DIAGRAM_DIR, "fig2_2_sequence_diagram.png")
    plt.tight_layout()
    plt.savefig(out_file, dpi=300)
    plt.close()
    print("Generated:", out_file)

# -------------------------------------------------------------
# 3. ACTIVITY DIAGRAM (Exact Dean -> HOD -> Coordinator Chain)
# -------------------------------------------------------------
def generate_activity_diagram():
    fig, ax = plt.subplots(figsize=(14, 11), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    draw_header(ax, "Figure 2.3: Activity Diagram — Multi-Tier Approval & Publishing Flow", "Sequential Lifecycle: Registration -> Crew Assignment -> Dean -> HOD -> Coord -> Social Media -> Report")

    # Swimlanes
    lanes = [
        ("Faculty / Organiser", 0, 20),
        ("Media Team (Head & Crew)", 20, 42),
        ("Department Leadership (Dean -> HOD -> Coord)", 42, 70),
        ("Social Media & Reporting", 70, 100)
    ]

    for title, x1, x2 in lanes:
        rect = patches.Rectangle((x1, 5), x2 - x1, 86, linewidth=1.2, edgecolor=BORDER_COLOR, facecolor="#f8fafc")
        ax.add_patch(rect)
        hdr = patches.Rectangle((x1, 87), x2 - x1, 4, linewidth=1.2, edgecolor=NAVY, facecolor=NAVY)
        ax.add_patch(hdr)
        ax.text((x1 + x2) / 2, 89, title, fontsize=9, fontweight='bold', ha='center', va='center', color="white")

    # Nodes
    # Start node
    start = plt.Circle((10, 83), 1.5, color=NAVY)
    ax.add_patch(start)

    def draw_action(x, y, w, h, text, bg=LIGHT_BLUE, border=BLUE):
        box = patches.FancyBboxPatch((x - w/2, y - h/2), w, h, boxstyle="round,pad=0.4", edgecolor=border, facecolor=bg, linewidth=1.4)
        ax.add_patch(box)
        ax.text(x, y, text, fontsize=7.5, fontweight='bold', ha='center', va='center', color=NAVY)

    def draw_decision(x, y, size, text):
        diamond = patches.RegularPolygon((x, y), numVertices=4, radius=size, orientation=0, edgecolor=ACCENT_AMBER, facecolor="#fef3c7", linewidth=1.4)
        ax.add_patch(diamond)
        ax.text(x, y, text, fontsize=6.8, fontweight='bold', ha='center', va='center', color=NAVY)

    # Action nodes
    draw_action(10, 74, 16, 5, "Register Event &\nSubmit Poster")
    draw_action(31, 74, 18, 5, "Media Head Assigns\nPhoto / Video / Editor")
    draw_action(31, 62, 18, 5, "Field Crew Captures\nGeoTag & Raw Photos")
    draw_action(31, 50, 18, 5, "Editor Compiles &\nSubmits Final Reel")

    # Approval steps (Dean -> HOD -> Coordinator)
    draw_action(56, 50, 20, 5, "Stage 1: Dean Reviews\nCompiled Reel")
    draw_decision(56, 40, 4.5, "Dean\nApproved?")

    draw_action(56, 30, 20, 5, "Stage 2: HOD Reviews\nAcademic Compliance")
    draw_decision(56, 20, 4.5, "HOD\nApproved?")

    draw_action(56, 12, 20, 4.5, "Stage 3: Coord. Reviews\nFinal Endorsement")

    draw_action(85, 30, 22, 5, "Social Media Handler:\nAI Caption & Manual URL Log")
    draw_action(85, 18, 22, 5, "Dynamic Report Engine:\nExport 8 Activity Formats")

    end = plt.Circle((85, 9), 1.6, edgecolor=NAVY, facecolor=NAVY)
    ax.add_patch(end)
    end_inner = plt.Circle((85, 9), 1.1, color="white")
    ax.add_patch(end_inner)
    end_dot = plt.Circle((85, 9), 0.7, color=NAVY)
    ax.add_patch(end_dot)

    # Connectors
    arrows = [
        ((10, 81.5), (10, 76.5)),
        ((18, 74), (22, 74)),
        ((31, 71.5), (31, 64.5)),
        ((31, 59.5), (31, 52.5)),
        ((40, 50), (46, 50)),
        ((56, 47.5), (56, 44.5)),
        # Dean approved -> HOD
        ((56, 35.5), (56, 32.5)),
        # HOD approved -> Coordinator
        ((56, 25.5), (56, 24.5)),
        ((56, 15.5), (56, 14.5)),
        # Coord approved -> Social media
        ((66, 12), (74, 12)),
        ((74, 12), (74, 30)),
        ((74, 30), (74, 30)),
        ((74, 30), (85, 30)),
        ((85, 27.5), (85, 20.5)),
        ((85, 15.5), (85, 11)),
    ]

    for (x1, y1), (x2, y2) in arrows:
        ax.annotate("", xy=(x2, y2), xytext=(x1, y1), arrowprops=dict(arrowstyle="->", color=NAVY, lw=1.3))

    # Rejection loop from Dean/HOD back to Editor
    ax.annotate("Dean Rejected (Notes)", xy=(40, 52), xytext=(48, 40), arrowprops=dict(arrowstyle="->", color=ACCENT_RED, lw=1.2, linestyle="--"))
    ax.annotate("HOD Rejected", xy=(40, 51), xytext=(48, 20), arrowprops=dict(arrowstyle="->", color=ACCENT_RED, lw=1.2, linestyle="--"))

    out_file = os.path.join(DIAGRAM_DIR, "fig2_3_activity_diagram.png")
    plt.tight_layout()
    plt.savefig(out_file, dpi=300)
    plt.close()
    print("Generated:", out_file)

# -------------------------------------------------------------
# 4. SYSTEM ARCHITECTURE / DESIGN DIAGRAM
# -------------------------------------------------------------
def generate_system_architecture():
    fig, ax = plt.subplots(figsize=(14, 10), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    draw_header(ax, "Figure 5.1: System Architecture Diagram — KJIT Media Management System", "Multi-Tier Enterprise Architecture: Presentation, App Router, Handlers, Services & Data Layers")

    layers = [
        ("Tier 1: Presentation & Client UI Layer", 88, 8, [
            ("Responsive Web Clients\n(Desktop, Tablet, Mobile)", 20, 84, 25, 5),
            ("Tailwind CSS & Framer Motion\nModern Glassmorphism UI", 50, 84, 27, 5),
            ("Lucide React Icons &\nInteractive Workspaces", 80, 84, 25, 5)
        ]),
        ("Tier 2: Next.js 14 App Router & Core Controllers", 71, 8, [
            ("Role-Based Page Routes\n(/login, /dashboard/*)", 22, 67, 28, 5),
            ("Client State Contexts\n(AuthContext, ToastContext)", 52, 67, 26, 5),
            ("Dynamic SSR / Client Renderers\n(PDF/Excel Export Handlers)", 81, 67, 26, 5)
        ]),
        ("Tier 3: API Gateway & Route Handler Layer", 54, 8, [
            ("Auth & Admin APIs\n(/api/auth, /api/admin/*)", 20, 50, 24, 5),
            ("Event & Media APIs\n(/api/events, /api/media/*)", 45, 50, 24, 5),
            ("Approvals & Social APIs\n(/api/approvals, /api/social/*)", 70, 50, 24, 5),
            ("Reporting APIs\n(/api/reports)", 91, 50, 15, 5)
        ]),
        ("Tier 4: Business Logic, Security & Service Layer", 37, 8, [
            ("JWT Auth & RBAC Guard\n(lib/auth.ts, rolePerms)", 20, 33, 24, 5),
            ("Approval Engine\n(Dean->HOD->Coord)", 45, 33, 24, 5),
            ("Audit Logging Service\n(lib/audit.ts)", 70, 33, 22, 5),
            ("Email & Notification Service\n(lib/email/email-service.ts)", 91, 33, 16, 5)
        ]),
        ("Tier 5: Data Access, Storage & External Services", 20, 8, [
            ("Prisma ORM Client\n(prisma/schema.prisma)", 20, 16, 24, 5),
            ("SQLite Relational DB\n(prisma/dev.db)", 45, 16, 22, 5),
            ("Local File Storage Provider\n(/uploads directory)", 69, 16, 22, 5),
            ("External: Google Drive / SMTP\n(googleapis, nodemailer)", 91, 16, 16, 5)
        ]),
    ]

    for title, y_top, h, components in layers:
        # Container
        box = patches.FancyBboxPatch((4, y_top - 12), 92, 12, boxstyle="round,pad=0.5", edgecolor=NAVY, facecolor="#f8fafc", linewidth=1.5)
        ax.add_patch(box)
        ax.text(6, y_top - 2, title, fontsize=9.5, fontweight='bold', color=NAVY)

        for name, cx, cy, w, ch in components:
            cbox = patches.FancyBboxPatch((cx - w/2, cy - ch/2), w, ch, boxstyle="round,pad=0.3", edgecolor=BLUE, facecolor=LIGHT_BLUE, linewidth=1.1)
            ax.add_patch(cbox)
            ax.text(cx, cy, name, fontsize=7.2, fontweight='bold', ha='center', va='center', color=NAVY)

    # Inter-tier arrows
    tier_arrows = [
        ((50, 80), (50, 75)),
        ((50, 63), (50, 58)),
        ((50, 46), (50, 41)),
        ((50, 29), (50, 24)),
    ]
    for (x1, y1), (x2, y2) in tier_arrows:
        ax.annotate("", xy=(x2, y2), xytext=(x1, y1), arrowprops=dict(arrowstyle="<->", color=NAVY, lw=2))

    out_file = os.path.join(DIAGRAM_DIR, "fig5_1_system_architecture.png")
    plt.tight_layout()
    plt.savefig(out_file, dpi=300)
    plt.close()
    print("Generated:", out_file)

# -------------------------------------------------------------
# 5. DFD LEVEL 1
# -------------------------------------------------------------
def generate_dfd_level1():
    fig, ax = plt.subplots(figsize=(14, 10), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    draw_header(ax, "Figure 5.2: Data Flow Diagram — Level 1 (Macro Processes & Stores)", "Level 1 System Decomposition Showing External Entities, Core Subsystems & Data Stores")

    # External Entities (Rectangles)
    entities = [
        ("Faculty / Organiser", 12, 85),
        ("Media Team Head", 12, 60),
        ("Media Crew Member", 12, 35),
        ("System Administrator", 12, 12),
        ("Dean / HOD / Coord", 88, 85),
        ("Social Media Handler", 88, 60),
        ("SMTP Email Server", 88, 35),
        ("Google Drive / Cloud", 88, 12),
    ]

    for name, x, y in entities:
        rect = patches.Rectangle((x - 9, y - 4), 18, 8, edgecolor=NAVY, facecolor="#e2e8f0", linewidth=1.6)
        ax.add_patch(rect)
        ax.text(x, y, name, fontsize=8, fontweight='bold', ha='center', va='center', color=NAVY)

    # Core Processes (Rounded Rectangles or Circles)
    processes = [
        ("1.0\nAuth & RBAC", 38, 85),
        ("2.0\nEvent Mgmt", 38, 60),
        ("3.0\nCrew Assignment", 38, 35),
        ("4.0\nMedia Capture", 62, 35),
        ("5.0\nApproval Workflow\n(Dean->HOD->Coord)", 62, 85),
        ("6.0\nSocial Publication", 62, 60),
        ("7.0\nDynamic Reports", 50, 48),
        ("8.0\nAudit Logging", 50, 15),
    ]

    for label, x, y in processes:
        circ = patches.Circle((x, y), 5.5, edgecolor=BLUE, facecolor=LIGHT_BLUE, linewidth=1.5)
        ax.add_patch(circ)
        ax.text(x, y, label, fontsize=7.2, fontweight='bold', ha='center', va='center', color=NAVY)

    # Data Stores (Open-ended or double lines)
    stores = [
        ("D1: User Store", 50, 93),
        ("D2: Event Store", 50, 73),
        ("D3: Media Store", 50, 27),
        ("D4: Audit Store", 50, 4),
    ]

    for name, x, y in stores:
        ax.plot([x - 10, x + 10], [y + 2, y + 2], color=NAVY, lw=1.5)
        ax.plot([x - 10, x + 10], [y - 2, y - 2], color=NAVY, lw=1.5)
        ax.plot([x - 10, x - 10], [y - 2, y + 2], color=NAVY, lw=1.5)
        ax.text(x, y, name, fontsize=7.5, fontweight='bold', ha='center', va='center', color=NAVY)

    out_file = os.path.join(DIAGRAM_DIR, "fig5_2_dfd_level1.png")
    plt.tight_layout()
    plt.savefig(out_file, dpi=300)
    plt.close()
    print("Generated:", out_file)

# -------------------------------------------------------------
# 6. DFD LEVEL 2
# -------------------------------------------------------------
def generate_dfd_level2():
    fig, ax = plt.subplots(figsize=(14, 10), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    draw_header(ax, "Figure 5.3: Data Flow Diagram — Level 2 (Event-to-Publishing Pipeline)", "Detailed Sub-Process Decomposition: Event Capture -> Crew -> Media -> 3-Stage Approval -> Publication")

    # Flow sequence of detailed processes
    sub_processes = [
        ("5.1\nValidate Event &\nPoster Upload", 15, 82),
        ("5.2\nAssign Media Crew\n(Photo/Video/Edit)", 38, 82),
        ("5.3\nCapture GeoTag\n& Raw Media", 62, 82),
        ("5.4\nEditor Reel\nCompilation", 85, 82),

        ("5.5\nStage 1: Dean\nEvaluation", 85, 50),
        ("5.6\nStage 2: HOD\nReview", 62, 50),
        ("5.7\nStage 3: Coord\nFinal Endorsement", 38, 50),
        ("5.8\nRevision Loop\n(Rejection/Notes)", 15, 50),

        ("5.9\nSocial Media\nPublishing & URLs", 25, 20),
        ("5.10\nDynamic 8-Format\nReport Generator", 55, 20),
        ("5.11\nSystem Audit Log\nPersistence", 82, 20),
    ]

    for label, x, y in sub_processes:
        circ = patches.Circle((x, y), 6, edgecolor=BLUE, facecolor=LIGHT_BLUE, linewidth=1.5)
        ax.add_patch(circ)
        ax.text(x, y, label, fontsize=7.2, fontweight='bold', ha='center', va='center', color=NAVY)

    # Connectors
    flows = [
        ((21, 82), (32, 82), "Valid Record"),
        ((44, 82), (56, 82), "Crew Notified"),
        ((68, 82), (79, 82), "Raw Assets"),
        ((85, 76), (85, 56), "Reel Submitted"),
        ((79, 50), (68, 50), "Dean OK"),
        ((56, 50), (44, 50), "HOD OK"),
        ((32, 50), (21, 50), "If Rejected"),
        ((15, 56), (15, 76), "Corrections"),
        ((38, 44), (28, 26), "All 3 Approved"),
        ((31, 20), (49, 20), "Publication Live"),
        ((61, 20), (76, 20), "Exported"),
    ]

    for (x1, y1), (x2, y2), txt in flows:
        ax.annotate("", xy=(x2, y2), xytext=(x1, y1), arrowprops=dict(arrowstyle="->", color=NAVY, lw=1.3))
        mid_x, mid_y = (x1 + x2)/2, (y1 + y2)/2
        ax.text(mid_x, mid_y + 1.2, txt, fontsize=7, color=BLUE, ha='center', va='bottom', bbox=dict(boxstyle="round,pad=0.2", fc="white", ec="none"))

    out_file = os.path.join(DIAGRAM_DIR, "fig5_3_dfd_level2.png")
    plt.tight_layout()
    plt.savefig(out_file, dpi=300)
    plt.close()
    print("Generated:", out_file)

# -------------------------------------------------------------
# 7. ENTITY RELATIONSHIP (ER) DIAGRAM
# -------------------------------------------------------------
def generate_er_diagram():
    fig, ax = plt.subplots(figsize=(15, 11), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    draw_header(ax, "Figure 5.4: Entity Relationship (ER) Diagram — Prisma SQLite Schema", "Verified Relational Schema: 11 Models, Primary/Foreign Keys & Cardinalities from prisma/schema.prisma")

    # Table specifications: (name, x, y, w, h, attributes)
    tables = [
        ("User", 5, 60, 20, 28, [
            ("PK", "id: String (UUID)"),
            ("U", "email: String"),
            (" ", "name: String"),
            (" ", "role: String"),
            (" ", "department: String"),
            (" ", "passwordHash: String"),
            (" ", "isActive: Boolean"),
            (" ", "mustChangePassword: Bool"),
            (" ", "createdAt / updatedAt: DateTime")
        ]),
        ("RolePermission", 5, 25, 20, 15, [
            ("PK", "id: String (UUID)"),
            (" ", "role: String"),
            (" ", "permissionCode: String"),
            ("U", "[role, permissionCode]")
        ]),
        ("Event", 38, 55, 24, 35, [
            ("PK", "id: String (UUID)"),
            (" ", "name: String"),
            (" ", "category: String"),
            (" ", "dateTime / venue: String"),
            (" ", "expectedAudience: String"),
            (" ", "dignitariesJson: String"),
            (" ", "chiefGuest / guestCount"),
            (" ", "mediaDeadline: DateTime"),
            (" ", "status: String"),
            ("FK", "createdById -> User.id"),
            (" ", "posterFileId / drivePath"),
            (" ", "driveFolderUrl / Id"),
            (" ", "createdAt / updatedAt")
        ]),
        ("Assignment", 72, 75, 22, 17, [
            ("PK", "id: String (UUID)"),
            ("FK", "eventId -> Event.id"),
            ("FK", "userId -> User.id"),
            (" ", "roleInEvent: String"),
            (" ", "assignedAt: DateTime")
        ]),
        ("MediaAsset", 72, 48, 22, 22, [
            ("PK", "id: String (UUID)"),
            ("FK", "eventId -> Event.id"),
            (" ", "fileName: String"),
            (" ", "fileType: RAW/GEOTAG/REEL"),
            (" ", "fileId / drivePath: String"),
            ("FK", "uploaderId -> User.id"),
            (" ", "caption / geotagData"),
            (" ", "createdAt: DateTime")
        ]),
        ("ApprovalStep", 72, 23, 22, 20, [
            ("PK", "id: String (UUID)"),
            ("FK", "eventId -> Event.id"),
            (" ", "stage: DEAN/HOD/COORD"),
            (" ", "status: PENDING/APP/REJ"),
            ("FK", "reviewerId -> User.id"),
            (" ", "comments: String?"),
            (" ", "reviewedAt: DateTime?")
        ]),
        ("SocialMediaPublication", 38, 22, 24, 22, [
            ("PK", "id: String (UUID)"),
            ("FK", "eventId (1:1) -> Event.id"),
            ("FK", "reelId -> MediaAsset.id"),
            (" ", "caption: String?"),
            (" ", "instagramUrl / linkedinUrl"),
            (" ", "status: String"),
            ("FK", "postedById -> User.id")
        ]),
        ("Report", 5, 2, 20, 16, [
            ("PK", "id: String (UUID)"),
            ("FK", "eventId -> Event.id"),
            (" ", "formatType: Format1-8"),
            (" ", "reportDataJson: String"),
            ("FK", "generatedById -> User.id"),
            (" ", "pdfUrl: String?")
        ]),
        ("AuditLog", 38, 2, 24, 15, [
            ("PK", "id: String (UUID)"),
            ("FK", "userId -> User.id?"),
            (" ", "userName / role: String"),
            (" ", "action / details: String"),
            (" ", "ipAddress: String?")
        ]),
        ("PasswordResetToken", 72, 2, 22, 16, [
            ("PK", "id: String (UUID)"),
            ("U", "tokenHash: String"),
            ("FK", "userId -> User.id"),
            (" ", "expiresAt: DateTime"),
            (" ", "usedAt: DateTime?")
        ]),
    ]

    for name, x, y, w, h, attrs in tables:
        # Table card
        box = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.2", edgecolor=NAVY, facecolor="#ffffff", linewidth=1.4)
        ax.add_patch(box)
        # Header
        hdr = patches.Rectangle((x, y + h - 3.5), w, 3.5, edgecolor=NAVY, facecolor=NAVY)
        ax.add_patch(hdr)
        ax.text(x + w/2, y + h - 1.8, name, fontsize=8.5, fontweight='bold', ha='center', va='center', color="white")

        curr_y = y + h - 5.5
        for key_type, attr in attrs:
            prefix = f"[{key_type}] " if key_type.strip() else "     "
            ax.text(x + 1, curr_y, prefix, fontsize=6.8, fontweight='bold', color=ACCENT_AMBER if "PK" in key_type else (BLUE if "FK" in key_type else TEXT_MUTED))
            ax.text(x + 4.5, curr_y, attr, fontsize=6.8, color=TEXT_DARK)
            curr_y -= 2.2

    # Relationship connectors
    rel_lines = [
        # User -> Event (1:N)
        ((25, 75), (38, 75), "1 : N"),
        # Event -> Assignment (1:N)
        ((62, 75), (72, 80), "1 : N"),
        # Event -> MediaAsset (1:N)
        ((62, 65), (72, 60), "1 : N"),
        # Event -> ApprovalStep (1:N)
        ((62, 58), (72, 33), "1 : N"),
        # Event -> SocialMediaPublication (1:1)
        ((50, 55), (50, 44), "1 : 1"),
        # Event -> Report (1:N)
        ((38, 56), (25, 10), "1 : N"),
        # User -> AuditLog (1:N)
        ((15, 60), (38, 10), "1 : N"),
    ]

    for (x1, y1), (x2, y2), lbl in rel_lines:
        ax.plot([x1, x2], [y1, y2], color=BLUE, linewidth=1.3, linestyle="--")
        mid_x, mid_y = (x1 + x2)/2, (y1 + y2)/2
        ax.text(mid_x, mid_y, lbl, fontsize=6.5, fontweight='bold', color=NAVY, bbox=dict(boxstyle="round,pad=0.2", fc="white", ec=BORDER_COLOR))

    out_file = os.path.join(DIAGRAM_DIR, "fig5_4_er_diagram.png")
    plt.tight_layout()
    plt.savefig(out_file, dpi=300)
    plt.close()
    print("Generated:", out_file)

if __name__ == "__main__":
    generate_use_case_diagram()
    generate_sequence_diagram()
    generate_activity_diagram()
    generate_system_architecture()
    generate_dfd_level1()
    generate_dfd_level2()
    generate_er_diagram()
    print("All 7 diagrams generated successfully at 300 DPI!")
