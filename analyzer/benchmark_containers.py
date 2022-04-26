import json
import os

from datetime import datetime

class BenchmarkStatsContainer:
    def __init__(self):
        self.num_analyzed_samples = 0
        self.minimum              = 0.0
        self.lower_fence          = 0.0
        self.q1                   = 0.0
        self.median               = 0.0
        self.q3                   = 0.0
        self.upper_fence          = 0.0
        self.maximum              = 0.0
        self.iqr                  = 0.0
        self.mean                 = 0.0
        self.std_dev              = 0.0
        self.std_err              = 0.0
        self.std_err_percentage   = 0.0
        self.margin               = 0.0
        self.margin_percentage    = 0.0
        self.confidence_interval  = {}
        self.skewness             = 0.0
        self.kurtosis             = 0.0


class BenchmarkResultsContainer:
    def __init__(self):
        self.operation = ""
        
        self.sorted_lower_outliers_samples = []
        self.sorted_no_outliers_samples    = []
        self.sorted_upper_outliers_samples = []
        
        self.statistics = {"With outliers"    : BenchmarkStatsContainer(),
                           "Without outliers" : BenchmarkStatsContainer()}
    

    def __getFormatedStatisticsResults(self, remove_outliers):
        stats_to_process = self.statistics["Without outliers"] if remove_outliers else self.statistics["With outliers"]
        
        if not remove_outliers:
            total_samples_str = str(stats_to_process.num_analyzed_samples)
        else:
            total_samples_str = str(len(self.sorted_lower_outliers_samples) + stats_to_process.num_analyzed_samples + len(self.sorted_upper_outliers_samples))
            
            num_lower_outliers = len(self.sorted_lower_outliers_samples)
            num_upper_outliers = len(self.sorted_upper_outliers_samples)
            
            num_lower_outliers_str = str(num_lower_outliers)
            num_upper_outliers_str = str(num_upper_outliers)
            num_total_outliers_str = str(num_lower_outliers + num_upper_outliers)
            
            min_lower_outlier_str = str(self.sorted_lower_outliers_samples[0])  if num_lower_outliers > 0 else ""
            max_upper_outlier_str = str(self.sorted_upper_outliers_samples[-1]) if num_upper_outliers > 0 else ""
        
        
        formated_statistics_results = {
            "Operation"                 : self.operation,
            "Num Analyzed Samples"      : str(stats_to_process.num_analyzed_samples) + " (of " + total_samples_str + ")",
            "Outliers removed?"         : ("Yes" if remove_outliers else "No") + ((", " + num_total_outliers_str + " sample(s), " + "Lower outliers (" + num_lower_outliers_str + "): min = " + min_lower_outlier_str + ", Upper outliers (" + num_upper_outliers_str + "): max = " + max_upper_outlier_str) if remove_outliers else ""),
            "Min"                       : "%.3f" % stats_to_process.minimum +     " ms",
            "Lower Fence"               : "%.3f" % stats_to_process.lower_fence + " ms",
            "Q1"                        : "%.3f" % stats_to_process.q1 +          " ms",
            "Median"                    : "%.3f" % stats_to_process.median +      " ms",
            "Q3"                        : "%.3f" % stats_to_process.q3 +          " ms",
            "Upper Fence"               : "%.3f" % stats_to_process.upper_fence + " ms",
            "Max"                       : "%.3f" % stats_to_process.maximum +     " ms",
            "InterQuartile Range (IQR)" : "%.3f" % stats_to_process.iqr +         " ms",
            "Mean"                      : "%.3f" % stats_to_process.mean +        " ms",
            "Standard Deviation"        : "%.3f" % stats_to_process.std_dev +     " ms",
            "Standard Error"            : f'{stats_to_process.std_err:.3f}' + " ms (" + f'{stats_to_process.std_err_percentage:.2f}' + "%)",
            "Margin"                    : f'{stats_to_process.margin:.3f}' + " ms (" + f'{stats_to_process.margin_percentage:.2f}' + "% of Mean)",
            "Confidence Interval"       : "[" + f'{stats_to_process.confidence_interval["ci_lower"]:.3f}' + " ms, " + f'{stats_to_process.confidence_interval["ci_upper"]:.3f}' + " ms] (CI " + str(stats_to_process.confidence_interval["ci_level"]) + "%)",
            "Skewness"                  : "%.2f" % stats_to_process.skewness,
            "Kurtosis"                  : "%.2f" % stats_to_process.kurtosis,
        }
        
        return formated_statistics_results
    
    
    def getFormatedStatisticsResultsWithoutOutliers(self):
        return self.__getFormatedStatisticsResults(remove_outliers=True)
    
    
    def getFormatedStatisticsResultsWithOutliers(self):
        return self.__getFormatedStatisticsResults(remove_outliers=False)
    
    
    def toJSONFile(self, json_output_path, operation, output_file_name):
        benchmark_results_id   = "Benchmark_Results_" + datetime.now().strftime("%b-%d-%Y_%Hh%Mm%Ss") if output_file_name == None else output_file_name
        benchmark_results_dict = {}
        benchmark_results_dict["name"] = benchmark_results_id
        benchmark_results_dict.update(self.__dict__)

        operation_dir_path = os.path.join(json_output_path, operation)
        
        if not os.path.exists(operation_dir_path):
            os.makedirs(operation_dir_path)

        json_file = os.path.join(operation_dir_path, (benchmark_results_id + ".json"))

        # Create new JSON file if it doesn't exist
        if not os.path.exists(json_file):
            with open(json_file, 'w') as file:
                json.dump({}, file)
                
        with open(json_file, 'w') as file:
            json.dump(benchmark_results_dict, 
                      file, 
                      default=lambda o: o.__dict__, 
                      indent=4, 
                      sort_keys=False)
