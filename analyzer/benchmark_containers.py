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
            "Min"                       : "{:.5f} ms".format(stats_to_process.minimum),
            "Lower Fence"               : "{:.5f} ms".format(stats_to_process.lower_fence),
            "Q1"                        : "{:.5f} ms".format(stats_to_process.q1),
            "Median"                    : "{:.5f} ms".format(stats_to_process.median),
            "Q3"                        : "{:.5f} ms".format(stats_to_process.q3),
            "Upper Fence"               : "{:.5f} ms".format(stats_to_process.upper_fence),
            "Max"                       : "{:.5f} ms".format(stats_to_process.maximum),
            "InterQuartile Range (IQR)" : "{:.5f} ms".format(stats_to_process.iqr),
            "Mean"                      : "{:.5f} ms".format(stats_to_process.mean),
            "Standard Deviation"        : "{:.5f} ms".format(stats_to_process.std_dev),
            "Standard Error"            : "{:.5f} ms ({:.5f}%)".format(stats_to_process.std_err, stats_to_process.std_err_percentage),
            "Margin"                    : "{:.5f} ms ({:.5f}% of Mean)".format(stats_to_process.margin, stats_to_process.margin_percentage),
            "Confidence Interval"       : "[{:.5f} ms, {:.5f} ms] (CI {}%)".format(stats_to_process.confidence_interval["ci_lower"], stats_to_process.confidence_interval["ci_upper"], stats_to_process.confidence_interval["ci_level"]),
            "Skewness"                  : "{:.5f}".format(stats_to_process.skewness),
            "Kurtosis"                  : "{:.5f}".format(stats_to_process.kurtosis),
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

        if not os.path.exists(json_output_path):
            os.makedirs(json_output_path)
            
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
            
            file.write('\n')
