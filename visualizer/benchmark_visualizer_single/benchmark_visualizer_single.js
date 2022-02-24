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
        const operationBenchmarkList = jsonObjects[operation];
        
        for (let i = 0; i < operationBenchmarkList.length; i++)
        {
            benchmarkListComboBox.append($("<option></option>").attr("value", i + 1).text(operationBenchmarkList[i]));
        } 
    });
}


//--------------------------------------------------------------------------------------------------
// Events
//--------------------------------------------------------------------------------------------------
$("#operations").change(function()
{
    populateBenchmarkListComboBox();
});

$("#benchmarks").change(function()
{
    getBenchmarkData();
});


//--------------------------------------------------------------------------------------------------
// Functions called from HTML
//--------------------------------------------------------------------------------------------------
function getBenchmarkData()
{
    const benchmarkSelectedIndex = $("#benchmarks").prop("selectedIndex");

    if (benchmarkSelectedIndex == 0)
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
// Functions called in main (Initialize)
//--------------------------------------------------------------------------------------------------
function populateOperationsComboBox()
{
    let operationsComboBox = $("#operations");

    operationsComboBox.empty();

    operationsComboBox.append("<option selected='true' value='0' disabled>Choose Operation</option>");
    operationsComboBox.prop("selectedIndex", 0);

    $.getJSON("../benchmark_data/operations_indexer.json", function(jsonObjects)
    {
        let i = 1;
        
        $.each(jsonObjects, function(key)
        {
            const operation = key;
            
            operationsComboBox.append($("<option></option>").attr("value", i).text(operation));
            
            i++;
        });
    });
}


//--------------------------------------------------------------------------------------------------
// Main
//--------------------------------------------------------------------------------------------------
populateOperationsComboBox();
