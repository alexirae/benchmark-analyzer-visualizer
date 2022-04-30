//--------------------------------------------------------------------------------------------------
// Plot Functions
//--------------------------------------------------------------------------------------------------
function generateHistogramPlot(benchmarkInfo, outliersState, benchmarkSamples)
{
    const name = benchmarkInfo["name"];
    
    const distLength = benchmarkInfo["statistics"][outliersState]["maximum"] - benchmarkInfo["statistics"][outliersState]["minimum"];
    const xMin       = benchmarkInfo["statistics"][outliersState]["minimum"] - distLength / 2.0;
    const xMax       = benchmarkInfo["statistics"][outliersState]["maximum"] + distLength / 2.0;

    // Histogram Plot traces
    let traces = [];
    
    traces.push({
        type: "histogram",
        name: name,
        opacity: 0.8,
        x: benchmarkSamples,
        marker:
        {
            color: "rgb(99, 110, 250)"
        }
    });
    
    // Create Plot
    Plotly.newPlot
    (
        // Div
        'benchmark_results_plot_histogram', 
        
        // Data (plotly traces)
        traces,
        
        // Layout
        {
            title:
            {
                text: "Histogram",
                x: 0.043
            },
            plot_bgcolor: "rgb(235, 239, 245)",
            bargap: 0.1,
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

function generateDensityPlot(benchmarkInfo, outliersState, benchmarkSamples)
{
    const name = benchmarkInfo["name"];
    
    const distLength = benchmarkInfo["statistics"][outliersState]["maximum"] - benchmarkInfo["statistics"][outliersState]["minimum"];
    const xMin       = benchmarkInfo["statistics"][outliersState]["minimum"] - distLength / 2.0;
    const xMax       = benchmarkInfo["statistics"][outliersState]["maximum"] + distLength / 2.0;
    
    const kdeResolution = distLength * 0.01;
    
    const xRange = arange(xMin, xMax, kdeResolution);
    const yRange = new Array(benchmarkSamples.length).fill(0);

    const kde = getKDE(benchmarkSamples, xRange, benchmarkInfo["statistics"][outliersState]["std_dev"]);

    // Density Plot traces
    let traces = [];
    
    traces.push({
        type: "scatter",
        name: name,
        mode: "lines",
        fill: "tozeroy",
        x: xRange,
        y: kde,
        marker:
        {
            color: "rgb(99, 110, 250)"
        }
    });
    
    traces.push({
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
            color: "rgb(0, 0, 255)"
        },
        //secondary_y: false
    });

    // Create Plot
    Plotly.newPlot
    (
        // Div
        'benchmark_results_plot_density', 
        
        // Data (plotly traces)
        traces,
        
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

function generateBoxPlot(benchmarkInfo, outliersState, benchmarkSamples)
{
    const showOutliers = outliersState == "With outliers";
    
    const name = benchmarkInfo["name"];
    
    const distLength = benchmarkInfo["statistics"][outliersState]["maximum"] - benchmarkInfo["statistics"][outliersState]["minimum"];
    const xMin       = benchmarkInfo["statistics"][outliersState]["minimum"] - distLength / 2.0;
    const xMax       = benchmarkInfo["statistics"][outliersState]["maximum"] + distLength / 2.0;

    // Box Plot traces
    let traces = [];
    
    traces.push({
        type: "box",
        name: name,
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
    Plotly.newPlot
    (
        // Div
        'benchmark_results_plot_box', 
        
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
            zeroline: false,
            dragmode : "pan",
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
    generateHistogramPlot(benchmarkInfo, outliersState, benchmarkSamples);
    generateDensityPlot(benchmarkInfo, outliersState, benchmarkSamples);
    generateBoxPlot(benchmarkInfo, outliersState, benchmarkSamples);
}
