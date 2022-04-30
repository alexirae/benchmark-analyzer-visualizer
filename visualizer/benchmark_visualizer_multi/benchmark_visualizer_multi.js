//--------------------------------------------------------------------------------------------------
// Functions called from events
//--------------------------------------------------------------------------------------------------
function getBenchmarkDataInRange()
{
	const operationsSelectedIndex = $("#operations").prop("selectedIndex");
	
    const benchmarkStartSelectedIndex = $("#benchmark_start").prop("selectedIndex");
    const benchmarkEndSelectedIndex   = $("#benchmark_end").prop("selectedIndex");

    if (operationsSelectedIndex     == undefined || 
        benchmarkStartSelectedIndex == undefined || 
        benchmarkEndSelectedIndex   == undefined || 
        operationsSelectedIndex     == 0         || 
        benchmarkStartSelectedIndex == 0         || 
        benchmarkEndSelectedIndex   == 0)
    {
        return;
    }
    
    let benchmarkIdsToPlot = [];

    const rangeSize = $("#benchmark_start").children("option").length;
    
    for (let i = benchmarkStartSelectedIndex; i < rangeSize; i++)
    {
        benchmarkIdsToPlot.push($("#benchmark_start option[value=" + (i).toString() + "]").text());
    }

    const operation = $("#operations option:selected").text();
    
    retrieveAndDisplayJSONData(operation, benchmarkIdsToPlot, false);
}

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
        
        const benchmarkList = jsonObjects["OPERATIONS"][operation];
        
        for (let i = 0; i < benchmarkList.length; i++)
        {
            benchmarkIds.push(benchmarkList[i]);
        }
        
        let benchmarkIdsToPlot = [];

        // Update Combobox accordingly and only display benchmark items based on combobox selection
        if (comboboxName == "#benchmark_start")
        {
            // Fill combobox with new range
            const first  = benchmarkIds.slice(0, value); 
            const second = benchmarkIds.slice(value);

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

                for (let i = startIndex; i < endIndex; i++)
                {
                    benchmarkIdsToPlot.push(benchmarkIds[i]);
                }

                retrieveAndDisplayJSONData(operation, benchmarkIdsToPlot, false);
            }
        }
        else if (comboboxName == "#benchmark_end")
        {
            // Fill combobox with new range
            const first  = benchmarkIds.slice(0, value - 1);
            const second = benchmarkIds.slice(value - 1);
        
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

                const startIndex = first.length;
                const endIndex   = benchmarkIds.indexOf(prevSelectedItem) + 1;
                
                for (let i = startIndex; i < endIndex; i++)
                {
                    benchmarkIdsToPlot.push(benchmarkIds[i]);
                }
                
                retrieveAndDisplayJSONData(operation, benchmarkIdsToPlot, false);
            }
        }
    });
}


//--------------------------------------------------------------------------------------------------
// Events
//--------------------------------------------------------------------------------------------------
$("#benchmark_start").change(function()
{
    const operation = $("#operations option:selected").text()
    updateBenchmarkListComboBox("#benchmark_end", $(this).val(), operation);
});

$("#benchmark_end").change(function()
{
    const operation = $("#operations option:selected").text()
    updateBenchmarkListComboBox("#benchmark_start", $(this).val(), operation);
});

$("#showOutliers").change(function()
{
    getBenchmarkDataInRange();
});

$("#hideOutliers").change(function()
{
    getBenchmarkDataInRange();
});


//--------------------------------------------------------------------------------------------------
// Main
//--------------------------------------------------------------------------------------------------
createBenchmarkFilters(createOperationsFilter);
