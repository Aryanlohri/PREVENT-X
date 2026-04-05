from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create engine with cloud-optimized connection pooling
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True, # Recommended for cloud DBs (Neon/Vercel) to avoid connection dropped errors
)

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Dependency for FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()