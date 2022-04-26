//------------------------------------------------------------------------------------------------
// Utils Vars
//------------------------------------------------------------------------------------------------
const twoPI               = 2.0 * Math.PI;
const one_over_sqrt_twoPI = 1.0 / Math.sqrt(twoPI);


//------------------------------------------------------------------------------------------------
// Utils Functions
//------------------------------------------------------------------------------------------------
function arange(start, stop, step)
{
    step = step || 1;
    
    let arr = [];
    
    for (let i = start; i < stop; i += step)
    {
        arr.push(i);
    }
    
    return arr;
}

//////////////////////////////////////////////////////////////////////////////////////////////////

function gaussKDE(xi, x, h)
{
	const x_minus_xi_over_h = (x - xi) / h;
    return one_over_sqrt_twoPI * Math.exp(x_minus_xi_over_h * x_minus_xi_over_h * -0.5);
}

//////////////////////////////////////////////////////////////////////////////////////////////////

function getKDE(samples, x_range, std_dev)
{
    let kde = [];
	
    const numSamples = samples.length;
    const bwScott    = 1.06 * std_dev * Math.pow(numSamples, -1/5);
	
	const numSamples_x_bwScott = numSamples * bwScott;

    for (i = 0; i < x_range.length; ++i)
    {
        let temp = 0;
        
        for (j = 0; j < numSamples; ++j)
        {
            temp = temp + gaussKDE(x_range[i], samples[j], bwScott);
        }
        
        kde.push(1.0 / numSamples_x_bwScott * temp);
    }
    
    return kde;
}

//////////////////////////////////////////////////////////////////////////////////////////////////

function getRandomHexColor()
{
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

//////////////////////////////////////////////////////////////////////////////////////////////////

function getFormattedStatisticName(statisticsVarName)
{
    switch(statisticsVarName)
    {
        case "num_analyzed_samples":
            return "Num Analyzed Samples";
        case "minimum":
            return "Min";
        case "lower_fence":
            return "Lower Fence";
        case "q1":
            return "Q1";
        case "mean":
            return "Mean";
        case "median":
            return "Median";
        case "q3":
            return "Q3";
        case "upper_fence":
            return "Upper Fence";
        case "maximum":
            return "Max";
        case "iqr":
            return "Inter Quartile Range (IQR)";
        case "std_dev":
            return "Standard Deviation";
        case "std_err":
            return "Standard Error";
        case "std_err_percentage":
            return "Standard Error Percentage";
        case "margin":
            return "Margin";
        case "margin_percentage":
            return "Margin Percentage";
        case "confidence_interval":
            return "Confidence Interval";
        case "skewness":
            return "Skewness";
        case "kurtosis":
            return "Kurtosis";
        default:
            return "";
    } 
}

//////////////////////////////////////////////////////////////////////////////////////////////////

function addTable(divId, benchmarkInfos, showOutliers)
{
    $(divId).empty();

    let html = "<table>";
    html += "<tbody>";

    // ID
    html += "<tr>";
    html += "<td>" + "<b>" + "ID" + "</b>" + "</td>";
    benchmarkInfos.forEach(function(benchmarkInfo){html += "<th>" + benchmarkInfo["name"] + "</th>";});
    html += "</tr>";
    
    // Operation
    html += "<tr>";
    html += "<td>" + "<b>" + "Operation" + "</b>" + "</td>";
    benchmarkInfos.forEach(function(benchmarkInfo){html += "<td>" + benchmarkInfo["operation"] + "</td>";});
    html += "</tr>";
    
    // Statistics
    $.each(benchmarkInfos[0]["statistics"]["With outliers"], function(key)
    {
        const outliersState = showOutliers ? "With outliers" : "Without outliers";
        
        const currentStatistics = [];
        benchmarkInfos.forEach(function(benchmarkInfo){currentStatistics.push(benchmarkInfo["statistics"][outliersState][key]);});

        html += "<tr>";
        html += "<td>" + "<b>" + getFormattedStatisticName(key) + "</b>" + "</td>";
        
        if (key == "num_analyzed_samples")
        {
            benchmarkInfos.forEach(function(benchmarkInfo)
            {
                const totalSamples     = benchmarkInfo["statistics"]["With outliers"][key];
                const currentStatistic = benchmarkInfo["statistics"][outliersState][key];
                
                html += "<td>" + currentStatistic + " (of " + totalSamples + ")" + (showOutliers ? "" : " [Outliers removed]") + "</td>";       
            }); 
        }
        else if (key == "std_err_percentage")
        {
            currentStatistics.forEach(function(currentStatistic){html += "<td>" + currentStatistic.toFixed(2) + "%" + "</td>";});
        }
        else if (key == "margin_percentage")
        {
            currentStatistics.forEach(function(currentStatistic){html += "<td>" + currentStatistic.toFixed(2) + "% of Mean" + "</td>";});
        }
        else if (key == "confidence_interval")
        {
            currentStatistics.forEach(function(currentStatistic){html += "<td>" + "[" + currentStatistic["ci_lower"].toFixed(4) + " ms, " + currentStatistic["ci_upper"].toFixed(4) + " ms] (CI " + currentStatistic["ci_level"].toFixed(2) + "%)" + "</td>";});    
        }
        else if (key == "skewness" || key == "kurtosis")
        {
            currentStatistics.forEach(function(currentStatistic){html += "<td>" + currentStatistic.toFixed(4) + "</td>";});
        }
        else
        {
            currentStatistics.forEach(function(currentStatistic){html += "<td>" + currentStatistic.toFixed(4) + " ms" + "</td>";});
        }
        
        html += "</tr>";
    });

    html += "</tbody>";
    html += "</table>";

    $(divId).append(html);
}

//////////////////////////////////////////////////////////////////////////////////////////////////
