from mysql.connector import pooling
from dotenv import load_dotenv
import os

load_dotenv()

config = {
    'host': 'localhost',
    'user': os.getenv("DB_USER"),
    'password': os.getenv("DB_PASSWORD"),
    'database': os.getenv("DB_NAME")
}

connection_pool = pooling.MySQLConnectionPool(
    pool_name = 'my_pool',
    pool_size=5, # no of connections in the pool
    **config
)

def get_db_connection():
    return connection_pool.get_connection()