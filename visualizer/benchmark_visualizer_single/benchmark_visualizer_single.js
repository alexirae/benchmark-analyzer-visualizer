//--------------------------------------------------------------------------------------------------
// Helper Functions
//--------------------------------------------------------------------------------------------------
function clearDisplayedBenchmarkInfo()
{
    $("#benchmark_results_plots").empty();
    $("#benchmark_statistics").empty();
}

function clearBenchmarkResults()
{
    $("#benchmarks").empty();
}

function populateBenchmarkListFromFilter(filter)
{
    populateBenchmarkListComboBox("#benchmarks", filter);
}


//--------------------------------------------------------------------------------------------------
// Functions called from events
//--------------------------------------------------------------------------------------------------
function getBenchmarkData()
{
	const operationsSelectedIndex = $("#operations").prop("selectedIndex");
    const benchmarkSelectedIndex  = $("#benchmarks").prop("selectedIndex");

    if (operationsSelectedIndex == undefined || 
        benchmarkSelectedIndex  == undefined || 
        operationsSelectedIndex == 0         || 
        benchmarkSelectedIndex  == 0)
    {
        return;
    }

    const benchmarkJSONPath      = getBenchmarkJSONPathFromFilter();
    const benchmarkFileName      = $("#benchmarks option:selected").text() + ".json"
    const operationBenchmarkPath = benchmarkJSONPath + benchmarkFileName;

    $.getJSON(operationBenchmarkPath, function(benchmarkInfo)
    {
        displayJSONData(benchmarkInfo);
    });
}


//--------------------------------------------------------------------------------------------------
// Events
//--------------------------------------------------------------------------------------------------
$("#benchmarks").change(function()
{
    getBenchmarkData();
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
createBenchmarkFilters(createOperationsFilter);
