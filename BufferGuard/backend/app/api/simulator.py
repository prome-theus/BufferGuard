from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.simulation import Simulation
from backend.app.schemas.simulation import SimulationRequest, SimulationResponse
from backend.app.services.simulator import BufferSimulator

router = APIRouter(prefix="/api/simulator", tags=["Simulator"])

SIMULATOR_PRESETS = [
    {
        "id": "preset_safe_hello",
        "title": "Bounded Word: 'HELLO' (10-byte buffer)",
        "buffer_size": 10,
        "input_text": "HELLO",
        "mode": "SAFE",
        "description": "5 characters + 1 null terminator fits in 10-byte buffer. Safe operation."
    },
    {
        "id": "preset_overflow_cyber",
        "title": "Buffer Overflow: 'CYBERSECURITY' (10-byte buffer)",
        "buffer_size": 10,
        "input_text": "CYBERSECURITY",
        "mode": "UNSAFE_CONCEPTUAL",
        "description": "13 characters + 1 null terminator requires 14 bytes! 4 bytes overwrite adjacent memory."
    },
    {
        "id": "preset_off_by_one",
        "title": "Off-by-One Boundary: Exactly 8 chars (8-byte buffer)",
        "buffer_size": 8,
        "input_text": "PASSWORD",
        "mode": "UNSAFE_CONCEPTUAL",
        "description": "8 characters require 9 bytes with null terminator. Misses the null terminator by 1 byte."
    },
    {
        "id": "preset_safe_truncation",
        "title": "Safe Bounded Truncation: 'AUTHENTICATE' (8-byte buffer)",
        "buffer_size": 8,
        "input_text": "AUTHENTICATE",
        "mode": "SAFE",
        "description": "Safe mode truncates to 7 characters and guarantees null terminator at position 7."
    }
]

@router.get("/examples")
def get_simulation_presets() -> List[Dict[str, Any]]:
    return SIMULATOR_PRESETS

@router.post("/run", response_model=SimulationResponse)
def run_simulation(payload: SimulationRequest, db: Session = Depends(get_db)):
    result = BufferSimulator.simulate(
        buffer_size=payload.buffer_size,
        input_text=payload.input_text,
        mode=payload.simulation_mode
    )

    # Persist simulation log in database
    sim_record = Simulation(
        buffer_size=payload.buffer_size,
        input_length=result.input_length,
        input_text=payload.input_text,
        simulation_mode=payload.simulation_mode,
        result=result.result,
        is_overflow=result.is_overflow,
        excess_bytes=result.excess_bytes
    )
    db.add(sim_record)
    db.commit()
    db.refresh(sim_record)

    result.id = sim_record.id
    result.created_at = sim_record.created_at
    return result
