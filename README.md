# ⚡ TaskFlow — Premium Task Management Application

TaskFlow is a premium, high-performance Task Management Web Application built to fulfill the Python Developer Intern assessment. It consists of a robust **FastAPI (Python)** REST backend and a stunning, responsive **Glassmorphism Single Page Application (SPA)** frontend built with Vanilla HTML, CSS, and JavaScript.

This application is engineered for maximum performance, clean code structure, absolute database separation, secure JWT authentication, and fluid, responsive UI animations.

---

## 🎨 Features & Functionalities

### 🧱 Robust FastAPI Backend
- **🔐 Secure Authentication**: Includes registration (`POST /register`) and login (`POST /login`) endpoints using `bcrypt` password hashing (`passlib`) and signed **JWT access tokens** (`python-jose`).
- **📋 Task CRUD Engine**: Authenticated users can create, read, update, and permanently delete their own tasks.
- **🛡️ Strict Access Boundaries**: Database-level verification ensures users can only read or edit tasks owned by themselves (`403 Forbidden` verification).
- **⚙️ Performance Controls**:
  - **Dynamic Pagination**: Built-in `skip` and `limit` query parameters at the database layer to avoid high-volume loading overhead.
  - **Completion State Filtering**: Fast status filtering using `?completed=true|false` parameters on requests.
- **🧪 Comprehensive Pytest Suite**: Fully isolated integration tests operating on a temporary in-memory database engine (`StaticPool`) to guarantee no state leaks.

### 🎨 WOW-Factor Frontend UI
- **🔮 Modern Glassmorphic Design**: Clean, beautiful dark-mode styling utilizing glass backdrop filters, subtle neon glows, and professional Google Fonts (`Outfit` & `Inter`).
- **⚡ Reactive SPA State**: Instant form transitions, automatic DOM refreshes, optimistic checkbox completion switches, and dynamic page-by-page rendering.
- **🔔 Animated Toast Alerts**: Sleek, non-intrusive hover alerts for successes, warnings, and error responses.
- **📱 Responsive Layout**: Fully optimized for mobile viewports, tablets, and wide monitors.

---

## 📂 Project Structure

```text
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py         # App config, CORS middlewares & static assets mounting
│   │   ├── config.py       # Configuration settings loader from .env
│   │   ├── database.py     # SQLAlchemy DB connection engine & SessionMaker
│   │   ├── models.py       # SQLite database entities (User, Task)
│   │   ├── schemas.py      # Pydantic validation schemas
│   │   ├── auth.py         # JWT security functions & dependency injection
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py     # Sign up & login route implementations
│   │   │   └── tasks.py    # Paginated & filtered Task CRUD routes
│   │   └── tests/
│   │       ├── __init__.py
│   │       └── test_main.py # Comprehensive pytest test cases
│   ├── requirements.txt    # Backend package dependencies
│   └── .env.example        # Local configuration template
├── frontend/
│   ├── index.html          # Core SPA Layout
│   ├── styles.css          # Glassmorphic custom stylesheet
│   └── app.js              # Token management, active DOM rendering & API calls
├── .gitignore              # Ignored local databases, envs, and cache folders
├── Dockerfile              # Production-ready multi-tier docker configuration
├── docker-compose.yml      # Orchestrated setup composition
├── requirements.txt        # Root-level discoverable package requirements
└── README.md               # Extensive project documentation
```

---

## 🛠️ Environment Variables (`.env`)

Create a `.env` file under the `/backend` folder to configure local properties. You can copy the template directly:
```bash
cp backend/.env.example backend/.env
```

The application consumes the following environment variables:

| Key | Description | Default / Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | Connection URL for database engine | `sqlite:///./tasks.db` |
| `SECRET_KEY` | Secure key for signing JWT signatures | *your-unique-hex-key* |
| `ALGORITHM` | Encryption algorithm for token signatures | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Lifecycle duration of login session tokens | `60` |

---

## 🚀 Running Locally

### Method 1: Local Virtual Environment
1. **Navigate to the Repository**:
   ```bash
   cd assessment
   ```
2. **Setup and Activate Environment**:
   - **Windows (PowerShell)**:
     ```bash
     python -m venv .venv
     .venv\Scripts\Activate.ps1
     ```
   - **Linux / MacOS**:
     ```bash
     python -m venv .venv
     source .venv/bin/activate
     ```
3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
4. **Start the Uvicorn Dev Server**:
   ```bash
   # Set PYTHONPATH to the root directory
   # Windows:
   $env:PYTHONPATH="."
   # Linux / MacOS:
   export PYTHONPATH="."

   uvicorn backend.app.main:app --reload --port 8000
   ```
5. **Access the App**:
   - Open **[http://localhost:8000](http://localhost:8000)** for the Glassmorphic UI.
   - Open **[http://localhost:8000/docs](http://localhost:8000/docs)** to inspect the interactive OpenAPI/Swagger Documentation.

---

### Method 2: Docker Setup
1. **Launch Service Container**:
   ```bash
   docker compose up --build -d
   ```
2. **Access App**:
   - Open **[http://localhost:8000](http://localhost:8000)** in your browser.

---

## 🧪 Running Pytest Test Suite

All integration and boundary safety tests are implemented using `pytest`. They execute on an isolated in-memory SQLite base (`StaticPool`) so your local development database remains untouched.

Ensure your virtual environment is active, then run:
```bash
# Windows
cmd.exe /c "set PYTHONPATH=.&& .venv\Scripts\pytest backend/app/tests/"

# Linux / MacOS
PYTHONPATH=. pytest backend/app/tests/
```

---

## 🌐 Live Deployment Guidelines

### Option A: Render / Railway (Unified Deployment)
Since FastAPI mounts and serves the static frontend folder directly from `/`, you can host the **entire app** under a single web service!
1. Create a Web Service and connect your Git Repository.
2. Choose **Python** as the runtime environment.
3. Configure the build command:
   ```bash
   pip install -r requirements.txt
   ```
4. Set the start command:
   ```bash
   uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
   ```
5. Add your `.env` variables under the environment/config variable dashboard.

### Option B: Vercel (Serverless Deployments)
To deploy the frontend assets separately to **Vercel** and connect them to a hosted backend:
1. In Vercel, select the `/frontend` directory to import.
2. Build command: (Leave blank / Standard Static).
3. Output directory: `.`
4. In your hosted backend, make sure to add your Vercel deployment URL to the CORS `origins` list in [main.py](file:///d:/tech/vscode/assesment'/backend/app/main.py#L23) so authentication requests pass without blockages.
