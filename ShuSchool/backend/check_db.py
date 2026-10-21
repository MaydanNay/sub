import os
from sqlalchemy import create_engine, inspect
from database import SQLALCHEMY_DATABASE_URL

def check_schema():
    print(f"Checking schema for: {SQLALCHEMY_DATABASE_URL}")
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    inspector = inspect(engine)
    
    tables = inspector.get_table_names()
    print(f"Tables in database: {tables}")
    
    for table in tables:
        columns = [c['name'] for c in inspector.get_columns(table)]
        print(f"Table '{table}' columns: {columns}")

if __name__ == "__main__":
    check_schema()
