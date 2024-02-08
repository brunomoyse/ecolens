from select_enterprises import select_data
from fetch_accounting_data import get_most_recent_data
from fill_database import fill_financial_reports

#enterprise_numbers = select_data()

#enterprise_data = get_most_recent_data(enterprise_numbers[2][0])
enterprise_data = get_most_recent_data('0439312406')
fill_financial_reports('0439312406', enterprise_data)
print('done')

#for enterprise in enterprise_numbers:
    #enterprise_data = get_most_recent_data(enterprise[0])
    #if enterprise_data!=[]:
    #    print(enterprise_data)
    #fill_database(enterprise_data)
