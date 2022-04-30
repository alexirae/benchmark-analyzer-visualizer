//--------------------------------------------------------------------------------------------------
// Helper Functions
//--------------------------------------------------------------------------------------------------
function clearDisplayedBenchmarkInfo()
{
    $("#benchmark_statistics").empty();
    $("#benchmark_results_plot_histogram").empty();
    $("#benchmark_results_plot_density").empty();
    $("#benchmark_results_plot_box").empty();
}

function createOperationsFilter()
{
    const operation = $("#operations option:selected").text();

    $.getJSON("../benchmark_data/operations_indexer.json", function(jsonObjects)
    {
        const operationBenchmarkList = jsonObjects["OPERATIONS"][operation];

        populateBenchmarkListComboBox("#benchmarks", operationBenchmarkList);
    });
};

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

    const operation    = $("#operations option:selected").text();
    const benchmarkId  = $("#benchmarks option:selected").text();
    const operationBenchmarkPath = "../benchmark_data/" + operation + "/" + benchmarkId + ".json";

    const showOutliers = $("#showOutliers").prop("checked");
    
    $.getJSON(operationBenchmarkPath, function(benchmarkInfo)
    {
        addTable("#benchmark_statistics", [benchmarkInfo], showOutliers);
        generateAndDisplayPlots(benchmarkInfo, showOutliers);
    });
}


//--------------------------------------------------------------------------------------------------
// Events
//--------------------------------------------------------------------------------------------------
$("#benchmarks").change(function()
{
    getBenchmarkData();
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
