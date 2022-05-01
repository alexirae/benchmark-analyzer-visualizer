//--------------------------------------------------------------------------------------------------
// Helper Functions
//--------------------------------------------------------------------------------------------------
function clearDisplayedBenchmarkInfo()
{
    $("#benchmark_results_plot_density").empty();
    $("#benchmark_results_plot_box").empty();
}

function getBenchmarkIdsToPlot()
{
    let benchmarkIdsToPlot = [];

    const benchmarkStartSelectedIndex = $("#benchmark_start").prop("selectedIndex");

    const rangeSize = $("#benchmark_start").children("option").length;
    
    for (let i = benchmarkStartSelectedIndex; i < rangeSize; i++)
    {
        benchmarkIdsToPlot.push($("#benchmark_start option[value=" + (i).toString() + "]").text());
    }

    return benchmarkIdsToPlot;
}


//--------------------------------------------------------------------------------------------------
// Events
//--------------------------------------------------------------------------------------------------
$("#benchmark_start").change(function()
{
    const benchmarkIds = getBenchmarkResultsArray();
    
    const value = $(this).val();
    const firstBenchmarkComboBoxRange  = benchmarkIds.slice(0, value - 1);
    const secondBenchmarkComboBoxRange = benchmarkIds.slice(value - 1);

    updateBenchmarkListComboBox("#benchmark_end", firstBenchmarkComboBoxRange, secondBenchmarkComboBoxRange);
});

$("#benchmark_end").change(function()
{
    const benchmarkIds = getBenchmarkResultsArray();
    
    const value = $(this).val();
    const firstBenchmarkComboBoxRange  = benchmarkIds.slice(0, value);
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
createBenchmarkFilters(createOperationsFilter);
