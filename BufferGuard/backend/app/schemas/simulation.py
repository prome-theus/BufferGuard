from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict

class SimulationRequest(BaseModel):
    buffer_size: int = Field(..., ge=1, le=1024, description="Target buffer capacity in bytes")
    input_text: str = Field(..., max_length=2048, description="Input string to simulate copying")
    simulation_mode: str = Field(default="SAFE", description="'SAFE' or 'UNSAFE_CONCEPTUAL'")

class MemoryCell(BaseModel):
    index: int
    char: Optional[str] = None
    byte_hex: Optional[str] = None
    is_in_bounds: bool
    is_null_terminator: bool = False
    is_overflow_attempt: bool = False
    status: str
    address_offset: str

class SimulationResponse(BaseModel):
    id: Optional[int] = None
    buffer_size: int
    input_length: int
    required_bytes_with_null: int
    simulation_mode: str
    result: str
    is_overflow: bool
    excess_bytes: int
    cells: List[MemoryCell]
    explanation: str
    educational_note: str
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)
