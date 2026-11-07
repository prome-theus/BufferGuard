from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict

class VulnerabilityBase(BaseModel):
    vulnerability_type: str
    severity: str
    confidence: str
    line_number: int
    code_snippet: Optional[str] = None
    description: str
    possible_consequences: Optional[str] = None
    recommendation: str
    safer_code: Optional[str] = None
    cwe_id: str

class VulnerabilityResponse(VulnerabilityBase):
    id: int
    scan_id: int
    model_config = ConfigDict(from_attributes=True)

class ScanRequest(BaseModel):
    filename: Optional[str] = Field(default="program.c")
    code: str = Field(..., min_length=1, max_length=500000, description="C source code to analyze")

class ScanResponse(BaseModel):
    id: int
    filename: str
    source_hash: str
    scan_timestamp: datetime
    status: str
    total_findings: int
    security_score: float
    code_content: str
    vulnerabilities: List[VulnerabilityResponse] = []
    model_config = ConfigDict(from_attributes=True)

class ScanSummaryItem(BaseModel):
    id: int
    filename: str
    scan_timestamp: datetime
    status: str
    total_findings: int
    security_score: float
    model_config = ConfigDict(from_attributes=True)
