from sqlalchemy import create_engine, inspect
from database import engine

inspector = inspect(engine)
columns = inspector.get_columns('characters')
for column in columns:
    print(column['name'])
