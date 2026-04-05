from dotenv import load_dotenv
import os

load_dotenv()

class Settings:
    SECRET_KEY = os.getenv("SECRET_KEY")
    ALGORITHM = os.getenv("ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
    _db_url = os.getenv("DATABASE_URL")
    # SQLAlchemy 1.4+ requires postgresql+psycopg2:// for the driver name if using postgresql://
    if _db_url and _db_url.startswith("postgresql://"):
        DATABASE_URL = _db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
    else:
        DATABASE_URL = _db_url
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

settings = Settings()