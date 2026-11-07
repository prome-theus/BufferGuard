from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from backend.app.database.session import Base

class LearningProgress(Base):
    __tablename__ = "learning_progress"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(String(100), unique=True, nullable=False, index=True)
    topic_title = Column(String(255), nullable=False)
    completion_status = Column(Boolean, default=False, nullable=False)
    quiz_score = Column(Integer, default=0, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
