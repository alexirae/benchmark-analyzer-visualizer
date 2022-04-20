import argparse
import json
import os

##############################################################################    

def generateOperationsIndexerJSON(json_dict, json_file):
    # Create new JSON file if it doesn't exist
    if not os.path.exists(json_file):
        with open(json_file, 'w') as file:
            json.dump({}, file)
            
    with open(json_file, 'w') as file:
        json.dump(json_dict, 
                  file, 
                  indent=4, 
                  sort_keys=False)

##############################################################################

def runIndexer(kwargs=None):
    # Parse args
    parser = argparse.ArgumentParser(description="Operations Indexer")

    parser.add_argument("-mult_prj", 
                        "--multi_project", 
                        type=bool,
                        required=False,
                        default=False,
                        help="(Optional) If enabled the entry point for the indexer JSON file will be changed to PROJECTS (instead of OPERATIONS).")

    args = parser.parse_args()

    # Input Params
    multi_project = args.multi_project
    
    current_path = os.path.abspath(os.getcwd())

    operations = [file for file in os.listdir(current_path) if os.path.isdir(os.path.join(current_path, file))]
    
    operations_dict = {}
    
    for operation in operations:
        benchmark_results_for_operation = []
        
        for benchmark_file in os.listdir(os.path.join(current_path, operation)):
            benchmark_file_without_extension = os.path.splitext(benchmark_file)[0]
            benchmark_results_for_operation.append(benchmark_file_without_extension)
                               
        operations_dict[operation] = benchmark_results_for_operation
    
    entry_point = "PROJECTS" if multi_project else "OPERATIONS"
    
    json_dict = {}
    json_dict[entry_point] = operations_dict
    
    generateOperationsIndexerJSON(json_dict, "operations_indexer.json")

##############################################################################


#-----------------------------------------------------------------------------
# Main
#-----------------------------------------------------------------------------
if __name__ == '__main__':
    runIndexer()
