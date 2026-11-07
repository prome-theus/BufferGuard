import os
import json
import csv
from datetime import datetime
from typing import Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

class ReportGenerator:
    """
    Generates downloadable audit reports in PDF, JSON, and CSV formats.
    """

    EXPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "exports")

    @classmethod
    def generate_json(cls, scan_data: Dict[str, Any]) -> str:
        os.makedirs(cls.EXPORTS_DIR, exist_ok=True)
        filename = f"scan_report_{scan_data['id']}_{int(datetime.utcnow().timestamp())}.json"
        filepath = os.path.join(cls.EXPORTS_DIR, filename)

        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(scan_data, f, indent=2, default=str)

        return filepath

    @classmethod
    def generate_csv(cls, scan_data: Dict[str, Any]) -> str:
        os.makedirs(cls.EXPORTS_DIR, exist_ok=True)
        filename = f"scan_report_{scan_data['id']}_{int(datetime.utcnow().timestamp())}.csv"
        filepath = os.path.join(cls.EXPORTS_DIR, filename)

        with open(filepath, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["Scan ID", "Filename", "Security Score", "Total Findings", "Timestamp"])
            writer.writerow([
                scan_data.get("id"),
                scan_data.get("filename"),
                scan_data.get("security_score"),
                scan_data.get("total_findings"),
                scan_data.get("scan_timestamp")
            ])
            writer.writerow([])
            writer.writerow(["Line", "Severity", "Confidence", "Vulnerability Type", "CWE ID", "Snippet", "Recommendation"])
            for v in scan_data.get("vulnerabilities", []):
                writer.writerow([
                    v.get("line_number"),
                    v.get("severity"),
                    v.get("confidence"),
                    v.get("vulnerability_type"),
                    v.get("cwe_id"),
                    v.get("code_snippet"),
                    v.get("recommendation")
                ])

        return filepath

    @classmethod
    def generate_pdf(cls, scan_data: Dict[str, Any]) -> str:
        os.makedirs(cls.EXPORTS_DIR, exist_ok=True)
        filename = f"scan_report_{scan_data['id']}_{int(datetime.utcnow().timestamp())}.pdf"
        filepath = os.path.join(cls.EXPORTS_DIR, filename)

        doc = SimpleDocTemplate(filepath, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        story = []
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=22,
            textColor=colors.HexColor('#0F172A'),
            spaceAfter=10
        )
        subtitle_style = ParagraphStyle(
            'SubTitle',
            parent=styles['Normal'],
            fontSize=11,
            textColor=colors.HexColor('#475569'),
            spaceAfter=15
        )
        h2_style = ParagraphStyle(
            'H2',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#1E293B'),
            spaceBefore=15,
            spaceAfter=8
        )
        body_style = styles['Normal']

        # Header
        story.append(Paragraph("BufferGuard Security Audit Report", title_style))
        story.append(Paragraph(
            f"Generated on {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')} | Target File: <b>{scan_data.get('filename')}</b>",
            subtitle_style
        ))
        story.append(Spacer(1, 10))

        # Executive Summary Table
        summary_data = [
            ["Metric", "Value"],
            ["Scan ID", str(scan_data.get("id"))],
            ["Security Score", f"{scan_data.get('security_score')}/100"],
            ["Total Vulnerabilities", str(scan_data.get("total_findings"))],
            ["Analysis Status", str(scan_data.get("status"))],
            ["SHA-256 Hash", str(scan_data.get("source_hash"))[:20] + "..."]
        ]
        summary_table = Table(summary_data, colWidths=[200, 340])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0284C7')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F8FAFC')),
        ]))
        story.append(summary_table)
        story.append(Spacer(1, 15))

        # Findings Detail
        story.append(Paragraph("Identified Vulnerabilities & Remediation", h2_style))
        vulnerabilities = scan_data.get("vulnerabilities", [])

        if not vulnerabilities:
            story.append(Paragraph("No vulnerabilities detected. Source code conforms to safe memory practices.", body_style))
        else:
            vuln_rows = [["Line", "Severity", "Finding & Recommendation", "CWE"]]
            for v in vulnerabilities:
                line_info = str(v.get("line_number"))
                sev = v.get("severity")
                desc_text = (
                    f"<b>{v.get('vulnerability_type')}</b> ({v.get('confidence')})<br/>"
                    f"<i>Code:</i> <code>{v.get('code_snippet', '')}</code><br/>"
                    f"<b>Recommendation:</b> {v.get('recommendation')}"
                )
                cwe = v.get("cwe_id", "").split(":")[0]
                vuln_rows.append([line_info, sev, Paragraph(desc_text, body_style), cwe])

            vuln_table = Table(vuln_rows, colWidths=[40, 70, 360, 70])
            vuln_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#334155')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
            ]))
            story.append(vuln_table)

        story.append(Spacer(1, 20))
        disclaimer = (
            "<b>Disclaimer:</b> BufferGuard uses static pattern analysis and contextual heuristics. "
            "Static analysis cannot detect all runtime memory errors. Always pair with AddressSanitizer (ASan) "
            "and dynamic fuzz testing."
        )
        story.append(Paragraph(disclaimer, ParagraphStyle('Disc', parent=styles['Normal'], fontSize=8, textColor=colors.HexColor('#64748B'))))

        doc.build(story)
        return filepath
