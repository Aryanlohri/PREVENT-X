import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "preventx.db")

if not os.path.exists(db_path):
    print("DB not found at", db_path)
else:
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    try:
        c.execute("ALTER TABLE users ADD COLUMN age INTEGER")
        c.execute("ALTER TABLE users ADD COLUMN gender VARCHAR")
        c.execute("ALTER TABLE users ADD COLUMN height INTEGER")
        c.execute("ALTER TABLE users ADD COLUMN weight INTEGER")
        conn.commit()
        print("Columns added successfully.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()
