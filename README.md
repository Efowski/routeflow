# RouteFlow

RouteFlow is an **MVP web application for climbing route and route-setting management** designed for climbing gyms.

The application provides a foundation for managing climbing routes, route setters and the lifecycle of routes within a climbing gym.

RouteFlow is built as a full-stack application with a **Django REST Framework backend**, **React + TypeScript frontend**, **PostgreSQL database** and **Docker-based development environment**.

> **Project Status:** MVP – Work in Progress 🚧

## About the Project

Managing routes in a climbing gym involves much more than simply creating new problems and routes.

Gym staff need to keep track of available routes, grades, disciplines, setters, creation dates and eventually decide when routes should be removed or replaced.

RouteFlow aims to provide a centralized system for managing this process.

The current version is an **MVP (Minimum Viable Product)** focused on implementing the core architecture and business logic. More advanced route-setting management and analytics features are planned for future development.

## Current Features

The MVP currently focuses on:

* Climbing route management
* Route details including grade, color and discipline
* Route setter management
* Route lifecycle information
* REST API built with Django REST Framework
* React + TypeScript frontend
* PostgreSQL database
* Dockerized development environment
* Django Admin interface

## Planned Features

Future versions of RouteFlow are planned to include:

* Route-setting planning
* Assigning work to route setters
* Route reset history
* Automatic tracking of route age
* Route popularity analytics
* QR codes for individual routes
* Advanced filtering and searching
* User authentication
* Role-based permissions
* Management dashboard for climbing gym staff

## Tech Stack

### Backend

* Python
* Django
* Django REST Framework
* PostgreSQL

### Frontend

* React
* TypeScript

### Development & Infrastructure

* Docker
* Docker Compose
* Git
* GitHub

## Project Structure

```text id="1n1b1j"
routeflow/
├── backend/          # Django REST Framework backend
├── frontend/         # React + TypeScript frontend
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Quick Start with Docker

### Requirements

Make sure you have installed:

* Docker
* Docker Compose
* Git

Clone the repository:

```bash id="2m74ns"
git clone https://github.com/Efowski/routeflow.git
cd routeflow
```

Start the application and PostgreSQL database:

```bash id="5dtc4k"
docker compose up --build
```

Once the containers are running, the Django API is available at:

```text id="e31h1r"
http://127.0.0.1:8000/api/
```

Django Admin Panel:

```text id="ob5fpv"
http://127.0.0.1:8000/admin/
```

## Backend – Local Development

The Django backend can also be run locally without Docker.

### Requirements

* Python 3.10+
* pip
* venv
* PostgreSQL

Go to the backend directory:

```bash id="9fq4dd"
cd backend
```

Create a virtual environment:

```bash id="6k03we"
python -m venv venv
```

Activate it on Windows:

```bash id="1pp72k"
venv\Scripts\activate
```

On macOS/Linux:

```bash id="jhr1ja"
source venv/bin/activate
```

Install dependencies:

```bash id="1k6ycd"
pip install -r requirements.txt
```

Apply existing database migrations:

```bash id="kyi1qa"
python manage.py migrate
```

Optionally create a Django administrator account:

```bash id="x2yvdb"
python manage.py createsuperuser
```

Start the Django development server:

```bash id="fvp4m5"
python manage.py runserver
```

The API will be available at:

```text id="q6o3fq"
http://127.0.0.1:8000/api/
```

## Database Migrations

When Django models are changed during development, create new migrations:

```bash id="d0vzct"
python manage.py makemigrations
```

Then apply them to the database:

```bash id="xyr3zt"
python manage.py migrate
```

When only starting an existing version of the project, `makemigrations` is normally not required.

## Development Status

RouteFlow is currently an MVP and is being actively developed.

The goal of the current version is to establish the core architecture of the system:

**React frontend → REST API → Django business logic → PostgreSQL database**

Future iterations will focus on expanding the route-setting workflow, analytics and user management functionality.

## Author

Developed by **Efowski**

GitHub: https://github.com/Efowski
