//////////////////////////////////////////////////////////////////////////////////////////////////

function retrieveAndDisplayJSONData(operation, benchmarkIds)
{
    // Create calls to collect JSON benchmark data
    let calls = [];

    for (let i = 0; i < benchmarkIds.length; i++)
    {
        let jsonFilePath = "../benchmark_data/" + operation + "/" + benchmarkIds[i] + ".json";
        calls.push(getJSONData(jsonFilePath));
    }

    // Wait for all calls to be done so we can display plots
    Promise.all(calls).then(function(benchmarkInfos)
    {
        const showOutliers = $("#showOutliers").prop("checked");
        
        addTable("#comparison_results", benchmarkInfos, showOutliers);
        
        let boxPlotItems = [];
        let densityItems   = [];

        for (let i = 0; i < benchmarkInfos.length; i++)
        {
            const benchmarkInfo = benchmarkInfos[i];
            
            let benchmarkSamples = [...benchmarkInfo["sorted_no_outliers_samples"]];
    
            if (showOutliers)
            {
                benchmarkSamples.unshift(...benchmarkInfo["sorted_lower_outliers_samples"]);
                benchmarkSamples.push(...benchmarkInfo["sorted_upper_outliers_samples"]);
            }
            
            const itemColor = getRandomHexColor();
            
            addBoxPlotTraces(boxPlotItems, itemColor, benchmarkInfo, benchmarkSamples, showOutliers);
            addDensityPlotTraces(densityItems, itemColor, benchmarkInfo, benchmarkSamples, showOutliers);
        }
        
        // Show Plots
        displayBoxPlot(boxPlotItems);
        displayDensityPlot(densityItems);
        
    }).catch(function(reason)
    {
        console.log(reason);
    });
}


//--------------------------------------------------------------------------------------------------
// Functions called from events
//--------------------------------------------------------------------------------------------------
function updateBenchmarkListComboBox(comboboxName, value, operation)
{
    const combobox = $(comboboxName);
    
    const prevSelectedIndex = combobox.prop("selectedIndex");
    const prevSelectedItem  = $(comboboxName + " option:selected").text();
    
    // Reset Combobox
    combobox.empty();
    combobox.append("<option selected='true' disabled>Choose Benchmark Result</option>");
    
    $.getJSON("../benchmark_data/operations_indexer.json", function(jsonObjects)
    {
        // Collect benchmark ids
        let benchmarkIds = [];
        
        const benchmarkList = jsonObjects[operation];
        
        for (let i = 0; i < benchmarkList.length; i++)
        {
            benchmarkIds.push(benchmarkList[i]);
        }
        
        let benchmarkIdsToPlot = [];

        // Update Combobox accordingly and only display benchmark items based on combobox selection
        if (comboboxName == "#benchmark_start")
        {
            // Fill combobox with new range
            const first  = benchmarkIds.slice(0, value - 1); 
            const second = benchmarkIds.slice(value - 1);

            for (let i = 0; i < first.length; i++)
            {
                const benchmarkId = first[i];
                combobox.append($("<option></option>").attr("value", i + 1).text(benchmarkId));
            }
            
            // Set combobox selection and plot
            if (prevSelectedIndex != 0)
            {
                const idx = first.indexOf(prevSelectedItem) + 1;
                combobox.prop("selectedIndex", idx);

                const startIndex = benchmarkIds.indexOf(prevSelectedItem);
                const endIndex   = first.length;

                benchmarkIdsToPlot.push(benchmarkIds[startIndex]);
                benchmarkIdsToPlot.push(benchmarkIds[endIndex]);

                retrieveAndDisplayJSONData(operation, benchmarkIdsToPlot);
            }
        }
        else if (comboboxName == "#benchmark_end")
        {
            // Fill combobox with new range
            const first  = benchmarkIds.slice(0, value);
            const second = benchmarkIds.slice(value);
        
            for (let i = 0; i < second.length; i++)
            {
                const benchmarkId = second[i];
                combobox.append($("<option></option>").attr("value", first.length + i + 1).text(benchmarkId));
            }
            
            // Set combobox selection and plot
            if (prevSelectedIndex != 0)
            {
                const idx = second.indexOf(prevSelectedItem) + 1;
                combobox.prop("selectedIndex", idx);

                const startIndex = first.length - 1;
                const endIndex   = benchmarkIds.indexOf(prevSelectedItem);
                
                benchmarkIdsToPlot.push(benchmarkIds[startIndex]);
                benchmarkIdsToPlot.push(benchmarkIds[endIndex]);
                
                retrieveAndDisplayJSONData(operation, benchmarkIdsToPlot);
            }
        }
    });
}


//--------------------------------------------------------------------------------------------------
// Functions called from HTML
//--------------------------------------------------------------------------------------------------
function getBenchmarkDataInRange()
{
    const benchmarkStartSelectedIndex = $("#benchmark_start").prop("selectedIndex");
    const benchmarkEndSelectedIndex   = $("#benchmark_end").prop("selectedIndex");

    if (benchmarkStartSelectedIndex == 0 || benchmarkEndSelectedIndex == 0)
    {
        return;
    }
    
    const operation = $("#operations option:selected").text();
    
    let benchmarkIds = [];
    
    benchmarkIds.push($("#benchmark_start option:selected").text());
    benchmarkIds.push($("#benchmark_end option:selected").text());

    retrieveAndDisplayJSONData(operation, benchmarkIds);
}


//--------------------------------------------------------------------------------------------------
// Events
//--------------------------------------------------------------------------------------------------
$("#operations").change(function()
{
    populateBenchmarkListComboBox("#benchmark_start");
    populateBenchmarkListComboBox("#benchmark_end");
});

$("#benchmark_start").change(function()
{
    const operation = $("#operations option:selected").text();
    updateBenchmarkListComboBox("#benchmark_end", $(this).val(), operation);
});

$("#benchmark_end").change(function()
{
    const operation = $("#operations option:selected").text();
    updateBenchmarkListComboBox("#benchmark_start", $(this).val(), operation);
});


//--------------------------------------------------------------------------------------------------
// Main
//--------------------------------------------------------------------------------------------------
populateOperationsComboBox();
