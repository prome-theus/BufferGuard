import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.scan import Scan
from backend.app.models.report import Report
from backend.app.schemas.report import ReportCreate, ReportResponse
from backend.app.services.reporter import ReportGenerator

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("", response_model=List[ReportResponse])
def list_reports(limit: int = 50, db: Session = Depends(get_db)):
    reports = db.query(Report).order_by(Report.generated_at.desc()).limit(limit).all()
    return reports

@router.post("/generate", response_model=ReportResponse)
def generate_report(payload: ReportCreate, db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.id == payload.scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found.")

    scan_dict = {
        "id": scan.id,
        "filename": scan.filename,
        "source_hash": scan.source_hash,
        "scan_timestamp": scan.scan_timestamp.isoformat(),
        "status": scan.status,
        "total_findings": scan.total_findings,
        "security_score": scan.security_score,
        "vulnerabilities": [
            {
                "id": v.id,
                "vulnerability_type": v.vulnerability_type,
                "severity": v.severity,
                "confidence": v.confidence,
                "line_number": v.line_number,
                "code_snippet": v.code_snippet,
                "description": v.description,
                "possible_consequences": v.possible_consequences,
                "recommendation": v.recommendation,
                "safer_code": v.safer_code,
                "cwe_id": v.cwe_id
            }
            for v in scan.vulnerabilities
        ]
    }

    report_type = payload.report_type.upper()
    if report_type == "PDF":
        filepath = ReportGenerator.generate_pdf(scan_dict)
    elif report_type == "JSON":
        filepath = ReportGenerator.generate_json(scan_dict)
    elif report_type == "CSV":
        filepath = ReportGenerator.generate_csv(scan_dict)
    else:
        raise HTTPException(status_code=400, detail="Invalid report type. Allowed: PDF, JSON, CSV")

    report = Report(
        scan_id=scan.id,
        report_type=report_type,
        file_path=filepath
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return report

@router.get("/{report_id}/download")
def download_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report or not os.path.exists(report.file_path):
        raise HTTPException(status_code=404, detail="Report file not found.")

    filename = os.path.basename(report.file_path)
    media_types = {
        "PDF": "application/pdf",
        "JSON": "application/json",
        "CSV": "text/csv"
    }
    media_type = media_types.get(report.report_type, "application/octet-stream")

    return FileResponse(
        path=report.file_path,
        filename=filename,
        media_type=media_type
    )

@router.get("/quick-export/{scan_id}")
def quick_export_report(scan_id: int, format: str = Query("pdf"), db: Session = Depends(get_db)):
    payload = ReportCreate(scan_id=scan_id, report_type=format.upper())
    report = generate_report(payload, db)
    return download_report(report.id, db)
