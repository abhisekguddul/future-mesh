# FutureMesh - Enhancing Employability Through Mentorship and Smart Job Matching

![FutureMesh Logo](static/images/logo.png)

## 🚀 Overview

FutureMesh is a cutting-edge EdTech platform designed to revolutionize career development through intelligent mentorship and AI-powered job matching. Our platform connects students, alumni, and industry professionals in a comprehensive ecosystem that enhances employability and accelerates career growth.

## ✨ Features

### 🎯 Core Features
- **Role-Based Dashboards**: Tailored interfaces for Students, Alumni, HODs, HR, Admins, and Super Admins
- **Smart Job Matching**: AI-powered job recommendations based on skills, CGPA, and career goals
- **Real-Time Mentorship**: Integrated chat system connecting students with alumni mentors
- **Application Tracking**: Complete job application workflow with status updates
- **Analytics Dashboard**: Comprehensive insights and reporting for all stakeholders

### 👥 User Roles

#### 🎓 Students
- Personalized job recommendations
- Alumni mentorship network access
- Application status tracking
- Project and resume showcase
- Skill development resources

#### 🎯 Alumni
- Mentorship dashboard
- Student interaction tools
- Career guidance features
- Alumni networking

#### 🏢 HOD (Head of Department)
- Student shortlisting tools
- Department analytics
- Placement tracking
- Performance reports

#### 💼 HR Professionals
- Job posting platform
- Candidate screening tools
- Application management
- Talent analytics

#### ⚙️ Administrators
- Platform management
- User oversight
- System analytics
- Quality control

#### 👑 Super Admin
- Global platform oversight
- Advanced analytics
- System configuration
- Strategic insights

## 🛠️ Technology Stack

### Backend
- **Framework**: Flask 3.0.0
- **Database**: SQLAlchemy with SQLite/PostgreSQL
- **Authentication**: JWT with Flask-JWT-Extended
- **Real-time**: Socket.IO for live chat
- **Email**: Flask-Mail for notifications
- **Security**: Bcrypt for password hashing

### Frontend
- **UI Framework**: Modern HTML5/CSS3/JavaScript
- **Styling**: Custom CSS with CSS Variables and Flexbox/Grid
- **Charts**: Chart.js for analytics visualization
- **Icons**: Font Awesome 6
- **Fonts**: Inter (primary), JetBrains Mono (monospace)

### Key Libraries
- Flask-SocketIO for real-time communication
- Flask-CORS for cross-origin requests
- Werkzeug for utilities
- Pillow for image processing
- Validators for data validation

## 🚀 Installation & Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Git

### Quick Start

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/futuremesh.git
   cd futuremesh
   ```

2. **Create Virtual Environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Setup**
   ```bash
   # Create .env file (optional)
   cp .env.example .env
   # Edit .env with your configurations
   ```

5. **Initialize Database**
   ```bash
   python app.py
   # Database will be created automatically on first run
   ```

6. **Run the Application**
   ```bash
   python app.py
   ```

7. **Access the Platform**
   Open your browser and navigate to `http://localhost:5000`

### Default Admin Credentials
- **Email**: admin@futuremesh.com
- **Password**: admin123

## 📁 Project Structure

```
futuremesh/
├── app.py                 # Main Flask application
├── models.py              # Database models
├── routes.py              # API routes
├── socket_events.py       # Socket.IO event handlers
├── requirements.txt       # Python dependencies
├── README.md             # Project documentation
├── static/               # Static assets
│   ├── css/
│   │   └── main.css      # Main stylesheet
│   ├── js/
│   │   ├── config.js     # Configuration
│   │   ├── utils.js      # Utility functions
│   │   ├── auth.js       # Authentication
│   │   ├── api.js        # API interactions
│   │   ├── notifications.js # Notifications
│   │   ├── chat.js       # Real-time chat
│   │   ├── dashboard.js  # Dashboard functionality
│   │   └── main.js       # Main application
│   ├── images/           # Images and assets
│   └── uploads/          # User uploaded files
├── templates/            # HTML templates
│   ├── base.html         # Base template
│   ├── index.html        # Landing page
│   ├── login.html        # Login page
│   ├── register.html     # Registration page
│   └── dashboard.html    # Dashboard template
└── .gitignore           # Git ignore file
```

