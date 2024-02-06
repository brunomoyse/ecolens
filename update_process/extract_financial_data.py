from select_enterprises import select_data
from fetch_accounting_data import get_most_recent_data

# Example usage
enterprise_numbers = select_data()

enterprise_data = get_most_recent_data(enterprise_numbers[2][0])

print(enterprise_data)

#for enterprise in enterprise_numbers:
    #enterprise_data = get_most_recent_data(enterprise[0])
    #if enterprise_data!=[]:
    #    print(enterprise_data)
    #fill_database(enterprise_data)