//--------------------------------------------------------------------------------------------------
// Box Plot Functions
//--------------------------------------------------------------------------------------------------
function addBoxPlotTraces(boxPlotItems, itemColor, benchmarkInfo, benchmarkSamples, showOutliers)
{
    boxPlotItems.push({
        type: "box",
        name: benchmarkInfo["name"],
        quartilemethod: "inclusive",
        boxmean: "sd",
        pointpos: 0,
        jitter: 0,
        boxpoints: showOutliers ? "outliers" : false,
        y: benchmarkSamples,
        marker:
        {
            color: itemColor
        },
    });
}

function displayBoxPlot(boxPlotItems)
{
    Plotly.newPlot
    (
        // Div
        'benchmark_results_plot_box', 
        
        // Data
        boxPlotItems,
        
        // Layout
        {
            title:
            {
                text: "Box Plot",
                x: 0.043
            },
            plot_bgcolor: "rgb(235, 239, 245)",
            boxmode: "overlay",
            showlegend: false,
            dragmode : "pan",
            //height: 600,
            yaxis:
            {
                gridcolor: "rgb(255, 255, 255)",
                zeroline: false
            }
        },
        
        // Plot options
        {
            //scrollZoom: true
        }
    );
}


//--------------------------------------------------------------------------------------------------
// Density Plot Functions
//--------------------------------------------------------------------------------------------------
function addDensityPlotTraces(densityItems, itemColor, benchmarkInfo, benchmarkSamples, showOutliers)
{
    const outliersState = showOutliers ? "With outliers" : "Without outliers";
    
    const distLength = benchmarkInfo["statistics"][outliersState]["maximum"] - benchmarkInfo["statistics"][outliersState]["minimum"];
    const xMin       = benchmarkInfo["statistics"][outliersState]["minimum"] - distLength / 2.0;
    const xMax       = benchmarkInfo["statistics"][outliersState]["maximum"] + distLength / 2.0;
    
    const kdeResolution = distLength * 0.01;
    
    const xRange = arange(xMin, xMax, kdeResolution);
    const yRange = new Array(benchmarkSamples.length).fill(0);
    
    const kde = getKDE(benchmarkSamples, xRange, benchmarkInfo["statistics"][outliersState]["std_dev"]);

    densityItems.push({
        type: "scatter",
        name: benchmarkInfo["name"],
        mode: "lines",
        fill: "tozeroy",
        x: xRange,
        y: kde,
        marker:
        {
            color: itemColor
        },
    });
    
    densityItems.push({
        type: "box",
        name: "",
        x: benchmarkSamples,
        y: yRange,
        boxpoints: 'all',
        jitter: 0,
        fillcolor: "rgba(255,255,255,0)",
        line_color: "rgba(255,255,255,0)",
        hoveron: 'points',
        marker:
        {
            symbol: "line-ns-open",
            color: itemColor
        },
        //secondary_y: false
    });
}

function displayDensityPlot(densityItems)
{
    Plotly.newPlot
    (
        // Div
        'benchmark_results_plot_density', 
        
        // Data
        densityItems,
        
        // Layout
        {
            title:
            {
                text: "Density Plot (KDE)",
                x: 0.043
            },
            //height: 600,
            showlegend: false,
            plot_bgcolor: "rgb(235, 239, 245)",
            xaxis:
            {
                title: "Time (ms)",
                zeroline: false,
                showgrid: false
            },
            yaxis:
            {
                zeroline: false,
                gridcolor: "rgb(255, 255, 255)"
            }
        },
        
        
        // Plot options
        {
            
        }
    );
}


//--------------------------------------------------------------------------------------------------
// Helper Functions
//--------------------------------------------------------------------------------------------------
function clearDisplayedBenchmarkInfo()
{
    $("#benchmark_results_plot_density").empty();
    $("#benchmark_results_plot_box").empty();

    // Only for compare mode
    if ($("#comparison_results").length > 0)
    {
        $("#comparison_results").empty();
    }
}

function getJSONData(jsonFilePath)
{
    return new Promise(function(resolve, reject)
    {
        let xhttp = new XMLHttpRequest();
        
        xhttp.onreadystatechange = function()
        {
            if(this.readyState == 4)
            {
                if(this.status == 200)
                {
                    resolve(JSON.parse(this.responseText));
                }
                else
                {
                    reject('getJSONData call Failed');  
                }
            }
        };

        xhttp.open("GET", jsonFilePath);
        xhttp.send();
    });
}

function retrieveAndDisplayJSONData(operation, benchmarkIds, isCompareMode)
{
    // Create calls to collect JSON benchmark data
    let calls = [];

    for (let i = 0; i < benchmarkIds.length; i++)
    {
        let jsonFilePath = "../benchmark_data/" + operation + "/" + benchmarkIds[i] + ".json";
        calls.push(getJSONData(jsonFilePath));
    }

    // Wait for all calls to be done so we can display plots
    Promise.all(calls).then(function(benchmarkInfos)
    {
        const showOutliers = $("#showOutliers").prop("checked");
        
        if (isCompareMode)
        {
            addTable("#comparison_results", benchmarkInfos, showOutliers);
        }
        
        let boxPlotItems = [];
        let densityItems = [];

        for (let i = 0; i < benchmarkInfos.length; i++)
        {
            const benchmarkInfo = benchmarkInfos[i];
            
            let benchmarkSamples = [...benchmarkInfo["sorted_no_outliers_samples"]];
    
            if (showOutliers)
            {
                benchmarkSamples.unshift(...benchmarkInfo["sorted_lower_outliers_samples"]);
                benchmarkSamples.push(...benchmarkInfo["sorted_upper_outliers_samples"]);
            }
            
            const itemColor = getRandomHexColor();
            
            addBoxPlotTraces(boxPlotItems, itemColor, benchmarkInfo, benchmarkSamples, showOutliers);
            addDensityPlotTraces(densityItems, itemColor, benchmarkInfo, benchmarkSamples, showOutliers);
        }
        
        // Show Plots
        displayBoxPlot(boxPlotItems);
        displayDensityPlot(densityItems);
        
    }).catch(function(reason)
    {
        console.log(reason);
    });
}

function populateBenchmarkListComboBox(comboboxName)
{
    let benchmarkListComboBox = $(comboboxName);

    benchmarkListComboBox.empty();

    benchmarkListComboBox.append("<option selected='true' value='0' disabled>Choose Benchmark Result</option>");
    benchmarkListComboBox.prop("selectedIndex", 0);

    const operation = $("#operations option:selected").text()

    $.getJSON("../benchmark_data/operations_indexer.json", function(jsonObjects)
    {
        const operationBenchmarkList = jsonObjects["OPERATIONS"][operation];
        
        for (let i = 0; i < operationBenchmarkList.length; i++)
        {
            benchmarkListComboBox.append($("<option></option>").attr("value", i + 1).text(operationBenchmarkList[i]));
        } 
    });

    clearDisplayedBenchmarkInfo();
}

function createOperationsFilter()
{
	populateBenchmarkListComboBox("#benchmark_start");
	populateBenchmarkListComboBox("#benchmark_end");
};
