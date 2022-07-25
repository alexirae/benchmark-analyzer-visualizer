import argparse

import numpy as np

from benchmark_statistics import Statistics
from benchmark_containers import BenchmarkResultsContainer


##############################################################################

def createBenchmarkResults(benchmark_samples, operation):
    benchmark_results = BenchmarkResultsContainer()
    
    benchmark_results.operation = operation
    
    # Filter outliers
    lower_fence, upper_fence = Statistics.getTukeyFences(benchmark_samples)
    
    lower_outliers_samples        = benchmark_samples[benchmark_samples < lower_fence]
    benchmark_no_outliers_samples = benchmark_samples[(benchmark_samples >= lower_fence) & (benchmark_samples <= upper_fence)]
    upper_outliers_samples        = benchmark_samples[benchmark_samples > upper_fence]
    
    benchmark_results.sorted_lower_outliers_samples = np.sort(lower_outliers_samples).tolist()
    benchmark_results.sorted_no_outliers_samples    = np.sort(benchmark_no_outliers_samples).tolist()
    benchmark_results.sorted_upper_outliers_samples = np.sort(upper_outliers_samples).tolist()

    # Create statistics info from benchmark samples
    for key in benchmark_results.statistics:
        without_outliers = key == "Without outliers"
        
        benchmark_samples_to_process = benchmark_no_outliers_samples if without_outliers else benchmark_samples
        
        benchmark_stats = benchmark_results.statistics[key]

        benchmark_stats.num_analyzed_samples = Statistics.getNumAnalyzedSamples(benchmark_samples_to_process)
        benchmark_stats.minimum              = Statistics.getMin(benchmark_samples_to_process)
        benchmark_stats.lower_fence          = benchmark_results.sorted_no_outliers_samples[0]  # Plotly uses first non outlier point, for exact lower_fence set to: lower_fence
        benchmark_stats.q1                   = Statistics.getPercentile(benchmark_samples_to_process, 25)
        benchmark_stats.mean                 = Statistics.getMean(benchmark_samples_to_process)
        benchmark_stats.median               = Statistics.getPercentile(benchmark_samples_to_process, 50)
        benchmark_stats.q3                   = Statistics.getPercentile(benchmark_samples_to_process, 75)
        benchmark_stats.upper_fence          = benchmark_results.sorted_no_outliers_samples[-1] # Plotly uses last  non outlier point, for exact upper_fence set to: upper_fence
        benchmark_stats.maximum              = Statistics.getMax(benchmark_samples_to_process)
        benchmark_stats.iqr                  = Statistics.getIQR(benchmark_samples_to_process)
        benchmark_stats.std_dev              = Statistics.getStdDev(benchmark_samples_to_process)
        benchmark_stats.std_err              = Statistics.getStdErr(benchmark_samples_to_process)
        benchmark_stats.std_err_percentage   = benchmark_stats.std_err / benchmark_stats.mean * 100.0 if benchmark_stats.std_err > 0.0 else 0.0
        benchmark_stats.margin               = Statistics.getMargin(benchmark_samples_to_process)
        benchmark_stats.margin_percentage    = benchmark_stats.margin / benchmark_stats.mean * 100.0 if benchmark_stats.margin > 0.0 else 0.0
        benchmark_stats.confidence_interval  = Statistics.getConfidenceInterval(benchmark_samples_to_process)
        benchmark_stats.skewness             = Statistics.getSkewness(benchmark_samples_to_process)
        benchmark_stats.kurtosis             = Statistics.getKurtosis(benchmark_samples_to_process)  

    return benchmark_results

##############################################################################

def printBenchmarkResults(benchmark_samples, benchmark_results, print_samples_info):
    if print_samples_info:
        print("Samples:")
        print(benchmark_samples, "\n")
        
        print("Sorted Samples:")
        print(benchmark_results.sorted_lower_outliers_samples, benchmark_results.sorted_no_outliers_samples, benchmark_results.sorted_upper_outliers_samples, "\n")

    for key in benchmark_results.statistics:
        without_outliers = key == "Without outliers"

        statistics_results    = benchmark_results.getFormatedStatisticsResultsWithoutOutliers() if without_outliers else benchmark_results.getFormatedStatisticsResultsWithOutliers()
        text_alignment_offset = len(max(statistics_results, key=len)) + 3
        
        print(key + ":")
        
        for stat_key in statistics_results:
            print(stat_key + "= ".rjust(text_alignment_offset - len(stat_key)) + statistics_results[stat_key])
            
        print("\n")

##############################################################################

def runAnalyzer(kwargs=None):
    # Parse args
    parser = argparse.ArgumentParser(description="Benchmark Analyzer")

    parser.add_argument("-in", 
                        "--benchmark_samples_file", 
                        type=str, 
                        required=True,
                        help="File path containing the benchmark observations as comma separated numbers.")
    
    parser.add_argument("-out", 
                        "--json_output_path", 
                        type=str, 
                        required=True,
                        help="JSON output path for file containing the statistical information of the analyzed benchmark.")
    
    parser.add_argument("-op", 
                        "--operation_name", 
                        type=str,
                        required=True,
                        help="Name of the operation related to the benchmark observations.")
    
    parser.add_argument("-out_name", 
                        "--output_file_name", 
                        type=str,
                        required=False,
                        help="(Optional) The name of the output file, if this option is not used the file will be called Benchmark_Results_<MONTH>-<DAY>-<YEAR>_<HOUR>h<MINUTE>m<SECOND>s.")

    args = parser.parse_args()

    # Input Params
    benchmark_samples_file = args.benchmark_samples_file
    json_output_path       = args.json_output_path
    operation_name         = args.operation_name
    output_file_name       = args.output_file_name
    
    # Create an array from benchmark samples in file
    with open(benchmark_samples_file) as file:
        benchmark_samples = np.fromfile(file, dtype=float, sep=",")
    
    # Create benchmark results
    benchmark_results = createBenchmarkResults(benchmark_samples, operation_name)
    
    # Print benchmark results
    printBenchmarkResults(benchmark_samples, benchmark_results, print_samples_info=False)

    # Export benchmark results to a JSON file
    benchmark_results.toJSONFile(json_output_path, operation_name, output_file_name)

##############################################################################


#-----------------------------------------------------------------------------
# Main
#-----------------------------------------------------------------------------
if __name__ == '__main__':
    runAnalyzer()
