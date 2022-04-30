//--------------------------------------------------------------------------------------------------
// Helper Functions
//--------------------------------------------------------------------------------------------------
function createComboBox(id)
{
	// Create <select> HTML tag
	let comboBox = document.createElement("select");

	comboBox.id = id.toLowerCase();
	
	return comboBox;
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
			// Create ComboBox
			comboBox = createComboBox(key);
			
			// Add ComboBox options
			addComboBoxOption(comboBox, 0, key, true, true);
			
			let i = 1;

			$.each(jsonObjects[key], function(optionText)
			{
				addComboBoxOption(comboBox, i, optionText, false, false);
				i++;
			});
			
			// Assign onchange logic
			comboBox.onchange = function()
			{
				createOperationsFilterFunction();
			};
			
			// Add to DOM
			document.getElementById("benchmark_filters").appendChild(comboBox);
        });
    });
}
