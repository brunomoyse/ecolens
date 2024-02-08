import psycopg2
import os
import subprocess
import zipfile
import unicodedata

from dotenv import load_dotenv


# Load environment variables from .env file
load_dotenv()

# Directory containing the .zip files with shapefiles
zip_directory = os.getenv('PATH_SHP_PLOTS_FILES')

# Temporary directory for extracting .zip files
temp_extract_dir = os.getenv('PATH_TEMP_FILES')

# PostgreSQL connection parameters
db_host = os.getenv('POSTGRES_HOST')
db_port = os.getenv('POSTGRES_PORT')
database_name = os.getenv('POSTGRES_DB')
user_name = os.getenv('POSTGRES_USER')
password = os.getenv('POSTGRES_PASSWORD')
schema_name = "plots"
srid = "31370"

# Ensure the temporary directory exists
if not os.path.exists(temp_extract_dir):
    os.makedirs(temp_extract_dir)

def remove_accents(input_str):
    nfkd_form = unicodedata.normalize('NFKD', input_str)
    return "".join([c for c in nfkd_form if not unicodedata.combining(c)])

# Function to run shell commands
def run_command(command):
    print(f"Executing command: {command}")
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if result.stderr:
        print(f"Error: {result.stderr}")
    if result.stdout:
        print(f"Output: {result.stdout}")

# Function to process .zip file and import its shapefiles into a single PostGIS table
def process_zip_file(zip_path):
    # Determine table name from .zip file name
    zip_filename = os.path.basename(zip_path)
    base_table_name = os.path.splitext(zip_filename)[0].lower().replace('-', '_')  # Normalize table name
    base_table_name = remove_accents(base_table_name)
    table_name = f"{schema_name}.{base_table_name}"

    # Extract the .zip file
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(temp_extract_dir)

    # Initialize a flag to indicate the first shapefile (for dropping/creating the table)
    first_shapefile = True

    # Process each shapefile in the extracted folder
    for root, dirs, files in os.walk(temp_extract_dir):
        for filename in files:
            if filename.endswith(".shp"):
                shapefile_path = os.path.join(root, filename)
                # Use -d to drop and recreate the table for the first shapefile
                # Subsequent shapefiles will append to the table using -a
                cmd_flag = "-d" if first_shapefile else "-a"
                first_shapefile = False  # Update flag after processing the first shapefile
                conn_string = f"host={db_host} port={db_port} dbname={database_name} user={user_name}"
                cmd = f"shp2pgsql {cmd_flag} -s {srid} '{shapefile_path}' {table_name} | PGPASSWORD='{password}' psql '{conn_string}'"
                print(f"Processing {shapefile_path} into table {table_name}...")
                run_command(cmd)

    # Clean up extracted files after processing
    for root, dirs, files in os.walk(temp_extract_dir, topdown=False):
        for name in files:
            os.remove(os.path.join(root, name))
        for name in dirs:
            os.rmdir(os.path.join(root, name))

# Loop through all .zip files in the directory
for zip_filename in os.listdir(zip_directory):
    if zip_filename.endswith(".zip"):
        zip_path = os.path.join(zip_directory, zip_filename)
        print(f"Processing {zip_path}...")
        process_zip_file(zip_path)

print("All .zip files processed.")
