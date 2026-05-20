import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from backend.app.database import engine, Base
from backend.app.routers import auth, tasks

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Task Manager API",
    description="A robust and secure FastAPI backend for managing personal tasks.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS Middleware
# Allows frontend applications running on other origins (like localhost:5500 or live urls) to interact with the API
origins = [
    "http://localhost",
    "http://localhost:8000",
    "http://localhost:5000",
    "http://localhost:3000",
    "http://127.0.0.1:5500", # Live Server
    "*", # Allow all for ease of deployment/testing
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development/testing, allow all. Change for production as needed.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router)
app.include_router(tasks.router)

# Health Check / API Status endpoint
@app.get("/api/health", tags=["System"])
def health_check():
    return JSONResponse(
        status_code=200,
        content={"status": "healthy", "message": "Task Manager API is running smoothly!"}
    )

# Serve Frontend static files (HTML, CSS, JS) at the root URL
# This enables single-service deployment where the backend serves the frontend.
# We ensure this doesn't shadow the API or docs endpoints.
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend"))

if os.path.exists(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")
else:
    @app.get("/")
    def read_root():
        return {
            "message": "Welcome to the Task Manager API! Frontend directory not found.",
            "docs": "/docs"
        }
