"""Generate sample PDF documents for the demo."""
from fpdf import FPDF
import os

OUT_DIR = os.path.join(os.path.dirname(__file__), "frontend", "public", "samples")
os.makedirs(OUT_DIR, exist_ok=True)


def make_pdf(filename: str, title: str, sections: list[tuple[str, str]]):
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 10, title, new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 9)
    pdf.cell(0, 6, "Effective Date: January 15, 2024", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)

    for heading, body in sections:
        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(0, 8, heading, new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 9)
        pdf.multi_cell(0, 5, body)
        pdf.ln(3)

    pdf.output(os.path.join(OUT_DIR, filename))
    print(f"  Created {filename}")


# ── NDA ──────────────────────────────────────────────────────────────────────
make_pdf("nda-sample.pdf", "MUTUAL NON-DISCLOSURE AGREEMENT", [
    ("PARTIES", (
        "This Mutual Non-Disclosure Agreement (\"Agreement\") is entered into as of January 15, 2024 "
        "(\"Effective Date\") by and between Acme Technologies Inc., a Delaware corporation "
        "(\"Acme\"), and Beta Solutions LLC, a California limited liability company (\"Beta\"). "
        "Collectively, Acme and Beta are referred to herein as the \"Parties\"."
    )),
    ("1. PURPOSE", (
        "The Parties wish to explore a potential business relationship in connection with the "
        "development of artificial intelligence software solutions (the \"Purpose\"). In connection "
        "with the Purpose, each Party may disclose to the other certain confidential and proprietary "
        "information. This Agreement is intended to protect such information."
    )),
    ("2. DEFINITION OF CONFIDENTIAL INFORMATION", (
        "\"Confidential Information\" means any and all information or data that has or could have "
        "commercial value or other utility in the business in which the disclosing Party is engaged. "
        "Confidential Information includes, without limitation, technical data, trade secrets, "
        "know-how, research, product plans, products, services, customers, customer lists, markets, "
        "software, source code, developments, inventions, processes, formulas, technology, designs, "
        "drawings, engineering, hardware configuration information, marketing, finances, or other "
        "business information disclosed by the Disclosing Party."
    )),
    ("3. OBLIGATIONS OF RECEIVING PARTY", (
        "Each Party agrees to: (a) hold the other Party's Confidential Information in strict "
        "confidence; (b) not to disclose such Confidential Information to third parties without "
        "the prior written consent of the disclosing Party; (c) use the Confidential Information "
        "solely for the Purpose; (d) protect the Confidential Information using at least the same "
        "degree of care used to protect its own confidential information, but in no event less than "
        "reasonable care."
    )),
    ("4. TERM", (
        "This Agreement shall remain in effect for a period of three (3) years from the Effective "
        "Date, unless earlier terminated by either Party upon thirty (30) days written notice to "
        "the other Party. The obligations of confidentiality shall survive termination of this "
        "Agreement for an additional period of five (5) years."
    )),
    ("5. GOVERNING LAW", (
        "This Agreement shall be governed by and construed in accordance with the laws of the "
        "State of Delaware, without regard to its conflict of law provisions. Any disputes arising "
        "under this Agreement shall be resolved in the courts of New Castle County, Delaware."
    )),
    ("6. INDEMNIFICATION", (
        "Each Party shall indemnify, defend, and hold harmless the other Party and its officers, "
        "directors, employees, agents, successors, and permitted assigns from and against any and "
        "all losses, damages, liabilities, deficiencies, claims, actions, judgments, settlements, "
        "interest, awards, penalties, fines, costs, or expenses of whatever kind arising out of or "
        "resulting from the indemnifying Party's breach of this Agreement. There is no cap on the "
        "indemnification obligations under this Agreement."
    )),
    ("7. ENTIRE AGREEMENT", (
        "This Agreement constitutes the entire agreement between the Parties with respect to its "
        "subject matter and supersedes all prior negotiations, representations, warranties, and "
        "understandings of the Parties with respect thereto. This Agreement may only be modified "
        "by a written instrument signed by authorized representatives of both Parties."
    )),
    ("SIGNATURES", (
        "IN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date.\n\n"
        "Acme Technologies Inc.\nBy: _____________________\nName: John Smith\nTitle: CEO\n\n"
        "Beta Solutions LLC\nBy: _____________________\nName: Sarah Johnson\nTitle: Managing Director"
    )),
])

