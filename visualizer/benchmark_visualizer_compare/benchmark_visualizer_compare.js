//--------------------------------------------------------------------------------------------------
// Helper Functions
//--------------------------------------------------------------------------------------------------
function clearDisplayedBenchmarkInfo()
{
    $("#benchmark_results_plot_density").empty();
    $("#benchmark_results_plot_box").empty();
    $("#comparison_results").empty();
}

function getBenchmarkIdsToPlot()
{
    let benchmarkIdsToPlot = [];

    benchmarkIdsToPlot.push($("#benchmark_start option:selected").text());
    benchmarkIdsToPlot.push($("#benchmark_end option:selected").text());

    return benchmarkIdsToPlot;
}


//--------------------------------------------------------------------------------------------------
// Events
//--------------------------------------------------------------------------------------------------
$("#benchmark_start").change(function()
{
    const benchmarkIds = getBenchmarkResultsArray();
    
    const value = $(this).val();
    const firstBenchmarkComboBoxRange  = benchmarkIds.slice(0, value);
    const secondBenchmarkComboBoxRange = benchmarkIds.slice(value);

    updateBenchmarkListComboBox("#benchmark_end", firstBenchmarkComboBoxRange, secondBenchmarkComboBoxRange);
});

$("#benchmark_end").change(function()
{
    const benchmarkIds = getBenchmarkResultsArray();
    
    const value = $(this).val();
    const firstBenchmarkComboBoxRange  = benchmarkIds.slice(0, value - 1);
    const secondBenchmarkComboBoxRange = [];

    updateBenchmarkListComboBox("#benchmark_start", firstBenchmarkComboBoxRange, secondBenchmarkComboBoxRange);
});

$("#showOutliers").change(function()
{
    getBenchmarkData();
});

$("#hideOutliers").change(function()
{
    getBenchmarkData();
});


//--------------------------------------------------------------------------------------------------
// Main
//--------------------------------------------------------------------------------------------------
resetOptionsPanel();
createBenchmarkFilters(createOperationsFilter);
