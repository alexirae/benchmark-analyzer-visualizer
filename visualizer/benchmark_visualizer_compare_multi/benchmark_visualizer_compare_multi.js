//--------------------------------------------------------------------------------------------------
// Helper Functions
//--------------------------------------------------------------------------------------------------
function resetOptionsPanel()
{
    if ($("#benchmark_filters").children().length < 2)
    {
        $("#options_panel").hide();
        $("#show_outliers").prop("checked", true);
    }
}

function clearDisplayedBenchmarkInfo()
{
    getBenchmarkData();
}

function clearBenchmarkResults(filterIndex)
{
    const benchmarkResultsComboBoxId = "benchmarks_" + filterIndex.toString();
    $("#" + benchmarkResultsComboBoxId).empty();
}

function populateBenchmarkListFromFilter(benchmarkResultsList, filterIndex)
{
    const benchmarkResultsComboBoxId = "benchmarks_" + filterIndex.toString();
    populateBenchmarkListComboBox(benchmarkResultsComboBoxId, benchmarkResultsList);
    
    let benchmarkResultsComboBox = document.getElementById(benchmarkResultsComboBoxId);
    
    benchmarkResultsComboBox.onchange = function()
	{
		getBenchmarkData();
	};
}

function rearrangeFilterIndexes()
{
    const numBenchmarFilters = $("#benchmark_filters").children().length;

    if (numBenchmarFilters == 1)
    {
        return;
    }

    let filterIndex = -1;

    $('div, select, button', $('#benchmark_filters')).each(function () {
        const elementIdWithoutFilterIndex = $(this).prop("id").substr(0, $(this).prop("id").lastIndexOf('_'));

        if (elementIdWithoutFilterIndex === "benchmark_filter")
        {
            ++filterIndex;
        }

        $(this).prop("id", elementIdWithoutFilterIndex + "_" + filterIndex.toString());
    });
}

function createRemoveFilterButton(filterIndex)
{
    const removeFilterButtonId = "remove_benchmark_filter_" + filterIndex.toString();
    const removeFilterButton   = createElementWithId("button", removeFilterButtonId);

    removeFilterButton.innerHTML = "X";

    removeFilterButton.onclick = function () {
        $(this).parent().remove();
        rearrangeFilterIndexes();
        getBenchmarkData();
    };
    
    return removeFilterButton;
}


//--------------------------------------------------------------------------------------------------
// Functions called from events
//--------------------------------------------------------------------------------------------------
function addFilter()
{
    const filterIndex = $("#benchmark_filters").children().length;

    // Create benchmark_filter_i inside benchmark_filters 
    const benchmarkFilterDivId = "benchmark_filter_" + filterIndex.toString();
    const benchmarkFilterDiv   = createElementWithId("div", benchmarkFilterDivId);
    $("#benchmark_filters").append(benchmarkFilterDiv);

    // Create operation_filter_i inside benchmark_filter_i
    const operationFilterDivId   = "operation_filter_" + filterIndex.toString();
    const operationFilterDiv     = createElementWithId("div", operationFilterDivId);

    const operationFilterDivName = generateUUID();
    operationFilterDiv.setAttribute("name", operationFilterDivName);

    $("#" + benchmarkFilterDivId).append(operationFilterDiv);

    createBenchmarkOperationFilter(operationFilterDivName, function() { createOperationsFilter(operationFilterDivName); });

    // Create benchmarks_i combobox inside benchmark_filter_i
    const benchmarkResultsComboBoxId = "benchmarks_" + filterIndex.toString();
    const benchmarkResultsComboBox   = createEmptyComboBox(benchmarkResultsComboBoxId);

    benchmarkResultsComboBox.setAttribute("style", "color: grey");

    let benchmarkResultsComboBoxOption = createComboBoxOption(0, "Select operation first", true, true);
    benchmarkResultsComboBoxOption.setAttribute("autocomplete", "off");
    benchmarkResultsComboBoxOption.setAttribute("style", "display: none");

    benchmarkResultsComboBox.add(benchmarkResultsComboBoxOption);

    $("#" + benchmarkFilterDivId).append(benchmarkResultsComboBox);
    $("#" + benchmarkFilterDivId).append("<br>");

    // Create remove_benchmark_filter_i button inside benchmark_filter_i (only if we have more than one filter)
    if (filterIndex > 0)
    {
        const removeFilterButton = createRemoveFilterButton(filterIndex);
        $("#" + benchmarkFilterDivId).append(removeFilterButton);
    }

    $("#" + benchmarkFilterDivId).append("<br>");
    $("#" + benchmarkFilterDivId).append("<br>");
}

function getBenchmarkData()
{
    let benchmarkInfosPaths = [];
    let plotItemsColor      = [];

    const plotsExist         = $("#benchmark_results_plots").children().length > 0;
    const numBenchmarFilters = $("#benchmark_filters").children().length;

    for (let filterIndex = 0; filterIndex < numBenchmarFilters; ++filterIndex)
    {
        // Initial check
        const operationsComboboxId       = "operations_" + filterIndex.toString();
        const benchmarkResultsComboboxId = "benchmarks_" + filterIndex.toString();

        const operationsSelectedIndex = $("#" + operationsComboboxId).prop("selectedIndex");
        const benchmarkSelectedIndex  = $("#" + benchmarkResultsComboboxId).prop("selectedIndex");
    
        if (operationsSelectedIndex == undefined || 
            benchmarkSelectedIndex  == undefined || 
            operationsSelectedIndex == 0         || 
            benchmarkSelectedIndex  == 0)
        {
            continue;
        }
        
        // Determine the benchmark result path
        const benchmarkJSONPath      = getBenchmarkJSONPathFromFilterIndex(filterIndex);
        const benchmarkFileName      = $("#" + benchmarkResultsComboboxId + " option:selected").text() + ".json"
        const operationBenchmarkPath = benchmarkJSONPath + benchmarkFileName;

        benchmarkInfosPaths.push(operationBenchmarkPath);

        // Determine the right color for the plot
        const color = (plotsExist && filterIndex < benchmark_results_plot_box.data.length)  ? 
                        benchmark_results_plot_box.data[filterIndex].marker.color : 
                        getRandomHexColor();

        plotItemsColor.push(color);
    }

    // Proceed to show plots or do a cleanup
    if (benchmarkInfosPaths.length > 0)
    {
        const isCompareMode = true;
        retrieveAndDisplayJSONData(benchmarkInfosPaths, plotItemsColor, isCompareMode);
    }
    else
    {
        $("#benchmark_results_plots").empty();
        $("#comparison_results").empty();
    }
}


//--------------------------------------------------------------------------------------------------
// Events
//--------------------------------------------------------------------------------------------------
$("#add_filter").click(function()
{
    addFilter();
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
addFilter();