# ── VENDOR AGREEMENT ─────────────────────────────────────────────────────────
make_pdf("vendor-agreement-sample.pdf", "SAAS VENDOR SERVICES AGREEMENT", [
    ("PARTIES", (
        "This SaaS Vendor Services Agreement (\"Agreement\") is entered into as of January 15, 2024 "
        "by and between CloudBase Corp., a New York corporation (\"Vendor\"), and MidWest Financial "
        "Group Inc., a Michigan corporation (\"Customer\"). Vendor is a provider of cloud-based "
        "financial analytics software services."
    )),
    ("1. SERVICES", (
        "Vendor shall provide Customer with access to the CloudBase Analytics Platform "
        "(the \"Platform\"), a cloud-based software-as-a-service solution, including all features "
        "and functionality described in Exhibit A attached hereto. Vendor reserves the right to "
        "modify, update, or discontinue any feature of the Platform at any time without notice "
        "to Customer."
    )),
    ("2. FEES AND PAYMENT", (
        "Customer shall pay Vendor a monthly subscription fee of $25,000 USD (\"Subscription Fee\"), "
        "invoiced on the first day of each calendar month. Payment is due within fifteen (15) days "
        "of the invoice date. Late payments shall accrue interest at a rate of 2% per month "
        "(24% per annum) on the unpaid balance. Customer is responsible for all applicable taxes. "
        "Vendor may increase Subscription Fees upon 30 days notice. All fees are non-refundable."
    )),
    ("3. TERM AND TERMINATION", (
        "This Agreement shall commence on January 15, 2024 and continue for an initial term of "
        "two (2) years (\"Initial Term\"). After the Initial Term, this Agreement shall automatically "
        "renew for successive one (1) year periods unless either Party provides written notice of "
        "non-renewal at least ninety (90) days prior to the end of the then-current term. "
        "Vendor may terminate this Agreement immediately upon written notice if Customer breaches "
        "any payment obligation. Customer may only terminate for cause with 180 days notice."
    )),
    ("4. DATA PROCESSING AND PRIVACY", (
        "Vendor may collect, process, and store Customer data in connection with providing the "
        "Services. Customer acknowledges that its data may be stored on servers located in the "
        "United States, Canada, or the European Union. Vendor does not maintain a formal Data "
        "Processing Agreement (DPA) and has not designated a Data Protection Officer. Customer "
        "warrants that it has obtained all necessary consents for data processing. Vendor may "
        "use anonymized Customer data for product improvement and benchmarking purposes."
    )),
    ("5. LIMITATION OF LIABILITY", (
        "IN NO EVENT SHALL VENDOR BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, "
        "OR CONSEQUENTIAL DAMAGES. VENDOR'S TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT PAID "
        "BY CUSTOMER IN THE THREE (3) MONTHS PRECEDING THE CLAIM. CUSTOMER'S LIABILITY IS "
        "UNCAPPED AND INCLUDES ALL COSTS OF REMEDIATION."
    )),
    ("6. INTELLECTUAL PROPERTY", (
        "All right, title, and interest in and to the Platform, including all intellectual property "
        "rights therein, shall remain the exclusive property of Vendor. Customer grants Vendor a "
        "perpetual, irrevocable, royalty-free license to use all feedback, suggestions, or "
        "improvements provided by Customer. Customer shall not reverse engineer, decompile, "
        "or disassemble the Platform."
    )),
    ("7. GOVERNING LAW", (
        "This Agreement shall be governed by the laws of the State of New York. All disputes "
        "shall be resolved by binding arbitration in New York City under the rules of the American "
        "Arbitration Association. The prevailing party shall be entitled to attorneys' fees."
    )),
])

