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

function createComboBoxOption(value, innerHTML, selected, disabled)
{
	let comboBoxOption = document.createElement("option");

	comboBoxOption.value        = value;
	comboBoxOption.innerHTML    = innerHTML;
	comboBoxOption.selected     = selected;
	comboBoxOption.disabled     = disabled;

    return comboBoxOption;
}

function createFilterComboBox(currentFilterElement, comboboxId, onChangeFunction)
{
	// Create ComboBox
	let comboBox = createEmptyComboBox(comboboxId);

	// Add ComboBox options
    const title = comboboxId.substr(0, comboboxId.lastIndexOf('_')).toUpperCase();

	const comboBoxOption = createComboBoxOption(0, title, true, true);
    comboBox.add(comboBoxOption);

	let i = 1;

	$.each(currentFilterElement, function(optionText)
	{
        const comboBoxOption = createComboBoxOption(i, optionText, false, false);
        comboBox.add(comboBoxOption);

		++i;
	});

	// Assign onchange logic
	comboBox.onchange = function()
	{
		onChangeFunction();
	};

    return comboBox;	
}

function getBenchmarkJSONPathFromFilterIndex(filterIndex)
{
    // Build path where the Benchmark JSON file is located
    let benchmarkJSONPath = "../benchmark_data/";

    const projectsId     = "projects_" + filterIndex.toString();
	const isMultiProject = $("#" + projectsId).length > 0;
    
	if (isMultiProject)
	{
        const operationFilterDivId = "operation_filter_" + filterIndex.toString();

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
        const operationId   = "operations_" + filterIndex.toString();
        const operationName = $("#" + operationId + " option:selected").text();

        benchmarkJSONPath += operationName + "/";
    }

	return benchmarkJSONPath;
}

function filterMarching(currentFilterElementName, currentFilterElement, operationFilterDivName)
{
    const operationFilterDiv   = $("div[name=\"" + operationFilterDivName + "\"");
    const operationFilterDivId = operationFilterDiv.prop("id");
    const filterIndex          = operationFilterDivId.substr(operationFilterDivId.lastIndexOf('_') + 1);

    const comboboxId     = currentFilterElementName + "_" + filterIndex;
	const selectedOption = $("#" + comboboxId + " option:selected").text();
	const jsonObjects    = currentFilterElement[selectedOption];

    const isNotOperationsFilterElement = comboboxId.substr(0, comboboxId.lastIndexOf('_')) != "operations";

	if (isNotOperationsFilterElement)
	{
		createFilterElement(jsonObjects, operationFilterDivName);
	}
	else
	{
		populateBenchmarkListFromFilter(jsonObjects, filterIndex);
	}
};

function createFilterElement(jsonObjects, operationFilterDivName)
{
    const operationFilterDiv   = $("div[name=\"" + operationFilterDivName + "\"");
    const operationFilterDivId = operationFilterDiv.prop("id");
    const filterIndex          = operationFilterDivId.substr(operationFilterDivId.lastIndexOf('_') + 1);

    $.each(jsonObjects, function(key)
    {
        const currentFilterElement = jsonObjects[key];
        const comboboxId           = key.toLowerCase() + "_" + filterIndex.toString();

        // combobox already exists, cleanup
        if($("#" + comboboxId).length > 0)
        {
            let deleteComboboxes = false;

            operationFilterDiv.children("select").each(function()
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

		const comboBox = createFilterComboBox(currentFilterElement, comboboxId, function() { filterMarching(key.toLowerCase(), currentFilterElement, operationFilterDivName); });
        operationFilterDiv.append(comboBox);
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
            createFilterElement(jsonObjects, operationFilterDivName);
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

function populateBenchmarkListComboBox(benchmarkListComboBoxId, benchmarkResultsList)
{
	let benchmarkListComboBox = $("#" + benchmarkListComboBoxId);
	
    benchmarkListComboBox.empty();
	
    benchmarkListComboBox.attr("style", "color: black");
    benchmarkListComboBox.append("<option selected='true' value='0' disabled>Choose Benchmark Result</option>");
    benchmarkListComboBox.prop("selectedIndex", 0);
    
    for (let i = 0; i < benchmarkResultsList.length; ++i)
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

            const comboBox = createFilterComboBox(currentFilterElement, comboboxId, createOperationsFilterFunction);
            operationFilterDiv.append(comboBox);
        });
    });
}
