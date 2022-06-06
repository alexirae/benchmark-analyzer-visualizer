//--------------------------------------------------------------------------------------------------
// Helper Functions
//--------------------------------------------------------------------------------------------------
function clearDisplayedBenchmarkInfo()
{
    $("#benchmark_results_plots").empty();
    $("#benchmark_statistics").empty();
}

function clearBenchmarkResults(filterIndex)
{
    $("#benchmarks").empty();
}

function populateBenchmarkListFromFilter(benchmarkResultsList, filterIndex)
{
    populateBenchmarkListComboBox("benchmarks", benchmarkResultsList);
}


//--------------------------------------------------------------------------------------------------
// Functions called from events
//--------------------------------------------------------------------------------------------------
function getBenchmarkData()
{
	const operationsSelectedIndex = $("#operations_0").prop("selectedIndex");
    const benchmarkSelectedIndex  = $("#benchmarks").prop("selectedIndex");

    if (operationsSelectedIndex == undefined || 
        benchmarkSelectedIndex  == undefined || 
        operationsSelectedIndex == 0         || 
        benchmarkSelectedIndex  == 0)
    {
        return;
    }

    const benchmarkJSONPath      = getBenchmarkJSONPathFromFilterIndex(0);
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
// Functions called in main (Initialize)
//--------------------------------------------------------------------------------------------------
function initBenchmarkListCombobox()
{
    $("#benchmarks").attr("style", "color: grey");
    $("#benchmarks").append("<option value='0' autocomplete='off' style='display:none;' selected disabled>Select operation first</option>");
}


//--------------------------------------------------------------------------------------------------
// Main
//--------------------------------------------------------------------------------------------------
resetOptionsPanel();
createBenchmarkOperationFilter($("#operation_filter_0").attr("name"), function () { createOperationsFilter($("#operation_filter_0").attr("name")); });
initBenchmarkListCombobox();
