from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy import LargeBinary
import pickle
import pytz

ist = pytz.timezone("Asia/Kolkata")

db = SQLAlchemy()

# Define User Model
class User(db.Model):
    __bind_key__ = 'users'  # Bind this model to users.db
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)

class Exam(db.Model):
    __bind_key__ = 'exams'
    __tablename__ = 'exam'
    id = db.Column(db.Integer, primary_key=True)
    assessment_id = db.Column(db.String(10), unique=True, nullable=False)
    title = db.Column(db.String(200), nullable=False)
    filename = db.Column(db.String(255), nullable=False)  # Store uploaded file name
    date = db.Column(db.String(20), nullable=False)
    time = db.Column(db.String(20), nullable=False)
    duration = db.Column(db.Integer, nullable=False)
    expiry = db.Column(db.DateTime, nullable=False)  # Expiry timestamp
    created_date = db.Column(db.DateTime, default=datetime.now(ist))
    created_by = db.Column(db.String(100), nullable=False)
    exam_status = db.Column(db.String(50), nullable=False)


class ExamFiles(db.Model):
    __bind_key__ = 'exams'
    __tablename__ = 'exam_files' 
    id = db.Column(db.Integer, primary_key=True)
    assessment_id = db.Column(db.String(10), db.ForeignKey('exam.assessment_id'), nullable=False)
    question_paper = db.Column(LargeBinary, nullable=False)  # Store file as binary data
    filename = db.Column(db.String(255), nullable=False)

class ExamAttendees(db.Model):
    __bind_key__ = 'exams'
    __tablename__ = 'exam_attendees'
    id = db.Column(db.Integer, primary_key=True)
    assessment_id = db.Column(db.String(10), db.ForeignKey('exam.assessment_id'), nullable=False)
    attendee_name = db.Column(db.String(100), nullable=False)
    face_image = db.Column(db.LargeBinary, nullable=False)  # Store original image
    # Store face embeddings using PickleType
    face_embedding = db.Column(db.PickleType, nullable=True)

    def set_embedding(self, embedding):
        """Store NumPy array as a serialized object."""
        self.face_embedding = pickle.dumps(embedding)

    def get_embedding(self):
        """Retrieve NumPy array from a serialized object."""
        return pickle.loads(self.face_embedding) if self.face_embedding else None


class Question(db.Model):
    __bind_key__ = 'questions'  #Ensures this model uses PostgreSQL
    id = db.Column(db.Integer, primary_key=True)
    assessment_id = db.Column(db.Integer, nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    question_type = db.Column(db.String(20), nullable=False)  # 'mcq', 'text', 'fill_blank'
    options = db.Column(db.JSON)  # Stores MCQ options in JSON format
    correct_answer = db.Column(db.Text, nullable=False)
    image = db.Column(db.LargeBinary)  # Stores question image as binary (BLOB)
    created_at = db.Column(db.TIMESTAMP, server_default=db.func.now())

