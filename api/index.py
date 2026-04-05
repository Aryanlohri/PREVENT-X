import os
import sys

# Add the backend directory to the path so we can import from 'app'
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.main import app

# This is the entry point for Vercel
# The app instance is now available as 'app'
