import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.main import app
from backend.app.database import Base, get_db
from backend.app.models import User, Task


from sqlalchemy.pool import StaticPool

# 1. Setup in-memory database for isolated testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def run_around_tests():
    # Setup: Create tables
    Base.metadata.create_all(bind=engine)
    yield
    # Teardown: Drop tables
    Base.metadata.drop_all(bind=engine)


# 2. Helper function to register and login a test user
def register_and_login(email: str, password: str):
    # Register
    client.post(
        "/register",
        json={"email": email, "password": password}
    )
    # Login
    response = client.post(
        "/login",
        json={"email": email, "password": password}
    )
    return response.json()["access_token"]


# 3. Test Cases

def test_user_registration():
    response = client.post(
        "/register",
        json={"email": "test@example.com", "password": "securepassword"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data

    # Test duplicate registration
    response = client.post(
        "/register",
        json={"email": "test@example.com", "password": "anotherpassword"}
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_user_login():
    # Register user first
    client.post(
        "/register",
        json={"email": "login@example.com", "password": "mypassword"}
    )

    # Success login
    response = client.post(
        "/login",
        json={"email": "login@example.com", "password": "mypassword"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

    # Failed login (wrong password)
    response = client.post(
        "/login",
        json={"email": "login@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401


def test_create_task():
    token = register_and_login("task@example.com", "taskpassword")
    headers = {"Authorization": f"Bearer {token}"}

    response = client.post(
        "/tasks",
        json={"title": "My first task", "description": "Finish coding", "completed": False},
        headers=headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "My first task"
    assert data["description"] == "Finish coding"
    assert data["completed"] is False
    assert "id" in data


def test_read_tasks():
    token = register_and_login("read@example.com", "readpassword")
    headers = {"Authorization": f"Bearer {token}"}

    # Create 3 tasks (2 incomplete, 1 completed)
    client.post("/tasks", json={"title": "Task 1", "description": "Desc 1", "completed": False}, headers=headers)
    client.post("/tasks", json={"title": "Task 2", "description": "Desc 2", "completed": True}, headers=headers)
    client.post("/tasks", json={"title": "Task 3", "description": "Desc 3", "completed": False}, headers=headers)

    # Read all tasks
    response = client.get("/tasks", headers=headers)
    assert response.status_code == 200
    tasks = response.json()
    assert len(tasks) == 3

    # Test filtering ?completed=true
    response = client.get("/tasks?completed=true", headers=headers)
    tasks_completed = response.json()
    assert len(tasks_completed) == 1
    assert tasks_completed[0]["title"] == "Task 2"

    # Test filtering ?completed=false
    response = client.get("/tasks?completed=false", headers=headers)
    tasks_incomplete = response.json()
    assert len(tasks_incomplete) == 2

    # Test pagination (skip=1, limit=1)
    response = client.get("/tasks?skip=1&limit=1", headers=headers)
    paginated_tasks = response.json()
    assert len(paginated_tasks) == 1


def test_task_authorization_boundaries():
    # User 1 registers, logins, and creates a task
    token1 = register_and_login("user1@example.com", "password123")
    headers1 = {"Authorization": f"Bearer {token1}"}
    create_resp = client.post("/tasks", json={"title": "Secret Task"}, headers=headers1)
    task_id = create_resp.json()["id"]

    # User 2 registers and logins
    token2 = register_and_login("user2@example.com", "password123")
    headers2 = {"Authorization": f"Bearer {token2}"}

    # User 2 tries to read User 1's task
    get_resp = client.get(f"/tasks/{task_id}", headers=headers2)
    assert get_resp.status_code == 403

    # User 2 tries to update User 1's task
    put_resp = client.put(f"/tasks/{task_id}", json={"completed": True}, headers=headers2)
    assert put_resp.status_code == 403

    # User 2 tries to delete User 1's task
    del_resp = client.delete(f"/tasks/{task_id}", headers=headers2)
    assert del_resp.status_code == 403


def test_update_and_delete_task():
    token = register_and_login("update@example.com", "password123")
    headers = {"Authorization": f"Bearer {token}"}

    # Create task
    task = client.post("/tasks", json={"title": "To be modified", "completed": False}, headers=headers).json()
    task_id = task["id"]

    # Update (mark completed)
    update_resp = client.put(f"/tasks/{task_id}", json={"completed": True}, headers=headers)
    assert update_resp.status_code == 200
    assert update_resp.json()["completed"] is True

    # Delete task
    delete_resp = client.delete(f"/tasks/{task_id}", headers=headers)
    assert delete_resp.status_code == 204

    # Ensure it's gone
    get_resp = client.get(f"/tasks/{task_id}", headers=headers)
    assert get_resp.status_code == 404
