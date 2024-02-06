# fill_database.py
from dotenv import load_dotenv
import os
import psycopg2

# Load environment variables from .env file
load_dotenv()

def select_data():
    conn = None
    try:
        # Connect to your database
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST'),
            database=os.getenv('DB_NAME'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            port=os.getenv('DB_PORT')
        )

        # Create a cursor object
        cur = conn.cursor()

        # SQL query
        sql = """
            INSERT INTO sandbox.igretec_enterprises_bnb
            FROM sandbox.igretec_enterprises_bnb
            WHERE LPAD(REPLACE(tva, ' ', ''), 10, '0') = LPAD(REPLACE(tva, ' ', ''), 10, '0')
        """

        # Execute the query
        cur.execute(sql)

        # Close communication with the database
        cur.close()

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()
