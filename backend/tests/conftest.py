import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import Base, get_db

engine = create_engine("sqlite:///./test.db", connect_args={"check_same_thread": False})
Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_db():
    db = Session()
    try: yield db
    finally: db.close()

@pytest.fixture(scope="module")
def client():
    Base.metadata.create_all(bind=engine)
    app.dependency_overrides[get_db] = override_db
    with TestClient(app) as c: yield c
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()
