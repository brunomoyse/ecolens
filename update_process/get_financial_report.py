from dotenv import load_dotenv
import os
import psycopg2
import json

# Specify the path to your .env file here
dotenv_path = '../.env'

# Load environment variables from the specified .env file
load_dotenv(dotenv_path=dotenv_path)

def get_financial_report(enterprise_number):
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
        SELECT raw_data FROM ingestion.financial_reports
        WHERE enterprise_number = %s
        LIMIT 1;
        """


        variables = (enterprise_number,)

        # Execute the query
        cur.execute(sql, variables)

        # Fetch the record
        records = cur.fetchone()

        # Close communication with the database
        cur.close()

        record = records[0]

        return record

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()





