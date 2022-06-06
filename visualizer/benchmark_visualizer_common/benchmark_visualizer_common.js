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
	let comboBox = createEmptyComboBox(key);

	// Add ComboBox options
    const title = key.substr(0, key.lastIndexOf('_')).toUpperCase();
	addComboBoxOption(comboBox, 0, title, true, true);

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

function getBenchmarkJSONPathFromFilter(operationFilterDivId, filterIndex)
{
    // Build path where the Benchmark JSON file is located
    let benchmarkJSONPath = "../benchmark_data/";

    const projectsId = "#projects_" + filterIndex.toString();
	const isMultiProject = $(projectsId).length > 0;
    
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
        const operationId   = "#operations_" + filterIndex.toString();
        const operationName = $(operationId + " option:selected").text();

        benchmarkJSONPath += operationName + "/";
    }

	return benchmarkJSONPath;
}

function filterMarching(comboboxId, currentFilterElement, operationFilterDivId, filterIndex)
{
	const selectedOption = $("#" + comboboxId + " option:selected").text();
	const jsonObjects  = currentFilterElement[selectedOption];

    const isNotOperationsFilterElement = comboboxId.substr(0, comboboxId.lastIndexOf('_')) != "operations";

	if (isNotOperationsFilterElement)
	{
		createFilterElement(jsonObjects, operationFilterDivId, filterIndex);
	}
	else
	{
		populateBenchmarkListFromFilter(jsonObjects, filterIndex);
	}
};

function createFilterElement(jsonObjects, operationFilterDivId, filterIndex)
{
    $.each(jsonObjects, function(key)
    {
        const currentFilterElement = jsonObjects[key];
        const comboboxId           = key.toLowerCase() + "_" + filterIndex.toString();

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
            clearBenchmarkResults(filterIndex);
			resetOptionsPanel();
        }

		createComboBox(currentFilterElement, comboboxId, operationFilterDivId, function() { filterMarching(comboboxId, currentFilterElement, operationFilterDivId, filterIndex); });
    });
}

function createOperationsFilter(operationFilterDivName)
{
    const operationFilterDiv   = $("div[name=\"" + operationFilterDivName + "\"");
    const operationFilterDivId = operationFilterDiv.prop("id");
    const filterIndex          = operationFilterDivId.substr(operationFilterDivId.lastIndexOf('_') + 1);

    const projectsId = "projects_" + filterIndex.toString();
    const isMultiProject = $("#" + projectsId).length > 0;

	if (isMultiProject)
	{
        const selectedProject = $("#" + projectsId + " option:selected").text();

        $.getJSON("../benchmark_data/" + selectedProject + "_indexer.json", function(jsonObjects)
        {
            createFilterElement(jsonObjects, operationFilterDivId, filterIndex);
        });
	}
    else
    {
        const operationName = $("#" + operationFilterDivId + " option:selected").text();

        $.getJSON("../benchmark_data/operations_indexer.json", function(jsonObjects)
        {
            const benchmarkResultsList = jsonObjects["OPERATIONS"][operationName];

            populateBenchmarkListFromFilter(benchmarkResultsList, filterIndex);
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


//--------------------------------------------------------------------------------------------------
// Functions called in main (Initialize)
//--------------------------------------------------------------------------------------------------
function createBenchmarkOperationFilter(operationFilterDivName, createOperationsFilterFunction)
{
    const operationFilterDiv   = $("div[name=\"" + operationFilterDivName + "\"");
    const operationFilterDivId = operationFilterDiv.prop("id");
    const filterIndex          = operationFilterDivId.substr(operationFilterDivId.lastIndexOf('_') + 1);

	$.getJSON("../benchmark_data/operations_indexer.json", function(jsonObjects)
    {
        $.each(jsonObjects, function(key)
        {
			const currentFilterElement = jsonObjects[key];
            const comboboxId           = key.toLowerCase() + "_" + filterIndex.toString();

			createComboBox(currentFilterElement, comboboxId, operationFilterDivId, createOperationsFilterFunction);
        });
    });
}
