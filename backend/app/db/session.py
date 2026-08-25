from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./cyber_threat.db")

# Fallback to local SQLite database if Postgres is unreachable or sqlite is specified
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    try:
        # Try creating Postgres engine
        engine = create_engine(DATABASE_URL)
        # Attempt a quick connection to check if it's reachable
        conn = engine.connect()
        conn.close()
    except Exception as e:
        print(f"PostgreSQL connection failed ({e}). Falling back to local SQLite database.")
        DATABASE_URL = "sqlite:///./cyber_threat.db"
        engine = create_engine(
            DATABASE_URL, connect_args={"check_same_thread": False}
        )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()