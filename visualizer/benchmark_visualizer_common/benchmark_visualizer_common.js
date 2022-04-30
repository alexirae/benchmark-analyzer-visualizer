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
