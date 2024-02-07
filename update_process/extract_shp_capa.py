from dotenv import load_dotenv
import os
import zipfile
import re
import unicodedata

# Load environment variables from .env file
load_dotenv()

# Directory containing the .zip files
directory = os.getenv('PATH_DOWNLOADED_FILES')

# Directory for the new .zip files
shp_directory = os.getenv('PATH_SHP_PLOTS_FILES')

# Ensure the directory exists
os.makedirs(shp_directory, exist_ok=True)

# Temporary directory for extracting files
extract_dir = os.getenv('PATH_TEMP_FILES')

# Ensure the temporary directory exists
os.makedirs(extract_dir, exist_ok=True)

# Function to normalize and clean a municipality
def clean_string(input_str):
    # Normalize the string to decompose the accented characters
    nfkd_form = unicodedata.normalize('NFKD', input_str)
    # Remove diacritics (accents)
    clean_str = "".join([c for c in nfkd_form if not unicodedata.combining(c)])
    # Replace apostrophes with spaces
    clean_str = clean_str.replace("'", " ")
    # Replace spaces and hyphens with underscores
    clean_str = re.sub(r'[ -]', '_', clean_str)
    return clean_str.lower()

### EXTRACT AND REPACKAGE SHAPEFILES ###

# Loop through all .zip files in the directory
for filename in os.listdir(directory):
    if filename.endswith(".zip"):
        zip_path = os.path.join(directory, filename)
        print(f"Processing {zip_path}...")

        # Extract the .zip file
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)

        # Find files starting with "Bpn_CaPa"
        files_to_zip = []
        for root, dirs, files in os.walk(extract_dir):
            for file in files:
                if file.startswith('Bpn_CaPa'):
                    files_to_zip.append(os.path.join(root, file))

        # Extract the municipality code from the .zip file name
        municipality_name = clean_string(filename.split('_')[-1].replace('.zip', ''))

        # Create a new .zip file with the selected files
        new_zip_filename = f"{municipality_name}.zip"
        new_zip_path = os.path.join(shp_directory, new_zip_filename)
        with zipfile.ZipFile(new_zip_path, 'w') as zip_ref:
            for file in files_to_zip:
                # Adjust the arcname to remove the extracted path
                arcname = os.path.relpath(file, extract_dir)
                zip_ref.write(file, arcname=arcname)

        print(f"Created {new_zip_path} with {len(files_to_zip)} files.")

        # Clean up the extracted files to prepare for the next .zip file
        for root, dirs, files in os.walk(extract_dir, topdown=False):
            for name in files:
                os.remove(os.path.join(root, name))
            for name in dirs:
                os.rmdir(os.path.join(root, name))

print("All .zip files processed.")


