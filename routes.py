from flask import request, jsonify, render_template, redirect, url_for, session, send_from_directory
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app import app, db, mail
from models import User, Job, JobApplication, ChatMessage, MentorshipRequest, Notification, Project
from datetime import datetime, timedelta
import json
import os
from flask_mail import Message

# Utility functions
def send_notification(user_id, title, message, notification_type, action_url=None):
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=notification_type,
        action_url=action_url
    )
    db.session.add(notification)
    db.session.commit()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'}

# Frontend Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login')
def login_page():
    return render_template('login.html')

@app.route('/register')
def register_page():
    return render_template('register.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Authentication API Routes
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400
        
        # Create new user
        user = User(
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            role=data['role'],
            department=data.get('department'),
            company=data.get('company'),
            designation=data.get('designation'),
            phone=data.get('phone'),
            student_id=data.get('student_id'),
            cgpa=data.get('cgpa'),
            graduation_year=data.get('graduation_year'),
            experience_years=data.get('experience_years'),
            current_company=data.get('current_company'),
            current_designation=data.get('current_designation')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': 'User registered successfully',
            'access_token': access_token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        user = User.query.filter_by(email=data['email']).first()
        
        if user and user.check_password(data['password']):
            user.last_login = datetime.utcnow()
            db.session.commit()
            
            access_token = create_access_token(identity=user.id)
            
            return jsonify({
                'message': 'Login successful',
                'access_token': access_token,
                'user': user.to_dict()
            }), 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update user fields
        for field in ['first_name', 'last_name', 'department', 'company', 'designation', 
                     'phone', 'cgpa', 'graduation_year', 'skills', 'linkedin_url', 
                     'github_url', 'experience_years', 'current_company', 'current_designation', 'bio']:
            if field in data:
                setattr(user, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Job Management API Routes
@app.route('/api/jobs', methods=['GET'])
@jwt_required()
def get_jobs():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role == 'student':
            # Filter jobs based on student eligibility
            jobs = Job.query.filter_by(status='approved').all()
            eligible_jobs = []
            
            for job in jobs:
                if job.department == user.department:
                    if job.min_cgpa and user.cgpa and user.cgpa >= job.min_cgpa:
                        if job.eligible_years:
                            eligible_years = json.loads(job.eligible_years)
                            if user.graduation_year in eligible_years:
                                eligible_jobs.append(job.to_dict())
                        else:
                            eligible_jobs.append(job.to_dict())
            
            return jsonify({'jobs': eligible_jobs}), 200
            
        elif user.role in ['admin', 'super_admin']:
            jobs = Job.query.all()
            return jsonify({'jobs': [job.to_dict() for job in jobs]}), 200
            
        elif user.role == 'hod':
            jobs = Job.query.filter_by(department=user.department, status='approved').all()
            return jsonify({'jobs': [job.to_dict() for job in jobs]}), 200
            
        elif user.role == 'hr':
            jobs = Job.query.filter_by(posted_by=user_id).all()
            return jsonify({'jobs': [job.to_dict() for job in jobs]}), 200
            
        else:
            return jsonify({'jobs': []}), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/jobs', methods=['POST'])
@jwt_required()
def create_job():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role != 'hr':
            return jsonify({'error': 'Only HR can post jobs'}), 403
        
        data = request.get_json()
        
        job = Job(
            title=data['title'],
            company=data['company'],
            department=data['department'],
            description=data['description'],
            requirements=data.get('requirements'),
            location=data.get('location'),
            job_type=data.get('job_type', 'full-time'),
            salary_min=data.get('salary_min'),
            salary_max=data.get('salary_max'),
            experience_required=data.get('experience_required', 0),
            skills_required=json.dumps(data.get('skills_required', [])),
            min_cgpa=data.get('min_cgpa'),
            eligible_years=json.dumps(data.get('eligible_years', [])),
            application_deadline=datetime.strptime(data['application_deadline'], '%Y-%m-%d') if data.get('application_deadline') else None,
            posted_by=user_id
        )
        
        db.session.add(job)
        db.session.commit()
        
        # Notify admins
        admins = User.query.filter(User.role.in_(['admin', 'super_admin'])).all()
        for admin in admins:
            send_notification(
                admin.id,
                'New Job Posted',
                f'New job "{job.title}" at {job.company} requires approval',
                'job_posted',
                f'/jobs/{job.id}'
            )
        
        return jsonify({
            'message': 'Job posted successfully',
            'job': job.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/jobs/<job_id>/approve', methods=['POST'])
@jwt_required()
def approve_job(job_id):
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role not in ['admin', 'super_admin']:
            return jsonify({'error': 'Only admins can approve jobs'}), 403
        
        job = Job.query.get(job_id)
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        job.status = 'approved'
        job.approved_by_admin = user_id
        db.session.commit()
        
        # Notify HOD
        hod = User.query.filter_by(role='hod', department=job.department).first()
        if hod:
            send_notification(
                hod.id,
                'New Job Approved',
                f'Job "{job.title}" has been approved and forwarded to your department',
                'job_approved',
                f'/jobs/{job.id}'
            )
        
        return jsonify({'message': 'Job approved successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/jobs/<job_id>/apply', methods=['POST'])
@jwt_required()
def apply_job(job_id):
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role != 'student':
            return jsonify({'error': 'Only students can apply for jobs'}), 403
        
        # Check if already applied
        existing_application = JobApplication.query.filter_by(
            job_id=job_id, student_id=user_id
        ).first()
        
        if existing_application:
            return jsonify({'error': 'Already applied for this job'}), 400
        
        data = request.get_json()
        
        application = JobApplication(
            job_id=job_id,
            student_id=user_id,
            cover_letter=data.get('cover_letter')
        )
        
        db.session.add(application)
        db.session.commit()
        
        # Notify HOD
        job = Job.query.get(job_id)
        hod = User.query.filter_by(role='hod', department=job.department).first()
        if hod:
            send_notification(
                hod.id,
                'New Job Application',
                f'{user.first_name} {user.last_name} applied for {job.title}',
                'application_received',
                f'/applications/{application.id}'
            )
        
        return jsonify({
            'message': 'Application submitted successfully',
            'application': application.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Application Management
@app.route('/api/applications', methods=['GET'])
@jwt_required()
def get_applications():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role == 'student':
            applications = JobApplication.query.filter_by(student_id=user_id).all()
        elif user.role == 'hod':
            # Get applications for jobs in HOD's department
            dept_jobs = Job.query.filter_by(department=user.department).all()
            job_ids = [job.id for job in dept_jobs]
            applications = JobApplication.query.filter(JobApplication.job_id.in_(job_ids)).all()
        else:
            applications = JobApplication.query.all()
        
        return jsonify({
            'applications': [app.to_dict() for app in applications]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/applications/<app_id>/shortlist', methods=['POST'])
@jwt_required()
def shortlist_application(app_id):
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role != 'hod':
            return jsonify({'error': 'Only HODs can shortlist applications'}), 403
        
        application = JobApplication.query.get(app_id)
        if not application:
            return jsonify({'error': 'Application not found'}), 404
        
        application.status = 'shortlisted'
        application.shortlisted_by = user_id
        db.session.commit()
        
        # Notify student
        send_notification(
            application.student_id,
            'Application Shortlisted',
            f'Your application for {application.job.title} has been shortlisted',
            'application_update',
            f'/applications/{application.id}'
        )
        
        return jsonify({'message': 'Application shortlisted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Chat and Mentorship
@app.route('/api/alumni', methods=['GET'])
@jwt_required()
def get_alumni():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        alumni = User.query.filter_by(role='alumni', department=user.department).all()
        
        return jsonify({
            'alumni': [alum.to_dict() for alum in alumni]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/mentorship-requests', methods=['POST'])
@jwt_required()
def create_mentorship_request():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role != 'student':
            return jsonify({'error': 'Only students can request mentorship'}), 403
        
        data = request.get_json()
        
        # Check if request already exists
        existing_request = MentorshipRequest.query.filter_by(
            student_id=user_id,
            alumni_id=data['alumni_id'],
            status='pending'
        ).first()
        
        if existing_request:
            return jsonify({'error': 'Mentorship request already pending'}), 400
        
        request_obj = MentorshipRequest(
            student_id=user_id,
            alumni_id=data['alumni_id'],
            message=data['message']
        )
        
        db.session.add(request_obj)
        db.session.commit()
        
        # Notify alumni
        send_notification(
            data['alumni_id'],
            'New Mentorship Request',
            f'{user.first_name} {user.last_name} wants to connect with you',
            'mentorship_request',
            f'/mentorship/{request_obj.id}'
        )
        
        return jsonify({
            'message': 'Mentorship request sent successfully',
            'request': request_obj.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/mentorship-requests', methods=['GET'])
@jwt_required()
def get_mentorship_requests():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role == 'student':
            requests = MentorshipRequest.query.filter_by(student_id=user_id).all()
        elif user.role == 'alumni':
            requests = MentorshipRequest.query.filter_by(alumni_id=user_id).all()
        else:
            requests = MentorshipRequest.query.all()
        
        return jsonify({
            'requests': [req.to_dict() for req in requests]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/mentorship-requests/<req_id>/respond', methods=['POST'])
@jwt_required()
def respond_mentorship_request(req_id):
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        mentorship_request = MentorshipRequest.query.get(req_id)
        if not mentorship_request:
            return jsonify({'error': 'Request not found'}), 404
        
        if mentorship_request.alumni_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        mentorship_request.status = data['status']  # accepted or rejected
        mentorship_request.response_message = data.get('response_message')
        mentorship_request.responded_at = datetime.utcnow()
        
        db.session.commit()
        
        # Notify student
        status_text = 'accepted' if data['status'] == 'accepted' else 'declined'
        send_notification(
            mentorship_request.student_id,
            f'Mentorship Request {status_text.title()}',
            f'Your mentorship request has been {status_text}',
            'mentorship_response',
            f'/mentorship/{mentorship_request.id}'
        )
        
        return jsonify({'message': f'Request {status_text} successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Notifications
@app.route('/api/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    try:
        user_id = get_jwt_identity()
        notifications = Notification.query.filter_by(user_id=user_id).order_by(
            Notification.created_at.desc()
        ).limit(20).all()
        
        return jsonify({
            'notifications': [notif.to_dict() for notif in notifications]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/notifications/<notif_id>/read', methods=['POST'])
@jwt_required()
def mark_notification_read(notif_id):
    try:
        user_id = get_jwt_identity()
        notification = Notification.query.filter_by(id=notif_id, user_id=user_id).first()
        
        if not notification:
            return jsonify({'error': 'Notification not found'}), 404
        
        notification.is_read = True
        db.session.commit()
        
        return jsonify({'message': 'Notification marked as read'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Analytics and Dashboard Data
@app.route('/api/dashboard/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        stats = {}
        
        if user.role == 'super_admin':
            stats = {
                'total_users': User.query.count(),
                'total_students': User.query.filter_by(role='student').count(),
                'total_alumni': User.query.filter_by(role='alumni').count(),
                'total_jobs': Job.query.count(),
                'pending_jobs': Job.query.filter_by(status='pending').count(),
                'total_applications': JobApplication.query.count(),
                'active_chats': ChatMessage.query.filter_by(is_read=False).count()
            }
        elif user.role == 'admin':
            stats = {
                'pending_approvals': Job.query.filter_by(status='pending').count(),
                'total_jobs': Job.query.count(),
                'total_applications': JobApplication.query.count(),
                'active_students': User.query.filter_by(role='student', is_active=True).count()
            }
        elif user.role == 'hod':
            dept_jobs = Job.query.filter_by(department=user.department).all()
            job_ids = [job.id for job in dept_jobs]
            stats = {
                'department_jobs': len(dept_jobs),
                'department_applications': JobApplication.query.filter(JobApplication.job_id.in_(job_ids)).count(),
                'department_students': User.query.filter_by(role='student', department=user.department).count(),
                'pending_shortlists': JobApplication.query.filter(
                    JobApplication.job_id.in_(job_ids),
                    JobApplication.status == 'applied'
                ).count()
            }
        elif user.role == 'student':
            stats = {
                'applications_count': JobApplication.query.filter_by(student_id=user_id).count(),
                'shortlisted_count': JobApplication.query.filter_by(student_id=user_id, status='shortlisted').count(),
                'available_jobs': Job.query.filter_by(department=user.department, status='approved').count(),
                'unread_messages': ChatMessage.query.filter_by(receiver_id=user_id, is_read=False).count()
            }
        elif user.role == 'alumni':
            stats = {
                'mentorship_requests': MentorshipRequest.query.filter_by(alumni_id=user_id, status='pending').count(),
                'active_connections': MentorshipRequest.query.filter_by(alumni_id=user_id, status='accepted').count(),
                'unread_messages': ChatMessage.query.filter_by(receiver_id=user_id, is_read=False).count(),
                'total_students_helped': MentorshipRequest.query.filter_by(alumni_id=user_id, status='accepted').count()
            }
        elif user.role == 'hr':
            stats = {
                'posted_jobs': Job.query.filter_by(posted_by=user_id).count(),
                'approved_jobs': Job.query.filter_by(posted_by=user_id, status='approved').count(),
                'total_applications': JobApplication.query.join(Job).filter(Job.posted_by == user_id).count(),
                'pending_jobs': Job.query.filter_by(posted_by=user_id, status='pending').count()
            }
        
        return jsonify({'stats': stats}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# File Upload
@app.route('/api/upload', methods=['POST'])
@jwt_required()
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        file_type = request.form.get('type', 'general')
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            # Add timestamp to avoid conflicts
            filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
            
            subfolder = 'resumes' if file_type == 'resume' else 'projects'
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], subfolder, filename)
            
            file.save(file_path)
            
            return jsonify({
                'message': 'File uploaded successfully',
                'file_path': f"uploads/{subfolder}/{filename}"
            }), 200
        else:
            return jsonify({'error': 'File type not allowed'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500