# ── LOAN DOCUMENT ─────────────────────────────────────────────────────────────
make_pdf("loan-document-sample.pdf", "COMMERCIAL LOAN AGREEMENT", [
    ("PARTIES", (
        "This Commercial Loan Agreement (\"Agreement\") is entered into as of January 15, 2024 "
        "by and between First National Lending Partners, LP, a Texas limited partnership "
        "(\"Lender\"), and Greenfield Construction LLC, a Texas limited liability company "
        "(\"Borrower\"). This Agreement governs the terms of a commercial real estate development loan."
    )),
    ("1. LOAN AMOUNT AND PURPOSE", (
        "Lender agrees to loan Borrower the principal amount of FIVE MILLION DOLLARS ($5,000,000 USD) "
        "(the \"Loan\") for the purpose of financing the construction of a commercial warehouse "
        "facility located at 4500 Industrial Boulevard, Houston, Texas 77001 "
        "(the \"Project\"). Borrower shall not use the Loan proceeds for any other purpose without "
        "prior written consent of Lender."
    )),
    ("2. INTEREST RATE AND FEES", (
        "The Loan shall bear interest at a fixed rate of 8.75% per annum calculated on the "
        "outstanding principal balance. In addition, Borrower shall pay: (a) an origination fee "
        "of 2.0% of the Loan amount ($100,000) due at closing; (b) a monthly servicing fee of "
        "$500; (c) a prepayment penalty equal to 3% of the outstanding balance if repaid within "
        "the first 24 months, and 1.5% if repaid between months 25-48."
    )),
    ("3. REPAYMENT TERMS", (
        "The Loan shall be repaid in full on or before January 15, 2026 (the \"Maturity Date\"). "
        "Borrower shall make monthly interest-only payments commencing February 15, 2024. "
        "The entire outstanding principal balance, together with all accrued and unpaid interest "
        "and fees, shall be due and payable on the Maturity Date. Late payments shall incur a "
        "penalty of 5% of the overdue amount plus interest at 18% per annum on the delinquent sum."
    )),
    ("4. COLLATERAL AND SECURITY", (
        "As security for the Loan, Borrower hereby grants to Lender a first-priority lien and "
        "security interest in: (a) the Project property and all improvements thereto; "
        "(b) all personal property, equipment, and fixtures located at the Project; "
        "(c) all leases, rents, and revenues generated by the Project; "
        "(d) all accounts receivable of Borrower; and (e) a personal guaranty executed by "
        "Robert Greenfield, individually, with unlimited personal liability."
    )),
    ("5. EVENTS OF DEFAULT", (
        "The following shall constitute Events of Default: (a) failure to make any payment within "
        "5 days of its due date; (b) any material adverse change in Borrower's financial condition; "
        "(c) Borrower's insolvency, bankruptcy filing, or assignment for benefit of creditors; "
        "(d) any breach of representations or covenants; (e) Lender's determination, in its "
        "sole discretion, that repayment is uncertain. Upon any Event of Default, Lender may "
        "accelerate the entire Loan balance and enforce all security interests immediately."
    )),
    ("6. GOVERNING LAW", (
        "This Agreement shall be governed by the laws of the State of Texas. Borrower irrevocably "
        "submits to the exclusive jurisdiction of the state and federal courts located in Harris "
        "County, Texas. BORROWER HEREBY WAIVES ANY RIGHT TO A JURY TRIAL IN ANY DISPUTE "
        "ARISING UNDER THIS AGREEMENT."
    )),
    ("SIGNATURES", (
        "IN WITNESS WHEREOF, the Parties have executed this Agreement as of the date first above written.\n\n"
        "First National Lending Partners, LP\nBy: _____________________\nName: David Chen\nTitle: Managing Partner\n\n"
        "Greenfield Construction LLC\nBy: _____________________\nName: Robert Greenfield\nTitle: Member/Manager"
    )),
])

print("All sample PDFs generated.")
