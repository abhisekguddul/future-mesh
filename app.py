from flask import Flask, render_template, request, jsonify, session, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_mail import Mail, Message
from flask_cors import CORS
from datetime import datetime, timedelta
import os
from werkzeug.utils import secure_filename
import uuid
import json

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = 'futuremesh_secret_key_2024'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///futuremesh.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'futuremesh_jwt_secret_2024'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Email configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'futuremesh@example.com'
app.config['MAIL_PASSWORD'] = 'your_app_password'

# Initialize extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
socketio = SocketIO(app, cors_allowed_origins="*")
mail = Mail(app)
CORS(app)

# Create upload directories
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'resumes'), exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'projects'), exist_ok=True)

# Import routes after app initialization
from routes import *
from models import *
from socket_events import *

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Create default super admin if not exists
        create_default_admin()
    
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)