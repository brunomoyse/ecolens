# select_enterprises.py
from dotenv import load_dotenv
import os
import psycopg2

# Specify the path to your .env file here
dotenv_path = '../.env'

# Load environment variables from the specified .env file
load_dotenv(dotenv_path=dotenv_path)

def select_data():
    conn = None
    try:
        # Connect to your database
        conn = psycopg2.connect(
            host=os.getenv('POSTGRES_HOST'),
            database=os.getenv('POSTGRES_DB'),
            user=os.getenv('POSTGRES_USER'),
            password=os.getenv('POSTGRES_PASSWORD'),
            port=os.getenv('POSTGRES_PORT')
        )

        # Create a cursor object
        cur = conn.cursor()

        # SQL query
        sql = "SELECT LPAD(REPLACE(tva, ' ', ''), 10, '0') FROM sandbox.igretec_enterprises_bnb WHERE tva IS NOT NULL"

        # Execute the query
        cur.execute(sql)

        # Fetch all records
        records = cur.fetchall()

        # Close communication with the database
        cur.close()

        # Return the fetched records
        return records

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()
