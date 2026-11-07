from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database.session import Base

class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False, default="unnamed.c")
    source_hash = Column(String(64), nullable=False, index=True)
    scan_timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    status = Column(String(50), default="COMPLETED", nullable=False)
    total_findings = Column(Integer, default=0, nullable=False)
    security_score = Column(Float, default=100.0, nullable=False)
    code_content = Column(Text, nullable=False)

    vulnerabilities = relationship("Vulnerability", back_populates="scan", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="scan", cascade="all, delete-orphan")


class Vulnerability(Base):
    __tablename__ = "vulnerabilities"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, index=True)
    vulnerability_type = Column(String(100), nullable=False)
    severity = Column(String(20), nullable=False)  # Critical, High, Medium, Low, Informational
    confidence = Column(String(20), nullable=False) # Confirmed, Potential, Low
    line_number = Column(Integer, nullable=False)
    code_snippet = Column(Text, nullable=True)
    description = Column(Text, nullable=False)
    possible_consequences = Column(Text, nullable=True)
    recommendation = Column(Text, nullable=False)
    safer_code = Column(Text, nullable=True)
    cwe_id = Column(String(50), nullable=False)

    scan = relationship("Scan", back_populates="vulnerabilities")
