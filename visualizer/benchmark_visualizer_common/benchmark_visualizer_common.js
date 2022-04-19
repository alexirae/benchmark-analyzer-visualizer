//--------------------------------------------------------------------------------------------------
// Helper Functions
//--------------------------------------------------------------------------------------------------
function generateComboBox(id)
{
	// Create <select> HTML tag
	let comboBox = document.createElement("select");

	comboBox.id = id;
	
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
function populateOperationsComboBox(comboBoxFunction)
{
	$.getJSON("../benchmark_data/operations_indexer.json", function(jsonObjects)
    {
        $.each(jsonObjects, function(key)
        {
			let lowerCaseKey = key.toLowerCase();
			
			comboBox = generateComboBox(lowerCaseKey);
			
			comboBox.onchange = function()
			{
				comboBoxFunction();
			};
	
			// Create the options for the comboBox
			addComboBoxOption(comboBox, 0, key, true, true);
			
			let i = 1;

			$.each(jsonObjects[key], function(operation)
			{
				addComboBoxOption(comboBox, i, operation, false, false);
				i++;
			});
			
			document.getElementById("benchmark_filters").appendChild(comboBox);
        });
    });
}
