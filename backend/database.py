"""Database Connection & Session Configuration with Vercel Serverless /tmp support."""
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# On Vercel / AWS Lambda, the only writable filesystem directory is /tmp
if os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"):
    DB_PATH = "/tmp/vision_max_studio.db"
else:
    DB_PATH = os.path.join(os.path.dirname(__file__), "vision_max_studio.db")

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH}")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency injector for database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
