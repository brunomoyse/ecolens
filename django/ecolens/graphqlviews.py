import json
import csv
from graphene_django.views import GraphQLView
import pandas as pd
from graphql import GraphQLError
from django.http import HttpResponse


class CSVGraphQLView(GraphQLView):
    def dispatch(self, request, *args, **kwargs):
        response = super(CSVGraphQLView, self).dispatch(request, *args, **kwargs)
        try:
            data = json.loads(response.content.decode('utf-8'))
            if 'csv' in data['data']:
                data['data'].pop('csv')
                if len(list(data['data'].keys())) == 1:
                    model = list(data['data'].keys())[0]
                else:
                    raise GraphQLError("can not export to csv")

                print(data)

                data = pd.json_normalize(data['data'][model])
                response = HttpResponse(content_type='text/csv')
                response['Content-Disposition'] = 'attachment; filename="output.csv"'

                writer = csv.writer(response)
                writer.writerow(data.columns)
                for value in data.values:
                    writer.writerow(value)
        except GraphQLError as e:
            raise e
        except Exception:
            pass
        return response
