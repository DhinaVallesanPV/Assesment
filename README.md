# ⚡ TaskFlow — Premium Task Management Application

TaskFlow is a premium, high-performance Task Management Web Application. It consists of a robust **FastAPI (Python)** REST backend and a stunning, responsive **Glassmorphism Single Page Application (SPA)** frontend built with Vanilla HTML, CSS, and JavaScript.

This application is built for high stability, utilizing secure JWT tokens, SQLite database integration, isolated environment variables, automated pagination, and completed state filtering.

---

## 🎨 Premium Features

- 🔐 **Secure Authentication**: Built-in User Registration, User Login, JWT token generation, and industry-standard password hashing using `bcrypt` and `passlib`.
- 📋 **Workspace Tasks Management**: Full task life cycle support: create, view, update completion status, and permanently delete tasks.
- 🛡️ **Strict Access Control**: Users can only access, view, modify, or delete their own data. Deep unit testing enforces cross-user privacy boundaries.
- ⚙️ **Performance Controls**:
  - **Dynamic Pagination**: Adjustable limits (`skip` and `limit` query parameters) implemented on the database query level to prevent loading overhead.
  - **Status Filtering**: Instantly filter between `All`, `Completed`, or `Pending` items (`?completed=true|false` parameters).
- 🚀 **Wow-Factor UI Design**: Beautiful, glowing dark-mode aesthetics using modern glassmorphic surfaces, Harmonious purple accent gradients, micro-animations on actions, profile summaries, and animated Toast feedback alerts.
- 🐳 **Dockerization Ready**: Ready-to-go `Dockerfile` and `docker-compose.yml` for unified, pain-free deployment.
- 🧪 **Self-Contained Testing**: Comprehensive pytest unit and integration test suite operating on an isolated, in-memory database engine (`StaticPool`).

---

## 📂 Project Structure

```text
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py         # App setup, CORS configuration & static mount
│   │   ├── config.py       # Configuration loader from .env
│   │   ├── database.py     # SQLAlchemy DB engine & SessionMaker
│   │   ├── models.py       # SQLite relational mapping schemas (User, Task)
│   │   ├── schemas.py      # Pydantic validation structures
│   │   ├── auth.py         # JWT and password hashing middleware
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py     # Sign up & Login routes
│   │   │   └── tasks.py    # Task CRUD routes with pagination/filtering
│   │   └── tests/
│   │       ├── __init__.py
│   │       └── test_main.py # Pytest integration test cases
│   ├── requirements.txt    # Production packages
│   └── .env.example        # Env configuration blueprint
├── frontend/
│   ├── index.html          # Core SPA Layout
│   ├── styles.css          # Glassmorphic responsive styling
│   └── app.js              # Token engine and async API calls
├── .gitignore
├── Dockerfile              # Multi-tier container build
├── docker-compose.yml      # Orchestrated setup
└── README.md               # Documentation
```

---

## 🛠️ Environment Variables (`.env`)

Before running the application, make sure to define the environment variables. You can copy the template:

```bash
cp backend/.env.example backend/.env
```

The application accepts the following variables:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | SQLAlchemy connection string. | `sqlite:///./tasks.db` |
| `SECRET_KEY` | Hexadecimal secret string used to sign JWT signatures. | *your-secret-key* |
| `ALGORITHM` | Encryption algorithm for token signatures. | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Lifecycle lifespan of a generated login session. | `60` |

---

## 🚀 Running Locally

Follow these quick steps to spin up the application in a few minutes:

### Method 1: Python Virtual Environment (Standard)

1. **Clone & Enter Repo**:
   ```bash
   cd assessment
   ```

2. **Setup Virtual Environment**:
   ```bash
   python -m venv .venv
   ```

3. **Activate Environment**:
   - **Windows (PowerShell)**: `.venv\Scripts\Activate.ps1`
   - **Linux / MacOS**: `source .venv/bin/activate`

4. **Install Dependencies**:
   ```bash
   pip install -r backend/requirements.txt
   pip install "bcrypt==4.0.1"
   ```

5. **Set local .env file**:
   Create a `.env` file under the `backend` folder as described in the blueprint.

6. **Start Server**:
   ```bash
   $env:PYTHONPATH="."  # PowerShell syntax (On Linux: export PYTHONPATH=".")
   uvicorn backend.app.main:app --reload --port 8000
   ```
   *The application will launch on **[http://localhost:8000](http://localhost:8000)**.*
   *The fully interactive OpenAPI Docs will be available at **[http://localhost:8000/docs](http://localhost:8000/docs)**.*

---

### Method 2: Docker / Docker Compose (Fastest)

1. **Launch container**:
   ```bash
   docker compose up --build -d
   ```
2. **Access App**:
   - Open **[http://localhost:8000](http://localhost:8000)** in your browser.

---

## 🧪 Running Unit & Integration Tests

All tests are implemented using `pytest` and target a virtual, isolated in-memory SQLite engine to guarantee pristine test data environment.

1. Ensure your virtual environment is active.
2. Set PYTHONPATH to root and run pytest:
   ```bash
   $env:PYTHONPATH="."
   .venv\Scripts\pytest backend/app/tests/
   ```

---

## 📂 API Reference

### Authentication Endpoints
- `POST /register`: Accepts a JSON payload (`email`, `password`) to create a new user account. Returns `201 Created`.
- `POST /login`: Accepts either JSON payload or Form data (`email/username`, `password`) and signs a secure JWT access token.

### Tasks Endpoints (Requires `Authorization: Bearer <JWT_TOKEN>`)
- `POST /tasks`: Create a new task.
- `GET /tasks`: Retrieve user tasks list.
  - Supports `skip` (defaults to `0`) and `limit` (defaults to `10`) for **database-level pagination**.
  - Supports `completed` query parameter (`true` or `false`) for **completion filtering**.
- `GET /tasks/{id}`: View details of a specific task.
- `PUT /tasks/{id}`: Modify title, description, or toggle completion state of a task.
- `DELETE /tasks/{id}`: Permanently delete a task from the user workspace.

---

## 🌐 Live Deployment Guidelines

### Serving Frontend directly via FastAPI (Unified Deployment)
We have optimized the application so that **FastAPI serves the frontend folder directly** as static files at `/`.
This makes single-service deployments (like **Render**, **Railway**, or **Fly.io**) incredibly straightforward:
1. When deploying, configure the build command to install python requirements.
2. Set the startup command to:
   ```bash
   uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
   ```
3. Set your environment variables in the host dashboard.
4. Your API endpoints, Swagger UI `/docs`, and Glassmorphic SPA Frontend will all run flawlessly on a single service!

---

## 📄 License & Submissions
This project is submitted under the Python Developer Intern assessment rules. Code organization, validation, database security, and responsive layouts have been fully implemented to professional standards.
