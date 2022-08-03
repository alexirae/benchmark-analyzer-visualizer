//--------------------------------------------------------------------------------------------------
// Helper Functions
//--------------------------------------------------------------------------------------------------
function walkPaths(obj, lastStored, project, paths)
{
	Object.keys(obj).forEach((r) => {
		const key  = lastStored ? `${lastStored}/${r}` : r;
		const elem = obj[r];

		if (typeof elem === "string")
		{
			const lastIndexOfSlash = key.lastIndexOf('/');

			let finalPath = key.substring(0, lastIndexOfSlash);

			if (project)
			{
				finalPath = project + "/" + finalPath + "/" + elem;
			}
			else
			{
				finalPath += "/" + elem;
			}

			paths.push(finalPath);
		}
		else
		{
			walkPaths(elem, key, project, paths);
		}
	});
}

function getAllPaths(obj, project)
{
	let paths = [];
	walkPaths(obj, '', project, paths);

	return paths;
}

function getMatchingPaths(tagsArray, paths)
{
	let matchingPaths = [];

	for (let i = 0; i < paths.length; ++i)
	{
		const containsAllTags = tagsArray.every(subStr => { return paths[i].toLowerCase().includes(subStr.toLowerCase()); });

		if (containsAllTags)
		{
			matchingPaths.push(paths[i]);
		}
	}

	return matchingPaths;
}

function createEmptySearchResultsTable(statistic)
{
	$("#results_table_container").empty();

    let html = "";

	html += "<table id='statistic_table'>";
    html += "<tbody id='statistic_table_body'>";

    html += "<tr>";

    html += "<td> <b>Benchmark</b> </td>";
	html += "<td> <b>" + getFormattedStatisticName(statistic) + "</b> </td>";

    html += "</tr>";

    html += "</tbody>";
    html += "</table>";

    $("#results_table_container").append(html);
}

function addStatisticToTable(matchingPath, isOutliersChecked, statistic, jsonObjects)
{
	let html = "";
	
	html += "<tr>";
	html += "<td><b>" + matchingPath + "</b></td>";
	
	const outliersKey    = isOutliersChecked ? "With outliers" : "Without outliers";
	const statisticValue = jsonObjects["statistics"][outliersKey][statistic];

	if (statistic == "num_analyzed_samples")
	{
		const totalSamples = jsonObjects["statistics"]["With outliers"][statistic];
		html += "<td>" + statisticValue + " (of " + totalSamples + ")" + ((outliersKey == "With outliers") ? "" : " [Outliers removed]") + "</td>";
	}
	else if (statistic == "std_err_percentage")
	{
		html += "<td>" + statisticValue.toFixed(2) + "%" + "</td>";
	}
	else if (statistic == "margin_percentage")
	{
		html += "<td>" + statisticValue.toFixed(2) + "% of Mean" + "</td>";
	}
	else if (statistic == "confidence_interval")
	{
		html += "<td>" + "[" + statisticValue["ci_lower"].toFixed(4) + " ms, " + statisticValue["ci_upper"].toFixed(4) + " ms] (CI " + statisticValue["ci_level"].toFixed(2) + "%)" + "</td>";    
	}
	else if (statistic == "skewness" || statistic == "kurtosis")
	{
		html += "<td>" + statisticValue.toFixed(4) + "</td>";
	}
	else
	{
		html += "<td>" + statisticValue.toFixed(4) + " ms" + "</td>";
	}

	html += "</tr>";

	$("#statistic_table_body").append(html);
}

function processPaths(tagsArray, paths, isOutliersChecked, statistic)
{
	createEmptySearchResultsTable(statistic);
	
	const matchingPaths = getMatchingPaths(tagsArray, paths);

	for (let i = 0; i < matchingPaths.length; ++i)
	{
		$.getJSON("../benchmark_data/" + matchingPaths[i] + ".json", function (jsonObjects)
		{
			addStatisticToTable(matchingPaths[i], isOutliersChecked, statistic, jsonObjects);
		});
	}
}


//--------------------------------------------------------------------------------------------------
// Functions called from events
//--------------------------------------------------------------------------------------------------
function processSearchParameters(tagsArray, isOutliersChecked, statistic)
{
	const isMultiProject = $("#projects_0").length > 0;

	if (isMultiProject)
	{
		const selectedProject = $("#projects_0 option:selected").text();

		$.getJSON("../benchmark_data/" + selectedProject + "_indexer.json", function (jsonObjects)
		{
			const paths = getAllPaths(jsonObjects, selectedProject);
			processPaths(tagsArray, paths, isOutliersChecked, statistic);
		});
	}
	else
	{
		$.getJSON("../benchmark_data/operations_indexer.json", function (jsonObjects)
		{
			const paths = getAllPaths(jsonObjects["OPERATIONS"], "");
			processPaths(tagsArray, paths, isOutliersChecked, statistic);
		});
	}
}

function canEnableSearchButton()
{
	const statisticsSelectedIndex = $("#statistics").prop('selectedIndex');
	
	const isMultiProject = $("#projects_0").length > 0;

	if (isMultiProject)
	{
		const projectsSelectedIndex = $("#projects_0").prop('selectedIndex');

		if (projectsSelectedIndex != 0 && statisticsSelectedIndex != 0)
		{
			$("#search_button").prop('disabled', false);
		}
	}
	else
	{
		if (statisticsSelectedIndex != 0)
		{
			$("#search_button").prop('disabled', false);
		}
	}
}


//--------------------------------------------------------------------------------------------------
// Events
//--------------------------------------------------------------------------------------------------
$("#search_button").click(function () {
	const serializedTags = $(".tagsinput").serialize();
	const tags           = serializedTags.split('=')[1].toString(); // remove var name (and the '=' character) from serialization
	const tagsArray      = tags.split('*');                         // * is the delimiter between tags

	const isOutliersChecked = $('#outliers').is(':checked');
	const statistic         = $('#statistics').find('option:selected').val();

	processSearchParameters(tagsArray, isOutliersChecked, statistic);
});


//--------------------------------------------------------------------------------------------------
// Functions called in main (Initialize)
//--------------------------------------------------------------------------------------------------
function createProjectsCombobox()
{
	$.getJSON("../benchmark_data/operations_indexer.json", function(jsonObjects)
    {
        $.each(jsonObjects, function(key)
        {
			if (key == "PROJECTS")
			{
				createBenchmarkOperationFilter($("#operation_filter_0").attr("name"), function(){ canEnableSearchButton(); });
			}
        });
    });
}

function createStatisticsCombobox()
{
	let comboBox = createEmptyComboBox("statistics");
	
	const comboBoxOption = createComboBoxOption(0, "Select Statistic", true, true);
	comboBox.add(comboBoxOption);
	
	$.getJSON("statistics.json", function(jsonObjects)
    {
        $.each(jsonObjects, function(key)
		{
			const optionText     = jsonObjects[key];
			const comboBoxOption = createComboBoxOption(key, optionText, false, false);
	
			comboBox.add(comboBoxOption);
        });

		comboBox.onchange = function()
		{
			canEnableSearchButton();
		};
	
		$("#statistics_container").append(comboBox);
    });
}


//--------------------------------------------------------------------------------------------------
// Main
//--------------------------------------------------------------------------------------------------
// Init tags input field
$(".tagsinput").tagsInput(
{
	delimiter: ['*'],
	placeholder: "Add benchmark tags",
});

createProjectsCombobox();
createStatisticsCombobox();
