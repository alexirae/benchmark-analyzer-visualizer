//--------------------------------------------------------------------------------------------------
// Helper Functions
//--------------------------------------------------------------------------------------------------
function createElementWithId(element, id)
{
	let newElement = document.createElement(element);

	newElement.id = id.toLowerCase();
	
	return newElement;
}

function createEmptyComboBox(id)
{
    return createElementWithId("select", id);
}

function addComboBoxOption(comboBox, value, innerHTML, selected, disabled)
{
	let comboBoxOption = document.createElement("option");

	comboBoxOption.value     = value;
	comboBoxOption.innerHTML = innerHTML;
	comboBoxOption.selected  = selected;
	comboBoxOption.disabled  = disabled;

	comboBox.add(comboBoxOption);
}

function createComboBox(currentFilterElement, key, parentDiv, onChangeFunction)
{
	// Create ComboBox
	comboBox = createEmptyComboBox(key);

	// Add ComboBox options
	addComboBoxOption(comboBox, 0, key, true, true);

	let i = 1;

	$.each(currentFilterElement, function(optionText)
	{
		addComboBoxOption(comboBox, i, optionText, false, false);
		i++;
	});

	// Assign onchange logic
	comboBox.onchange = function()
	{
		onChangeFunction();
	};

	// Add combobox
	$("#" + parentDiv).append(comboBox);
}

function getBenchmarkJSONPathFromFilter(operationFilterDivId)
{
    // Build path where the Benchmark JSON file is located
    let benchmarkJSONPath = "../benchmark_data/";

	const isMultiProject = $("#projects").length > 0;
    
	if (isMultiProject)
	{
        $("#" + operationFilterDivId).children("select").each(function()
        {
            if ($(this).children("option:eq(0)").text() != "PROJECTS")
            {
                benchmarkJSONPath += $(this).children("option:eq(0)").text() + "/";
            }
            
            benchmarkJSONPath += $(this).children("option:selected").text() + "/";
        });
    }
    else
    {
        benchmarkJSONPath += $("#operations option:selected").text() + "/";
    }

	return benchmarkJSONPath;
}

function filterMarching(comboboxId, currentFilterElement, operationFilterDivId)
{
	const selectedOption = $("#" + comboboxId + " option:selected").text();
	const jsonObjects  = currentFilterElement[selectedOption];

	if (comboboxId != "operations")
	{
		createFilterElement(jsonObjects, operationFilterDivId);
	}
	else
	{
		populateBenchmarkListFromFilter(jsonObjects);
	}
};

function createFilterElement(jsonObjects, operationFilterDivId)
{
    $.each(jsonObjects, function(key)
    {
        const currentFilterElement = jsonObjects[key];
        const comboboxId           = key.toLowerCase();

        // combobox already exists, cleanup
        if($("#" + comboboxId).length > 0)
        {
            let deleteComboboxes = false;

            $("#" + operationFilterDivId).children("select").each(function()
            {
                if (comboboxId == this.id)
                {
                    deleteComboboxes = true;
                }

                if (deleteComboboxes)
                {
                    $("#" + this.id).remove();
                }
            });

            clearDisplayedBenchmarkInfo();
            clearBenchmarkResults();
			resetOptionsPanel();
        }

		createComboBox(currentFilterElement, key, operationFilterDivId, function() { filterMarching(comboboxId, currentFilterElement, operationFilterDivId); });
    });
}

function createOperationsFilter(operationFilterDivId)
{
    const isMultiProject = $("#projects").length > 0;

	if (isMultiProject)
	{
        const selectedProject = $("#projects option:selected").text();

        $.getJSON("../benchmark_data/" + selectedProject + "_indexer.json", function(jsonObjects)
        {
            createFilterElement(jsonObjects, operationFilterDivId);
        });
	}
    else
    {
        const operation = $("#operations option:selected").text();

        $.getJSON("../benchmark_data/operations_indexer.json", function(jsonObjects)
        {
            const benchmarkResultsList = jsonObjects["OPERATIONS"][operation];

            populateBenchmarkListFromFilter(benchmarkResultsList);
        });
    }
}

function populateBenchmarkListComboBox(comboboxName, benchmarkResultsList)
{
	let benchmarkListComboBox = $(comboboxName);
	
    benchmarkListComboBox.empty();
	
    benchmarkListComboBox.append("<option selected='true' value='0' disabled>Choose Benchmark Result</option>");
    benchmarkListComboBox.prop("selectedIndex", 0);
    
    for (let i = 0; i < benchmarkResultsList.length; i++)
    {
		benchmarkListComboBox.append($("<option></option>").attr("value", i + 1).text(benchmarkResultsList[i]));
    }
	
	clearDisplayedBenchmarkInfo();
	resetOptionsPanel();

	// Persist benchmark results list (deep copy)
	g_benchmarkResultsArray = JSON.parse(JSON.stringify(benchmarkResultsList));
}

function resetOptionsPanel()
{
    $("#options_panel").hide();
    $("#show_outliers").prop("checked", true);
}

//--------------------------------------------------------------------------------------------------
// Functions called in main (Initialize)
//--------------------------------------------------------------------------------------------------
function createBenchmarkOperationFilter(operationFilterDivId, createOperationsFilterFunction)
{
	$.getJSON("../benchmark_data/operations_indexer.json", function(jsonObjects)
    {
        $.each(jsonObjects, function(key)
        {
			const currentFilterElement = jsonObjects[key];

			createComboBox(currentFilterElement, key, operationFilterDivId, function () { createOperationsFilterFunction(operationFilterDivId); });
        });
    });
}
