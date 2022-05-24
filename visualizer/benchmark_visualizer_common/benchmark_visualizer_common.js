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

	comboBoxOption.value         = value;
	comboBoxOption.innerHTML     = innerHTML;
	comboBoxOption.selected      = selected;
	comboBoxOption.disabled      = disabled;

	comboBox.add(comboBoxOption);
}

function createComboBox(currentFilter, key, onChangeFunction)
{
	// Create ComboBox
	comboBox = createEmptyComboBox(key);

	// Add ComboBox options
	addComboBoxOption(comboBox, 0, key, true, true);

	let i = 1;

	$.each(currentFilter, function(optionText)
	{
		addComboBoxOption(comboBox, i, optionText, false, false);
		i++;
	});

	// Assign onchange logic
	comboBox.onchange = function()
	{
		onChangeFunction();
	};

	// Add to DOM
	document.getElementById("benchmark_filters").appendChild(comboBox);
}

function getBenchmarkJSONPathFromFilter()
{
    // Build path where the Benchmark JSON file is located
    let benchmarkJSONPath = "../benchmark_data/";

	const isMultiProject = $("#projects").length > 0;
    
	if (isMultiProject)
	{
        $("#benchmark_filters").children("select").each(function()
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

function filterMarching(comboboxId, currentFilter)
{
	const selectedOption = $("#" + comboboxId + " option:selected").text();
	const filter         = currentFilter[selectedOption];

	if (comboboxId != "operations")
	{
		createFilter(filter);
	}
	else
	{
		populateBenchmarkListFromFilter(filter);
	}
};

function createFilter(jsonObjects)
{
    $.each(jsonObjects, function(key)
    {
        const currentFilter = jsonObjects[key];
        const comboboxId    = key.toLowerCase();

        // combobox already exists, cleanup
        if($("#" + comboboxId).length > 0)
        {
            let deleteComboboxes = false;

            $("#benchmark_filters").children("select").each(function()
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

		createComboBox(currentFilter, key, function() { filterMarching(comboboxId, currentFilter); });
    });
}

function createOperationsFilter()
{
    const isMultiProject = $("#projects").length > 0;

	if (isMultiProject)
	{
        const selectedProject = $("#projects option:selected").text();

        $.getJSON("../benchmark_data/" + selectedProject + "_indexer.json", function(jsonObjects)
        {
            createFilter(jsonObjects);
        });
	}
    else
    {
        const operation = $("#operations option:selected").text();

        $.getJSON("../benchmark_data/operations_indexer.json", function(jsonObjects)
        {
            const filter = jsonObjects["OPERATIONS"][operation];

            populateBenchmarkListFromFilter(filter);
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
    $("#optionsPanel").hide();
    $("#showOutliers").prop("checked", true);
}

//--------------------------------------------------------------------------------------------------
// Functions called in main (Initialize)
//--------------------------------------------------------------------------------------------------
function createBenchmarkFilters(createOperationsFilterFunction)
{
	$.getJSON("../benchmark_data/operations_indexer.json", function(jsonObjects)
    {
        $.each(jsonObjects, function(key)
        {
			const currentFilter = jsonObjects[key];

			createComboBox(currentFilter, key, createOperationsFilterFunction);
        });
    });
}
