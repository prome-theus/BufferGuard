from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class QuizQuestion(BaseModel):
    id: int
    question: str
    options: List[str]
    correct_index: int
    explanation: str

class LearningTopic(BaseModel):
    id: str
    title: str
    category: str
    difficulty: str
    summary: str
    content_markdown: str
    c_example_unsafe: Optional[str] = None
    c_example_safe: Optional[str] = None
    quizzes: List[QuizQuestion] = []
    completed: bool = False
    score: int = 0

class ProgressUpdate(BaseModel):
    topic_id: str
    completion_status: bool
    quiz_score: int
