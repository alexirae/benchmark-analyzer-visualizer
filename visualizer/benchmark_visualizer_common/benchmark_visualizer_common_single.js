//--------------------------------------------------------------------------------------------------
// Plot Functions
//--------------------------------------------------------------------------------------------------
function generateBoxPlot(benchmarkInfo, outliersState, benchmarkSamples)
{
    const stats = benchmarkInfo["statistics"][outliersState];

    const showOutliers = outliersState == "With outliers";
    
    const distLength = stats["maximum"] - stats["minimum"];
    const xMin       = stats["minimum"] - distLength / 4.0;
    const xMax       = stats["maximum"] + distLength / 4.0;

    // Box Plot traces
    let traces = [];
    
    traces.push({
        type: "box",
        name: benchmarkInfo["name"],
        quartilemethod: "inclusive",
        boxmean: "sd",
        pointpos: 0,
        jitter: 0,
        boxpoints: showOutliers ? "outliers" : false,
        x: benchmarkSamples,
        marker:
        {
            color: "rgb(99, 110, 250)"
        }
    });

    // Create Box Plot
    const divName                    = "benchmark_results_plot_box";
    const benchmarkResultsPlotBoxDiv = createElementWithId("div", divName);

    document.getElementById("benchmark_results_plots").appendChild(benchmarkResultsPlotBoxDiv);

    Plotly.newPlot
    (
        // Div
        divName, 
        
        // Data (plotly traces)
        traces,
        
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
            //zeroline: false,
            yaxisTitleText: "",
            xaxis:
            {
                title: "Time (ms)",
                gridcolor: "rgb(255, 255, 255)",
                zeroline: false,
                autorange: false,
                range: [xMin, xMax]
            },
            yaxis:
            {
                zeroline: false,
                visible: false
            }
        },
        
        // Plot options
        {
            
        }
    )
}

function generateDensityPlot(benchmarkInfo, outliersState, benchmarkSamples)
{
    const stats = benchmarkInfo["statistics"][outliersState];

    const showOutliers = outliersState == "With outliers";

    const distLength = stats["maximum"] - stats["minimum"];
    const xMin       = stats["minimum"] - distLength / 4.0;
    const xMax       = stats["maximum"] + distLength / 4.0;
    
    const kdeResolution = distLength * 0.01;
    
    const xRange = arange(xMin, xMax, kdeResolution);

    // Adaptative downsampling
    const samplesToProcessWithKDE = (benchmarkSamples.length < 500) ? benchmarkSamples : downSample1D(benchmarkSamples, benchmarkSamples.length, Math.round(20.0 * Math.pow(benchmarkSamples.length, 0.4)));

    const kde = getKDE(samplesToProcessWithKDE, xRange, stats["std_dev"]);

    const plotColor = "rgb(99, 110, 250)";

    // Density Plot traces
    let densityItems = [];
    
    densityItems.push({
        type: "scattergl",
        name: benchmarkInfo["name"],
        mode: "lines",
        fill: "tozeroy",
        x: xRange,
        y: kde,
        marker:
        {
            color: plotColor
        }
    });
    
    const markersPlot = createMarkersPlot(plotColor, benchmarkInfo, showOutliers);
    densityItems.push(markersPlot);

    // Create Plot
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

function generateHistogramPlot(benchmarkInfo, outliersState, benchmarkSamples)
{
    const stats = benchmarkInfo["statistics"][outliersState];

    const distLength = stats["maximum"] - stats["minimum"];
    const xMin       = stats["minimum"] - distLength / 4.0;
    const xMax       = stats["maximum"] + distLength / 4.0;

    const plotColor = "rgb(99, 110, 250)";

    // Histogram Plot traces
    let histogramPlotItems = [];
    
    histogramPlotItems.push({
        type: "histogram",
        name:  benchmarkInfo["name"],
        opacity: 0.6,
        x: benchmarkSamples,
        marker:
        {
            color: plotColor
        }
    });
    
    const markersPlot = createMarkersPlot(plotColor, benchmarkInfo, showOutliers);
    histogramPlotItems.push(markersPlot);

    // Create Plot
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
            bargap: 0,
            xaxis:
            {
                title: "Time (ms)",
                zeroline: false,
                autorange: false,
                range: [xMin, xMax]
            },
            yaxis:
            {
                title: "Count",
                zeroline: false,
                gridcolor: "rgb(255, 255, 255)"
            }
        },
        
        // Plot options
        {
            
        }
    );
}

function generateAndDisplayPlots(benchmarkInfo, showOutliers)
{
    let outliersState    = "Without outliers";
    let benchmarkSamples = [...benchmarkInfo["sorted_no_outliers_samples"]];

    if (showOutliers)
    {
        outliersState = "With outliers";
        benchmarkSamples.unshift(...benchmarkInfo["sorted_lower_outliers_samples"]);
        benchmarkSamples.push(...benchmarkInfo["sorted_upper_outliers_samples"]);
    }

    // Plots
    generateBoxPlot(benchmarkInfo, outliersState, benchmarkSamples);
    generateDensityPlot(benchmarkInfo, outliersState, benchmarkSamples);
    generateHistogramPlot(benchmarkInfo, outliersState, benchmarkSamples);
}


//--------------------------------------------------------------------------------------------------
// Helper Functions
//--------------------------------------------------------------------------------------------------
function displayJSONData(benchmarkInfo)
{
    const showOutliers = $("#showOutliers").prop("checked");
    
    $("#optionsPanel").show();
    addTable("#benchmark_statistics", [benchmarkInfo], showOutliers);
    generateAndDisplayPlots(benchmarkInfo, showOutliers);
}
