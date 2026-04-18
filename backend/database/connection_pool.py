from mysql.connector import pooling
from dotenv import load_dotenv
import os

load_dotenv()

config = {
    'host': os.getenv("DB_HOST"),
    'user': os.getenv("DB_USER"),
    'password': os.getenv("DB_PASSWORD"),
    'database': os.getenv("DB_NAME"),
    'port': os.getenv("DB_PORT")
}

connection_pool = pooling.MySQLConnectionPool(
    pool_name = 'my_pool',
    pool_size=5, # no of connections in the pool
    **config
)

def get_db_connection():
    return connection_pool.get_connection()