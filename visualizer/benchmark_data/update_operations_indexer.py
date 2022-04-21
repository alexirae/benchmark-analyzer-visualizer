import argparse
import json
import os

from collections import defaultdict

##############################################################################    

def generateIndexerJSON(json_dict, json_file):
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

def generateOperationsIndexer(benchmark_data_path):
    operations = [file for file in os.listdir(benchmark_data_path) if os.path.isdir(os.path.join(benchmark_data_path, file))]
    
    operations_dict = {}
    
    for operation in operations:
        benchmark_results_for_operation = []
        
        operation_dir = os.path.join(benchmark_data_path, operation)
        
        for benchmark_file in os.listdir(os.path.join(benchmark_data_path, operation)):
            if os.path.isfile(os.path.join(operation_dir, benchmark_file)):
                benchmark_file_without_extension = os.path.splitext(benchmark_file)[0]
                benchmark_results_for_operation.append(benchmark_file_without_extension)
        
        operations_dict[operation] = operations_dict[operation] = benchmark_results_for_operation if len(benchmark_results_for_operation) > 0 else ""

    json_dict = {"OPERATIONS" : operations_dict}

    generateIndexerJSON(json_dict, "operations_indexer.json")
    
##############################################################################

def nestedDict():
   return defaultdict(nestedDict)

##############################################################################

def defaultToRegular(d):
    if isinstance(d, defaultdict):
        d = {k: defaultToRegular(v) for k, v in d.items()}
    
    return d

##############################################################################

def getPathDict(paths):
    # From https://stackoverflow.com/questions/58916584/convert-list-of-paths-to-dictionary-in-python
    # with some modifications
    new_path_dict = nestedDict()
    
    for path in paths:
        path_components = path.split(os.sep)

        if path_components == None or len(path_components) == 0:
            continue
        
        # March through the path components
        marcher = new_path_dict
        
        for key in path_components[:-2]:
           marcher = marcher[key]
           
        # Create a list in the leave or append if already exists
        if marcher[path_components[-2]]:
            marcher[path_components[-2]].append(path_components[-1])
        else:
            marcher[path_components[-2]] = [path_components[-1]]

    return defaultToRegular(new_path_dict)

##############################################################################    

def generateProjectIndexer(benchmark_data_path, project):
    # Change current working directory to project directory
    os.chdir(os.path.join(benchmark_data_path, project))
    project_relative_path = os.path.relpath(os.getcwd())
    
    # Collect all benchmark file paths (without extension) in a list
    benchmark_paths = []
    
    for root, subfolders, filenames in os.walk(project_relative_path):
        for filename in filenames:
            if len(root) <= 1:
                continue
            
            filepath = os.path.join(root, filename)
            filepath = os.path.splitext(filepath)[0]
            filepath = os.path.normpath(filepath)

            benchmark_paths.append(filepath)

    project_dict = getPathDict(benchmark_paths)

    # Create indexer with generated benchmark paths dictionary
    os.chdir(benchmark_data_path)
    generateIndexerJSON(project_dict, project + "_indexer.json")
    
##############################################################################    

def generateMultiProjectIndexer(benchmark_data_path):
    # Get projects folder names
    projects = [file for file in os.listdir(benchmark_data_path) if os.path.isdir(os.path.join(benchmark_data_path, file))]

    # Generate an indexer for each project
    for project in projects:
        generateProjectIndexer(benchmark_data_path, project)

    # Create indexer that points to the projects indexers
    operations_dict = {}
    
    for project in projects:
        operations_dict[project] = project + "_indexer.json"

    operations_dict = {"PROJECTS" : operations_dict}
    
    generateIndexerJSON(operations_dict, "operations_indexer.json")

##############################################################################

def runIndexer(kwargs=None):
    # Parse args
    parser = argparse.ArgumentParser(description="Operations Indexer")

    parser.add_argument("-mult_prj", 
                        "--multi_project", 
                        action='store_true',
                        help="(Optional) If used the entry point for the indexer JSON file will be changed to PROJECTS          \
                        (instead of OPERATIONS) and extra indexers will be generated for each folder located in benchmark_data. \
                        Note: the projects folders will need at least one level of nesting in order to be parsed correctly.")

    args = parser.parse_args()

    # Input Params
    multi_project = args.multi_project
    
    benchmark_data_path = os.path.abspath(os.getcwd())
    
    if multi_project:
        generateMultiProjectIndexer(benchmark_data_path)
    else:
        generateOperationsIndexer(benchmark_data_path)

##############################################################################


#-----------------------------------------------------------------------------
# Main
#-----------------------------------------------------------------------------
if __name__ == '__main__':
    runIndexer()
