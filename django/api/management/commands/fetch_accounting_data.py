import uuid
from datetime import datetime
import requests
import json

from api.models import Enterprises
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings


class Command(BaseCommand):
    help = "Get the details of an enterprise"

    def add_arguments(self, parser):
        parser.add_argument("enterprise_number")

    def handle(self, *args, **options):
        enterprise_number = options['enterprise_number']

        # remove dots form the enterprise number
        enterprise_number_wo_dots = enterprise_number.replace(".", "")

        subscription_key = settings.NBB_CBSO_SUBSCRIPTION_KEY

        references_url = f"https://ws.cbso.nbb.be/authentic/legalEntity/{enterprise_number_wo_dots}/references"

        references_headers = {
            'Nbb-Cbso-Subscription-Key': subscription_key,
            'X-Request-Id':  str(uuid.uuid4()),
            'Accept': 'application/json',
            'User-Agent': 'python',
        }

        references_response = requests.get(references_url, headers=references_headers)

        if references_response.status_code != 200:
            raise CommandError(f"Erreur {references_response.status_code}: {references_response.text}")

        references = references_response.json()

        references_with_deposit_date = [ref for ref in references if "DepositDate" in ref]
        most_recent_reference = max(references_with_deposit_date, key=lambda x: datetime.strptime(x["DepositDate"], "%Y-%m-%d"))

        # Extract the AccountingDataURL
        accounting_data_url = most_recent_reference["AccountingDataURL"]

        accounting_data_headers = {
            'Nbb-Cbso-Subscription-Key': subscription_key,
            'X-Request-Id':  str(uuid.uuid4()),
            'Accept': 'application/x.jsonxbrl',
            'User-Agent': 'python',
        }

        accounting_data_response = requests.get(accounting_data_url, headers=accounting_data_headers)

        if accounting_data_response.status_code != 200:
            raise CommandError(f"Erreur {accounting_data_response.status_code}: {accounting_data_response.text}")

        enterprise = Enterprises.objects.get(enterprise_number=enterprise_number)
        enterprise.extra_properties = accounting_data_response.json()
        # todo .save() is not working because nace_other field contains mal formatted data
        # error : psycopg2.errors.InvalidTextRepresentation: malformed array literal: "['46180']"
        enterprise.save(update_fields=['extra_properties'])