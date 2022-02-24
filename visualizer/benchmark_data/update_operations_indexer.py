import json
import os

##############################################################################    

def generateOperationsIndexerJSON(operations_dict, json_file):
    # Create new JSON file if it doesn't exist
    if not os.path.exists(json_file):
        with open(json_file, 'w') as file:
            json.dump({}, file)
            
    with open(json_file, 'w') as file:
        json.dump(operations_dict, 
                  file, 
                  indent=4, 
                  sort_keys=False)

##############################################################################


#-----------------------------------------------------------------------------
# Main
#-----------------------------------------------------------------------------
current_path = os.path.abspath(os.getcwd())

operations = [file for file in os.listdir(current_path) if os.path.isdir(os.path.join(current_path, file))]

operations_dict = {}

for operation in operations:
    benchmark_results_for_operation = []
    
    for benchmark_file in os.listdir(os.path.join(current_path, operation)):
        benchmark_file_without_extension = os.path.splitext(benchmark_file)[0]
        benchmark_results_for_operation.append(benchmark_file_without_extension)
                           
    operations_dict[operation] = benchmark_results_for_operation

generateOperationsIndexerJSON(operations_dict, "operations_indexer.json")
