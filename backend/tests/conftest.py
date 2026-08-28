import os

os.environ.setdefault("DATABASE_URL", "sqlite:///./test_threatlens.db")
os.environ.setdefault("CORS_ORIGINS", "http://localhost:5173")

import pytest

from app.db.models import Base
from app.db.session import engine


@pytest.fixture(scope="session", autouse=True)
def database_schema():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
