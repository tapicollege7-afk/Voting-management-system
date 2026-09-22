import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header (pages 2+)
        if self._pageNumber > 1:
            self.drawString(54, 750, "VotePulse E-Voting Platform — Detailed Module & Language Architecture Report")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)
            
        # Footer (all pages)
        footer_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 36, footer_text)
        self.drawString(54, 36, "CONFIDENTIAL & PROPRIETARY — VOTEPULSE PROJECT TECHNICAL SPECIFICATION")
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(54, 48, 558, 48)
        
        self.restoreState()

def build_pdf():
    pdf_filename = "VotePulse_Module_Language_Architecture_Report.pdf"
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=60,
        bottomMargin=60
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    c_primary = colors.HexColor("#0f172a")    # Slate 900
    c_secondary = colors.HexColor("#0284c7")  # Sky 600
    c_dark = colors.HexColor("#1e293b")       # Slate 800
    c_light_bg = colors.HexColor("#f8fafc")   # Slate 50
    c_accent = colors.HexColor("#059669")     # Emerald 600

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#475569"),
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#0369a1"),
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#334155"),
        spaceAfter=6
    )

    cell_header_style = ParagraphStyle(
        'CellHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.white,
        alignment=0
    )

    cell_style = ParagraphStyle(
        'CellText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor("#1e293b")
    )

    cell_code_style = ParagraphStyle(
        'CellCode',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor("#0284c7")
    )

    story = []

    # --- Title Banner ---
    story.append(Paragraph("VotePulse E-Voting Platform", title_style))
    story.append(Paragraph("Technical Specification: Module-by-Module Language, File Structure & Execution Workflow Report", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_secondary, spaceBefore=0, spaceAfter=15))

    # Executive Overview
    overview_text = (
        "<b>Executive Summary:</b> The VotePulse platform is an enterprise-grade, full-stack e-Voting and Election "
        "Management Progressive Web Application (PWA). It leverages modern asynchronous JavaScript (Node.js ES6+), "
        "React 19 component library, Express.js REST API layer, and Mongoose Object-Data Modeling over MongoDB. "
        "The application utilizes 256-bit SHA-256 cryptographic hashing alongside Caesar Cipher shift encryption "
        "to guarantee single-vote immutability, voter anonymity, and public auditability."
    )
    story.append(Paragraph(overview_text, body_style))
    story.append(Spacer(1, 10))

    # --- Section 1: Master Architecture Table ---
    story.append(Paragraph("1. Comprehensive Module & Language Distribution Matrix", h1_style))
    
    table_data = [
        [
            Paragraph("Module Name", cell_header_style),
            Paragraph("Language / Tech", cell_header_style),
            Paragraph("File Location Path", cell_header_style),
            Paragraph("Key Responsibilities & Execution Logic", cell_header_style)
        ]
    ]

    modules_info = [
        (
            "Voter Access & Voting Portal",
            "JavaScript (JSX / React 19)\nHTML5 / CSS3",
            "src/components/VoterPortal.jsx",
            "Voter authentication, real-time Gmail OTP verification modal, live poll standings, single-vote ballot submission, Caesar Cipher receipt copy."
        ),
        (
            "Candidate Command Center",
            "JavaScript (JSX / React 19)\nVanilla CSS",
            "src/components/CandidatePortal.jsx",
            "Candidate login & nomination registration, manifesto studio, live vote share analytics, campaign announcements, digital verified badge generation."
        ),
        (
            "Administrator Console",
            "JavaScript (JSX / React 19)\nVanilla CSS",
            "src/components/AdminConsole.jsx",
            "Restricted admin auth, election lifecycle management (active/closed), candidate registration, real-time analytics tally, MongoDB visual inspector."
        ),
        (
            "Ballot Audit & Verification",
            "JavaScript (JSX / React 19)",
            "src/components/BallotAuditTool.jsx",
            "Public cryptographic verification portal. Accepts Caesar/SHA-256 hashes, decrypts shift cipher, verifies vote presence without breaking anonymity."
        ),
        (
            "Application Shell & Router",
            "JavaScript (JSX / React 19)\nHTML5",
            "src/App.jsx\nindex.html",
            "Client-side SPA hash/pathname router (#voter, #candidate, #admin, #audit), theme manager, PWA install prompt banner, global user session state."
        ),
        (
            "Navigation & Quick Route",
            "JavaScript (JSX / React 19)",
            "src/components/Navbar.jsx",
            "Top navigation bar with active route pills, secret admin gate (triple-click logo / Ctrl+Shift+A), reactive Quick Admin/Voter switch button."
        ),
        (
            "Backend REST API Server",
            "Node.js (ES6+)\nExpress.js",
            "server.js",
            "Express HTTP web server listening on port 3000. Handles authentication, vote casting, elections CRUD, admin metrics, and static asset serving."
        ),
        (
            "Database Engine (NoSQL)",
            "Node.js / Mongoose\nMongoDB BSON",
            "database/mongo_db.js\ndatabase/db.js",
            "MongoDB ODM layer defining Mongoose schemas (User, Election, Candidate, Vote, GmailToken). Handles queries, document creation, and auto-seeding."
        ),
        (
            "Email & OTP Dispatcher",
            "Node.js / Nodemailer\nSMTP Protocol",
            "utils/email.js",
            "Gmail SMTP integration sending real 6-digit verification codes to voters' Gmail addresses using custom HTML email templates."
        ),
        (
            "Cryptographic Security Engine",
            "Node.js / Native Crypto",
            "utils/cipher.js",
            "Encapsulates 256-bit SHA-256 hashing and custom Caesar Cipher shift encryption/decryption functions for tamper-proof vote sealing."
        ),
        (
            "Backend Request Validation",
            "Node.js (CommonJS)",
            "middleware/validation.js",
            "Server-side middleware enforcing voter registration rules, 5-character password constraints, OTP formats, and vote payload validation."
        ),
        (
            "Progressive Web App (PWA)",
            "JavaScript / JSON\nWeb App Manifest",
            "sw.js\nmanifest.json",
            "Service worker script enabling offline caching (v106 cache buster), background fetch intercept, asset pre-caching, standalone app install."
        )
    ]

    for mod, lang, path_str, desc in modules_info:
        table_data.append([
            Paragraph(f"<b>{mod}</b>", cell_style),
            Paragraph(lang.replace('\n', '<br/>'), cell_style),
            Paragraph(path_str.replace('\n', '<br/>'), cell_code_style),
            Paragraph(desc, cell_style)
        ])

    col_widths = [110, 85, 125, 184]
    t = Table(table_data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_light_bg])
    ]))

    story.append(t)
    story.append(Spacer(1, 14))

    # --- Section 2: Detailed Workflow & How It Works ---
    story.append(Paragraph("2. Detailed Execution Workflows & Module Operations", h1_style))

    workflows = [
        ("A. Voter Authentication & Gmail OTP Verification Workflow",
         "1. <b>Credentials Entry</b>: Voter inputs Voter ID / Gmail & Password (max 5 chars) in <code>VoterPortal.jsx</code>.<br/>"
         "2. <b>Server Verification</b>: <code>server.js</code> invokes <code>db.findUserByVoterId()</code> and <code>verifyUserPassword()</code>.<br/>"
         "3. <b>OTP Generation & Email Dispatch</b>: <code>createGmailToken()</code> generates a 6-digit token in MongoDB. <code>utils/email.js</code> dispatches an HTML email via Gmail SMTP.<br/>"
         "4. <b>Token Input</b>: Voter enters 6-digit code in the modal. <code>verifyGmailToken()</code> validates code and expiry, granting authenticated access."),

        ("B. Encrypted Vote Casting & Cryptographic Receipt Workflow",
         "1. <b>Ballot Selection</b>: Authenticated voter selects candidate in <code>VoterPortal.jsx</code>.<br/>"
         "2. <b>Single-Vote Verification</b>: Server checks <code>db.hasVoted(election_id, voter_id)</code> in MongoDB to prevent duplicate voting.<br/>"
         "3. <b>Cryptographic Sealing</b>: Server encrypts payload with <code>caesarCipherEncrypt(raw, 3)</code> and generates <code>sha256Hash(raw)</code>.<br/>"
         "4. <b>Tally Update</b>: Candidate <code>vote_count</code> is atomically incremented by 1 in MongoDB.<br/>"
         "5. <b>Receipt Issuance</b>: Voter receives a unique 256-bit cryptographic receipt hash for independent verification."),

        ("C. Candidate Command & Manifesto Studio Workflow",
         "1. <b>Authentication & Registration</b>: Candidates log in via key or register nomination in <code>CandidatePortal.jsx</code>.<br/>"
         "2. <b>Manifesto Management</b>: Candidates write/edit their campaign promises & slogans; saved to MongoDB and synced live to voter ballots.<br/>"
         "3. <b>Real-Time Standings</b>: 3-second auto-refresh polling fetches live candidate tallies, rank (#1 Leader), and vote percentages.<br/>"
         "4. <b>Verification Badge</b>: Generates digital candidate verification card with SHA-256 seal."),

        ("D. Administrator Master Control & Database Inspector",
         "1. <b>Admin Gateway</b>: Authenticated via <code>ADM-9999</code> credentials in <code>AdminConsole.jsx</code>.<br/>"
         "2. <b>Election & Candidate Creation</b>: Admin creates new polls or registers candidates directly in MongoDB.<br/>"
         "3. <b>Voter Management</b>: Displays registered voters list with deletion capabilities.<br/>"
         "4. <b>Database Inspector UI</b>: Queries real-time collection counts (Users, Elections, Candidates, Votes, GmailTokens).")
    ]

    for title, desc in workflows:
        story.append(Paragraph(f"<b>{title}</b>", ParagraphStyle('WTitle', parent=body_style, fontName='Helvetica-Bold', fontSize=10, textColor=colors.HexColor("#0f172a"))))
        story.append(Paragraph(desc, body_style))
        story.append(Spacer(1, 4))

    story.append(Spacer(1, 10))

    # --- Section 3: Technology Stack Summary Table ---
    story.append(Paragraph("3. Technology Stack & Language Metrics", h1_style))

    tech_table_data = [
        [
            Paragraph("Layer", cell_header_style),
            Paragraph("Languages / Tooling", cell_header_style),
            Paragraph("Primary Dependency", cell_header_style),
            Paragraph("Project Impact & Role", cell_header_style)
        ],
        [
            Paragraph("Frontend UI", cell_style),
            Paragraph("JavaScript (ES6+), JSX, HTML5, CSS3", cell_style),
            Paragraph("React 19, Lucide React", cell_code_style),
            Paragraph("Interactive user interfaces, glassmorphism UI, real-time polling updates.", cell_style)
        ],
        [
            Paragraph("Backend API", cell_style),
            Paragraph("JavaScript (Node.js CommonJS)", cell_style),
            Paragraph("Express.js v4.22, Cors, Dotenv", cell_code_style),
            Paragraph("RESTful endpoints, route security, static assets serving.", cell_style)
        ],
        [
            Paragraph("Database", cell_style),
            Paragraph("NoSQL BSON Document Store", cell_style),
            Paragraph("Mongoose v9.9, MongoDB", cell_code_style),
            Paragraph("ACID compliance, document persistence, relational model mapping.", cell_style)
        ],
        [
            Paragraph("Security & Email", cell_style),
            Paragraph("Node Native Crypto, SMTP", cell_style),
            Paragraph("Nodemailer v9.0, SHA-256", cell_code_style),
            Paragraph("Gmail OTP token delivery, Caesar Cipher shift ballot encryption.", cell_style)
        ]
    ]

    t2 = Table(tech_table_data, colWidths=[90, 130, 120, 164], repeatRows=1)
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0284c7")),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_light_bg])
    ]))

    story.append(t2)

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"SUCCESS: PDF Report generated: {pdf_filename}")

if __name__ == "__main__":
    build_pdf()
