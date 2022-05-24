//--------------------------------------------------------------------------------------------------
// Global Vars
//--------------------------------------------------------------------------------------------------
var g_benchmarkResultsArray = [];


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
    const divName                    = "benchmark_results_plot_box";
    const benchmarkResultsPlotBoxDiv = createElementWithId("div", divName);

    document.getElementById("benchmark_results_plots").appendChild(benchmarkResultsPlotBoxDiv);

    Plotly.newPlot
    (
        // Div
        divName,
        
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
            yaxis:
            {
                gridcolor: "rgb(255, 255, 255)",
                zeroline: false
            }
        },
        
        // Plot options
        {
            responsive: true
        }
    );
}


//--------------------------------------------------------------------------------------------------
// Density Plot Functions
//--------------------------------------------------------------------------------------------------
function addDensityPlotTraces(densityItems, itemColor, benchmarkInfo, benchmarkSamples, showOutliers)
{
    const outliersState = showOutliers ? "With outliers" : "Without outliers";
    
    const stats = benchmarkInfo["statistics"][outliersState];

    const distLength = stats["maximum"] - stats["minimum"];
    const xMin       = stats["minimum"] - distLength / 4.0;
    const xMax       = stats["maximum"] + distLength / 4.0;
    
    const kdeResolution = distLength * 0.01;
    
    const xRange = arange(xMin, xMax, kdeResolution);

    // Adaptative downsampling
    const samplesToProcessWithKDE = (benchmarkSamples.length < 500) ? benchmarkSamples : downSample1D(benchmarkSamples, benchmarkSamples.length, Math.round(20.0 * Math.pow(benchmarkSamples.length, 0.4)));

    const kde = getKDE(samplesToProcessWithKDE, xRange, stats["std_dev"]);

    densityItems.push({
        type: "scattergl",
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
    
    const markersPlot = createMarkersPlot(itemColor, benchmarkInfo, showOutliers);
    densityItems.push(markersPlot);
}

function displayDensityPlot(densityItems)
{
    const divName                        = "benchmark_results_plot_density";
    const benchmarkResultsPlotDensityDiv = createElementWithId("div", divName);

	document.getElementById("benchmark_results_plots").appendChild(benchmarkResultsPlotDensityDiv);

    Plotly.newPlot
    (
        // Div
        divName,
        
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
            responsive: true
        }
    );
}


//--------------------------------------------------------------------------------------------------
// Histogram Plot Functions
//--------------------------------------------------------------------------------------------------
function addHistogramPlotTraces(histogramPlotItems, itemColor, benchmarkInfo, benchmarkSamples, showOutliers)
{
    histogramPlotItems.push({
        type: "histogram",
        name: benchmarkInfo["name"],
        //histnorm: "probability density", // enable this if you want to have a curve similar to a KDE
        opacity: 0.6,
        x: benchmarkSamples,
        marker:
        {
            color: itemColor
        }
    });

    const markersPlot = createMarkersPlot(itemColor, benchmarkInfo, showOutliers);
    histogramPlotItems.push(markersPlot);
}

function displayHistogramPlot(histogramPlotItems)
{
    const divName                          = "benchmark_results_plot_histogram";
    const benchmarkResultsPlotHistogramDiv = createElementWithId("div", divName);

	document.getElementById("benchmark_results_plots").appendChild(benchmarkResultsPlotHistogramDiv);

    Plotly.newPlot
    (
        // Div
        divName,
        
        // Data (plotly traces)
        histogramPlotItems,
        
        // Layout
        {
            title:
            {
                text: "Histogram",
                x: 0.043
            },
            showlegend: false,
            plot_bgcolor: "rgb(235, 239, 245)",
            barmode: "overlay",
            bargap: 0,
            xaxis:
            {
                title: "Time (ms)",
                zeroline: false,
                autorange: true,
            },
            yaxis:
            {
                zeroline: false,
                gridcolor: "rgb(255, 255, 255)"
            }
        },
        
        // Plot options
        {
            responsive: true
        }
    );
}


//--------------------------------------------------------------------------------------------------
// Helper Functions
//--------------------------------------------------------------------------------------------------
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

function retrieveAndDisplayJSONData(benchmarkJSONPath, benchmarkIds, plotItemsColor)
{
    // Create calls to collect JSON benchmark data
    let calls = [];

    for (let i = 0; i < benchmarkIds.length; i++)
    {
        const jsonFilePath = benchmarkJSONPath + benchmarkIds[i] + ".json";
        calls.push(getJSONData(jsonFilePath));
    }

    // Wait for all calls to be done so we can display plots
    Promise.all(calls).then(function(benchmarkInfos)
    {
        $("#optionsPanel").show();

        const showOutliers = $("#showOutliers").prop("checked");
        
        const isCompareMode = $("#comparison_results").length > 0;

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

            const itemColor = plotItemsColor[i];
            
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

function setComboBoxSelectionAndPlot(combobox, prevSelectedIndex, prevSelectedItem, range, benchmarkJSONPath)
{
    // Set combobox selection and plot
    if (prevSelectedIndex != 0)
    {
        const idx = range.indexOf(prevSelectedItem) + 1;
        combobox.prop("selectedIndex", idx);

        let benchmarkIdsToPlot = getBenchmarkIdsToPlot();

        let plotItemsColor = [];

        for (let i = 0; i < benchmarkIdsToPlot.length; ++i)
        {
            const randColor = getRandomHexColor();
            plotItemsColor.push(randColor);
        }

        retrieveAndDisplayJSONData(benchmarkJSONPath, benchmarkIdsToPlot, plotItemsColor);
    }
}

function clearBenchmarkResults()
{
    $("#benchmark_start").empty();
    $("#benchmark_end").empty();
}

function populateBenchmarkListFromFilter(filter)
{
    populateBenchmarkListComboBox("#benchmark_start", filter);
    populateBenchmarkListComboBox("#benchmark_end",   filter);
}

function getBenchmarkResultsArray()
{
	return g_benchmarkResultsArray;
}


//--------------------------------------------------------------------------------------------------
// Functions called from events
//--------------------------------------------------------------------------------------------------
function updateBenchmarkListComboBox(comboboxName, firstBenchmarkComboBoxRange, secondBenchmarkComboBoxRange)
{
    // Cache previous selection
    const prevSelectedIndex = $(comboboxName + " option:selected").index();
    const prevSelectedItem  = $(comboboxName + " option:selected").text();
    
    // Reset Combobox
    const combobox = $(comboboxName);
    combobox.empty();
    combobox.append("<option selected='true' disabled>Choose Benchmark Result</option>");
    
    const benchmarkJSONPath = getBenchmarkJSONPathFromFilter();

    // Update Combobox accordingly and only display benchmark items based on combobox selection
    if (comboboxName == "#benchmark_start")
    {
        // Fill combobox with new range
        for (let i = 0; i < firstBenchmarkComboBoxRange.length; i++)
        {
            const benchmarkId = firstBenchmarkComboBoxRange[i];
            combobox.append($("<option></option>").attr("value", i + 1).text(benchmarkId));
        }
        
        setComboBoxSelectionAndPlot(combobox, prevSelectedIndex, prevSelectedItem, firstBenchmarkComboBoxRange, benchmarkJSONPath);
    }
    else if (comboboxName == "#benchmark_end")
    {
        // Fill combobox with new range
        for (let i = 0; i < secondBenchmarkComboBoxRange.length; i++)
        {
            const benchmarkId = secondBenchmarkComboBoxRange[i];
            combobox.append($("<option></option>").attr("value", firstBenchmarkComboBoxRange.length + i + 1).text(benchmarkId));
        }
        
        setComboBoxSelectionAndPlot(combobox, prevSelectedIndex, prevSelectedItem, secondBenchmarkComboBoxRange, benchmarkJSONPath);
    }
}

function getBenchmarkData()
{
	const operationsSelectedIndex = $("#operations").prop("selectedIndex");
	
    const benchmarkStartSelectedIndex = $("#benchmark_start").prop("selectedIndex");
    const benchmarkEndSelectedIndex   = $("#benchmark_end").prop("selectedIndex");

    if (operationsSelectedIndex     == undefined || 
        benchmarkStartSelectedIndex == undefined || 
        benchmarkEndSelectedIndex   == undefined || 
        operationsSelectedIndex     == 0         || 
        benchmarkStartSelectedIndex == 0         || 
        benchmarkEndSelectedIndex   == 0)
    {
        return;
    }

    const benchmarkJSONPath  = getBenchmarkJSONPathFromFilter();
    const benchmarkIdsToPlot = getBenchmarkIdsToPlot();

    // Keep items color when switching between outliers modes
    let plotItemsColor = [];

    for (let i = 0; i < benchmark_results_plot_box.data.length; ++i)
    {
        plotItemsColor.push(benchmark_results_plot_box.data[i].marker.color);
    }

    retrieveAndDisplayJSONData(benchmarkJSONPath, benchmarkIdsToPlot, plotItemsColor);
}
