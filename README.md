# Developer App (DevHub)

A full-stack web application designed for developers, featuring tools to manage snippets, tasks, notes, and test APIs.

## Architecture

* **Frontend**: React + Vite
* **Backend**: FastAPI (Python)

## Features

* **Snippets Manager**: Save, organize, and retrieve code snippets with language tags.
* **Task Tracker**: Keep track of your to-dos with priorities and statuses.
* **Notes**: Jot down ideas and documentation.
* **API Tester**: A built-in tool to test REST API endpoints (similar to Postman/Insomnia).

## Prerequisites

* [Node.js](https://nodejs.org/) (for the frontend)
* [Python 3.8+](https://www.python.org/) (for the backend)

## Getting Started

### 1. Starting the Backend

The backend is built with FastAPI and runs on `http://localhost:8000`.

**Using the provided script (Windows):**
```powershell
.\start-backend.ps1
```

**Manual setup:**
```bash
cd backend
python -m venv venv

# Activate venv (Windows)
.\venv\Scripts\activate
# Activate venv (Mac/Linux)
source venv/bin/activate

pip install -r requirements.txt
python main.py
```

### 2. Starting the Frontend

The frontend is a React application powered by Vite.

**Using the provided script (Windows):**
```powershell
.\start-frontend.ps1
```

**Manual setup:**
```bash
cd frontend
npm install
npm run dev
```

## API Documentation

Once the backend is running, you can view the interactive API documentation (Swagger UI) at:
[http://localhost:8000/docs](http://localhost:8000/docs)
