# Belay ROUTE OS - Django REST Backend

Modern, modular Django REST Framework backend for climbing gym route setting management.

## System Requirements
- Python 3.10+
- pip & venv

## Quick Start (Localhost via VS Code)

1. **Create & Activate Virtual Environment**:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Database Migrations**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. **Create Superuser (Admin)**:
   ```bash
   python manage.py createsuperuser
   ```

5. **Start Django Development Server**:
   ```bash
   python manage.py runserver 8000
   ```

The REST API will be available at: `http://127.0.0.1:8000/api/`
Django Admin Panel: `http://127.0.0.1:8000/admin/`
