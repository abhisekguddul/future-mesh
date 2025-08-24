from app import db, bcrypt
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
import uuid

class User(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # student, alumni, hod, hr, admin, super_admin
    department = db.Column(db.String(100))
    company = db.Column(db.String(100))
    designation = db.Column(db.String(100))
    phone = db.Column(db.String(15))
    profile_image = db.Column(db.String(200))
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Student specific fields
    student_id = db.Column(db.String(20))
    cgpa = db.Column(db.Float)
    graduation_year = db.Column(db.Integer)
    skills = db.Column(db.Text)  # JSON string
    resume_path = db.Column(db.String(200))
    linkedin_url = db.Column(db.String(200))
    github_url = db.Column(db.String(200))
    
    # Alumni specific fields
    experience_years = db.Column(db.Integer)
    current_company = db.Column(db.String(100))
    current_designation = db.Column(db.String(100))
    bio = db.Column(db.Text)
    
    # Relationships
    sent_applications = db.relationship('JobApplication', foreign_keys='JobApplication.student_id', backref='student')
    posted_jobs = db.relationship('Job', foreign_keys='Job.posted_by', backref='poster')
    sent_messages = db.relationship('ChatMessage', foreign_keys='ChatMessage.sender_id', backref='sender')
    received_messages = db.relationship('ChatMessage', foreign_keys='ChatMessage.receiver_id', backref='receiver')
    
    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'role': self.role,
            'department': self.department,
            'company': self.company,
            'designation': self.designation,
            'phone': self.phone,
            'profile_image': self.profile_image,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'student_id': self.student_id,
            'cgpa': self.cgpa,
            'graduation_year': self.graduation_year,
            'skills': self.skills,
            'linkedin_url': self.linkedin_url,
            'github_url': self.github_url,
            'experience_years': self.experience_years,
            'current_company': self.current_company,
            'current_designation': self.current_designation,
            'bio': self.bio
        }

class Job(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(200), nullable=False)
    company = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    requirements = db.Column(db.Text)
    location = db.Column(db.String(100))
    job_type = db.Column(db.String(50))  # full-time, part-time, internship
    salary_min = db.Column(db.Float)
    salary_max = db.Column(db.Float)
    experience_required = db.Column(db.Integer)
    skills_required = db.Column(db.Text)  # JSON string
    min_cgpa = db.Column(db.Float)
    eligible_years = db.Column(db.String(50))  # JSON string of graduation years
    application_deadline = db.Column(db.DateTime)
    posted_by = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected, expired
    approved_by_admin = db.Column(db.String(36), db.ForeignKey('user.id'))
    approved_by_hod = db.Column(db.String(36), db.ForeignKey('user.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    applications = db.relationship('JobApplication', backref='job', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'company': self.company,
            'department': self.department,
            'description': self.description,
            'requirements': self.requirements,
            'location': self.location,
            'job_type': self.job_type,
            'salary_min': self.salary_min,
            'salary_max': self.salary_max,
            'experience_required': self.experience_required,
            'skills_required': self.skills_required,
            'min_cgpa': self.min_cgpa,
            'eligible_years': self.eligible_years,
            'application_deadline': self.application_deadline.isoformat() if self.application_deadline else None,
            'posted_by': self.posted_by,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class JobApplication(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id = db.Column(db.String(36), db.ForeignKey('job.id'), nullable=False)
    student_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    cover_letter = db.Column(db.Text)
    resume_path = db.Column(db.String(200))
    status = db.Column(db.String(20), default='applied')  # applied, shortlisted, interviewed, selected, rejected
    applied_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    shortlisted_by = db.Column(db.String(36), db.ForeignKey('user.id'))
    interview_date = db.Column(db.DateTime)
    interview_notes = db.Column(db.Text)
    feedback = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'job_id': self.job_id,
            'student_id': self.student_id,
            'cover_letter': self.cover_letter,
            'resume_path': self.resume_path,
            'status': self.status,
            'applied_at': self.applied_at.isoformat() if self.applied_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'interview_date': self.interview_date.isoformat() if self.interview_date else None,
            'interview_notes': self.interview_notes,
            'feedback': self.feedback
        }

class ChatMessage(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sender_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    receiver_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    message_type = db.Column(db.String(20), default='text')  # text, file, image
    file_path = db.Column(db.String(200))
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'receiver_id': self.receiver_id,
            'message': self.message,
            'message_type': self.message_type,
            'file_path': self.file_path,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'sender_name': self.sender.first_name + ' ' + self.sender.last_name if self.sender else None
        }

class MentorshipRequest(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    alumni_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, accepted, rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    responded_at = db.Column(db.DateTime)
    response_message = db.Column(db.Text)
    
    student = db.relationship('User', foreign_keys=[student_id], backref='sent_mentorship_requests')
    alumni = db.relationship('User', foreign_keys=[alumni_id], backref='received_mentorship_requests')
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'alumni_id': self.alumni_id,
            'message': self.message,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'responded_at': self.responded_at.isoformat() if self.responded_at else None,
            'response_message': self.response_message,
            'student_name': self.student.first_name + ' ' + self.student.last_name if self.student else None,
            'alumni_name': self.alumni.first_name + ' ' + self.alumni.last_name if self.alumni else None
        }

class Notification(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), nullable=False)  # job_posted, application_update, mentorship_request, etc.
    is_read = db.Column(db.Boolean, default=False)
    action_url = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref='notifications')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'is_read': self.is_read,
            'action_url': self.action_url,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Project(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    technologies = db.Column(db.Text)  # JSON string
    github_url = db.Column(db.String(200))
    demo_url = db.Column(db.String(200))
    image_path = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    student = db.relationship('User', backref='projects')
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'title': self.title,
            'description': self.description,
            'technologies': self.technologies,
            'github_url': self.github_url,
            'demo_url': self.demo_url,
            'image_path': self.image_path,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

def create_default_admin():
    """Create default super admin if not exists"""
    admin = User.query.filter_by(email='admin@futuremesh.com', role='super_admin').first()
    if not admin:
        admin = User(
            email='admin@futuremesh.com',
            first_name='Super',
            last_name='Admin',
            role='super_admin',
            is_verified=True,
            is_active=True
        )
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()
        print("Default super admin created: admin@futuremesh.com / admin123")