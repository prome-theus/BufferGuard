from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.database.session import get_db
from backend.app.models.scan import Scan, Vulnerability
from backend.app.models.simulation import Simulation

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_scans = db.query(Scan).count()
    total_simulations = db.query(Simulation).count()
    
    total_findings = db.query(Vulnerability).count()
    confirmed_vulns = db.query(Vulnerability).filter(Vulnerability.confidence == "Confirmed").count()
    potential_vulns = db.query(Vulnerability).filter(Vulnerability.confidence == "Potential").count()
    high_risk_findings = db.query(Vulnerability).filter(Vulnerability.severity.in_(["Critical", "High"])).count()
    
    safe_programs = db.query(Scan).filter(Scan.total_findings == 0).count()
    avg_score = db.query(func.avg(Scan.security_score)).scalar() or 100.0
    latest_scan = db.query(Scan).order_by(Scan.scan_timestamp.desc()).first()

    return {
        "total_scans": total_scans,
        "potential_vulnerabilities": potential_vulns,
        "confirmed_vulnerabilities": confirmed_vulns,
        "high_risk_findings": high_risk_findings,
        "safe_programs": safe_programs,
        "total_simulations": total_simulations,
        "overall_security_score": round(float(avg_score), 1),
        "latest_scan_date": latest_scan.scan_timestamp.isoformat() if latest_scan else None
    }

@router.get("/activity")
def get_recent_activity(db: Session = Depends(get_db)):
    recent_scans = db.query(Scan).order_by(Scan.scan_timestamp.desc()).limit(5).all()
    recent_simulations = db.query(Simulation).order_by(Simulation.created_at.desc()).limit(5).all()
    latest_findings = db.query(Vulnerability).order_by(Vulnerability.id.desc()).limit(5).all()

    return {
        "recent_scans": [
            {
                "id": s.id,
                "filename": s.filename,
                "timestamp": s.scan_timestamp.isoformat(),
                "findings": s.total_findings,
                "score": s.security_score,
                "status": s.status
            }
            for s in recent_scans
        ],
        "recent_simulations": [
            {
                "id": sim.id,
                "buffer_size": sim.buffer_size,
                "input_length": sim.input_length,
                "mode": sim.simulation_mode,
                "is_overflow": sim.is_overflow,
                "created_at": sim.created_at.isoformat()
            }
            for sim in recent_simulations
        ],
        "latest_findings": [
            {
                "id": v.id,
                "scan_id": v.scan_id,
                "type": v.vulnerability_type,
                "severity": v.severity,
                "line": v.line_number,
                "cwe": v.cwe_id
            }
            for v in latest_findings
        ]
    }
