//--------------------------------------------------------------------------------------------------
// Helper Functions
//--------------------------------------------------------------------------------------------------
function clearDisplayedBenchmarkInfo()
{
    $("#benchmark_results_plots").empty();
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

    updateBenchmarkListComboBox("benchmark_end", firstBenchmarkComboBoxRange, secondBenchmarkComboBoxRange);
});

$("#benchmark_end").change(function()
{
    const benchmarkIds = getBenchmarkResultsArray();
    
    const value = $(this).val();
    const firstBenchmarkComboBoxRange  = benchmarkIds.slice(0, value - 1);
    const secondBenchmarkComboBoxRange = [];

    updateBenchmarkListComboBox("benchmark_start", firstBenchmarkComboBoxRange, secondBenchmarkComboBoxRange);
});

$("#show_outliers").change(function()
{
    getBenchmarkData();
});

$("#hide_outliers").change(function()
{
    getBenchmarkData();
});


//--------------------------------------------------------------------------------------------------
// Main
//--------------------------------------------------------------------------------------------------
resetOptionsPanel();
createBenchmarkOperationFilter($("#operation_filter_0").attr("name"), function () { createOperationsFilter($("#operation_filter_0").attr("name")); });
initBenchmarkListComboboxes();
