import requests
import os
import uuid
import subprocess
import json

from select_enterprises import select_data
from dotenv import load_dotenv
from datetime import datetime

# Specify the path to your .env file here
dotenv_path = '../.env'

# Load environment variables from the specified .env file
load_dotenv(dotenv_path=dotenv_path)

def get_most_recent_data(enterprise_number):
    url = f"https://ws.cbso.nbb.be/authentic/legalEntity/{enterprise_number}/references"
    subscription_key = os.getenv("NBB_CBSO_SUBSCRIPTION_KEY")

    try:
        curl_command = f"""
            curl --location '{url}' \
            --header 'Nbb-Cbso-Subscription-Key: {subscription_key}' \
            --header 'X-Request-Id: {str(uuid.uuid4())}' \
            --header 'Accept: application/json'
            """
        process = subprocess.Popen(curl_command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
        output, error = process.communicate()

        if process.returncode == 0:
            data = json.loads(output)
        else:
            print("Error:", error)

        # If the data is an object and has a key status equals to 404, return an empty array
        if isinstance(data, dict) and data["status"] == 404:
            return []

        # Filter out objects that don't have the "DepositDate" key
        filtered_data = [obj for obj in data if "DepositDate" in obj]

        # Filter and find the object with the most recent deposit date
        most_recent_object = max(filtered_data, key=lambda x: datetime.strptime(x["DepositDate"], "%Y-%m-%d"))

        # Extract the AccountingDataURL
        accounting_data_url = most_recent_object["AccountingDataURL"]

        # Fetch data from AccountingDataURL
        curl_command = f"""
            curl --location '{accounting_data_url}' \
            --header 'Nbb-Cbso-Subscription-Key: {subscription_key}' \
            --header 'X-Request-Id: {str(uuid.uuid4())}' \
            --header 'Accept: application/x.jsonxbrl'
            """
        process = subprocess.Popen(curl_command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
        output, error = process.communicate()

        if process.returncode == 0:
            accounting_response = json.loads(output)
        else:
            print("Error:", error)

        return json.dumps(accounting_response)

    except requests.RequestException as e:
        print(f"Error: {e}")
