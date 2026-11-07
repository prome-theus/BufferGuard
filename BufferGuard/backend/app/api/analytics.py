from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.database.session import get_db
from backend.app.models.scan import Scan, Vulnerability
from backend.app.models.simulation import Simulation

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/overview")
def get_analytics_overview(db: Session = Depends(get_db)):
    # Severity breakdown
    severity_counts = {
        "Critical": db.query(Vulnerability).filter(Vulnerability.severity == "Critical").count(),
        "High": db.query(Vulnerability).filter(Vulnerability.severity == "High").count(),
        "Medium": db.query(Vulnerability).filter(Vulnerability.severity == "Medium").count(),
        "Low": db.query(Vulnerability).filter(Vulnerability.severity == "Low").count(),
        "Informational": db.query(Vulnerability).filter(Vulnerability.severity == "Informational").count()
    }

    # CWE Category breakdown
    cwe_rows = db.query(Vulnerability.cwe_id, func.count(Vulnerability.id)).group_by(Vulnerability.cwe_id).all()
    cwe_breakdown = [{"cwe": r[0], "count": r[1]} for r in cwe_rows]

    # Safe vs Unsafe scans
    total_scans = db.query(Scan).count()
    safe_scans = db.query(Scan).filter(Scan.total_findings == 0).count()
    vulnerable_scans = total_scans - safe_scans

    # Simulations stats
    total_sims = db.query(Simulation).count()
    overflow_sims = db.query(Simulation).filter(Simulation.is_overflow == True).count()
    safe_sims = total_sims - overflow_sims

    return {
        "severity_distribution": severity_counts,
        "cwe_distribution": cwe_breakdown,
        "scans_comparison": {
            "total": total_scans,
            "safe": safe_scans,
            "vulnerable": vulnerable_scans,
            "safe_percentage": round((safe_scans / total_scans * 100), 1) if total_scans > 0 else 100.0
        },
        "simulation_metrics": {
            "total": total_sims,
            "overflow_detected": overflow_sims,
            "safe_bounded": safe_sims
        }
    }

@router.get("/trends")
def get_analytics_trends(db: Session = Depends(get_db)):
    # Recent scans history (last 20)
    scans = db.query(Scan).order_by(Scan.scan_timestamp.asc()).limit(20).all()
    trend_data = [
        {
            "id": s.id,
            "timestamp": s.scan_timestamp.strftime("%m-%d %H:%M"),
            "score": s.security_score,
            "findings": s.total_findings,
            "filename": s.filename
        }
        for s in scans
    ]
    return trend_data
