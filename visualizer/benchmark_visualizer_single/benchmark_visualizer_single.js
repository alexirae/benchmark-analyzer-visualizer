//--------------------------------------------------------------------------------------------------
// Functions called from events
//--------------------------------------------------------------------------------------------------
function populateBenchmarkListComboBox()
{
    let benchmarkListComboBox = $("#benchmarks");

    benchmarkListComboBox.empty();

    benchmarkListComboBox.append("<option selected='true' value='0' disabled>Choose Benchmark Result</option>");
    benchmarkListComboBox.prop("selectedIndex", 0);
    
    const operation = $("#operations option:selected").text();

    $.getJSON("../benchmark_data/operations_indexer.json", function(jsonObjects)
    {
        const operationBenchmarkList = jsonObjects["OPERATIONS"][operation];
        
        for (let i = 0; i < operationBenchmarkList.length; i++)
        {
            benchmarkListComboBox.append($("<option></option>").attr("value", i + 1).text(operationBenchmarkList[i]));
        } 
    });
}

function comboBoxFunction()
{
	populateBenchmarkListComboBox();
};


//--------------------------------------------------------------------------------------------------
// Events
//--------------------------------------------------------------------------------------------------
$("#benchmarks").change(function()
{
    getBenchmarkData();
});


//--------------------------------------------------------------------------------------------------
// Functions called from HTML
//--------------------------------------------------------------------------------------------------
function getBenchmarkData()
{
	const operationsSelectedIndex = $("#operations").prop("selectedIndex");
    const benchmarkSelectedIndex  = $("#benchmarks").prop("selectedIndex");

    if (operationsSelectedIndex == 0 || benchmarkSelectedIndex == 0)
    {
        return;
    }

    const showOutliers = $("#showOutliers").prop("checked");
    const operation    = $("#operations option:selected").text();
    const benchmarkId  = $("#benchmarks option:selected").text();
    
    const operationBenchmarkPath = "../benchmark_data/" + operation + "/" + benchmarkId + ".json";
    
    $.getJSON(operationBenchmarkPath, function(benchmarkInfo)
    {
        addTable("#benchmark_statistics", [benchmarkInfo], showOutliers);
        generateAndDisplayPlots(benchmarkInfo, showOutliers);
    });
}


//--------------------------------------------------------------------------------------------------
// Main
//--------------------------------------------------------------------------------------------------
populateOperationsComboBox(comboBoxFunction);
