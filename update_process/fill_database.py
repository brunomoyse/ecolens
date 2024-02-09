# fill_database.py
from dotenv import load_dotenv
import os
import psycopg2

# Specify the path to your .env file here
dotenv_path = '../.env'

# Load environment variables from the specified .env file
load_dotenv(dotenv_path=dotenv_path)

def fill_financial_reports(enterprise_number, financial_report):
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

        # SQL query to fill the ingestion.financial_reports table
        sql = """
           INSERT INTO ingestion.financial_reports (enterprise_number, raw_data)
            VALUES (%s, %s);
        """

        variables = (enterprise_number, financial_report)

        # Execute the query
        cur.execute(sql, variables)

        # Close communication with the database
        cur.close()

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()
