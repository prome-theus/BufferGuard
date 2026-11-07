from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class ReportCreate(BaseModel):
    scan_id: int
    report_type: str = "PDF"

class ReportResponse(BaseModel):
    id: int
    scan_id: int
    report_type: str
    generated_at: datetime
    file_path: str
    model_config = ConfigDict(from_attributes=True)
