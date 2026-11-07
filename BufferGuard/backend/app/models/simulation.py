from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from backend.app.database.session import Base

class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True, index=True)
    buffer_size = Column(Integer, nullable=False)
    input_length = Column(Integer, nullable=False)
    input_text = Column(Text, nullable=False)
    simulation_mode = Column(String(50), nullable=False) # "SAFE" or "UNSAFE_CONCEPTUAL"
    result = Column(String(50), nullable=False) # "SAFE_BOUNDED", "OVERFLOW_DETECTED", "TRUNCATED"
    is_overflow = Column(Boolean, default=False, nullable=False)
    excess_bytes = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