## 🎨 Design Features

### Modern UI/UX
- **Dark Theme**: Sleek dark interface with neon accents
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Animations**: Smooth transitions and micro-interactions
- **Typography**: Clean, modern fonts for excellent readability

### Color Palette
- **Primary**: Neon Blue (#00d4ff)
- **Secondary**: Purple (#7c3aed)
- **Success**: Neon Green (#00ff88)
- **Warning**: Orange (#ff6b35)
- **Danger**: Pink (#ff0080)

### Key UI Components
- Glassmorphism cards with blur effects
- Gradient buttons and icons
- Interactive charts and graphs
- Real-time notifications
- Floating chat widget

## 📊 Features Breakdown

### Authentication System
- JWT-based authentication
- Role-based access control
- Password hashing with Bcrypt
- Session management
- Password reset functionality

### Job Management Workflow
1. **HR Posts Job** → Admin Approval Queue
2. **Admin Approves** → Forwarded to HOD
3. **HOD Reviews** → Students Notified
4. **Students Apply** → Application Tracking
5. **HOD Shortlists** → Interview Process

### Real-Time Features
- Live chat between students and alumni
- Real-time notifications
- Live dashboard updates
- Online status indicators
- Typing indicators in chat

### Analytics & Reporting
- User engagement metrics
- Job application statistics
- Department-wise placement data
- Mentorship activity tracking
- Performance analytics

## 🔧 Configuration

### Environment Variables
```bash
FLASK_ENV=development
SECRET_KEY=your_secret_key
DATABASE_URL=sqlite:///futuremesh.db
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_app_password
```

### Database Configuration
The application supports both SQLite (development) and PostgreSQL (production). Database tables are created automatically on first run.

## 🚀 Deployment

### Production Deployment
1. **Set Environment to Production**
   ```bash
   export FLASK_ENV=production
   ```

2. **Use PostgreSQL Database**
   ```bash
   pip install psycopg2-binary
   export DATABASE_URL=postgresql://user:password@localhost/futuremesh
   ```

3. **Use Gunicorn**
   ```bash
   gunicorn app:app -w 4 -b 0.0.0.0:5000
   ```

### Docker Deployment
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["gunicorn", "app:app", "-w", "4", "-b", "0.0.0.0:5000"]
```

## 🧪 Testing

### Running Tests
```bash
# Install test dependencies
pip install pytest pytest-flask

# Run tests
pytest tests/
```

### Test Coverage
```bash
pip install coverage
coverage run -m pytest
coverage report
```

## 📱 Mobile Responsiveness

FutureMesh is fully responsive and works seamlessly across all devices:
- **Desktop**: Full-featured experience with sidebar navigation
- **Tablet**: Optimized layout with collapsible sidebar
- **Mobile**: Mobile-first design with touch-friendly interfaces

## 🔒 Security Features

- **Authentication**: JWT tokens with expiration
- **Authorization**: Role-based access control
- **Password Security**: Bcrypt hashing
- **Input Validation**: Server-side validation for all inputs
- **File Upload Security**: Type and size validation
- **CORS Protection**: Configured for secure cross-origin requests

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint for JavaScript
- Write tests for new features
- Update documentation
- Use semantic commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Project Lead**: [Your Name]
- **Backend Developer**: [Name]
- **Frontend Developer**: [Name]
- **UI/UX Designer**: [Name]

## 📞 Support

For support and questions:
- **Email**: support@futuremesh.com
- **Documentation**: [docs.futuremesh.com](https://docs.futuremesh.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/futuremesh/issues)

## 🗺️ Roadmap

### Version 1.0 ✅
- Core platform functionality
- Role-based dashboards
- Real-time chat
- Job application workflow

### Version 1.1 🚧
- Mobile application
- Advanced analytics
- AI-powered recommendations
- Video calling integration

### Version 2.0 📋
- Machine learning models
- Skill assessment tools
- Company partnerships
- Global expansion

---

**FutureMesh** - Empowering careers through technology and human connection.

Made with ❤️ for the future of education and employment.