//--------------------------------------------------------------------------------------------------
// Functions called from events
//--------------------------------------------------------------------------------------------------
function getBenchmarkData(benchmarkInfo)
{
    const showOutliers = $("#showOutliers").prop("checked");

    addTable("#benchmark_statistics", [benchmarkInfo], showOutliers);
    generateAndDisplayPlots(benchmarkInfo, showOutliers);
}


//--------------------------------------------------------------------------------------------------
// Events
//--------------------------------------------------------------------------------------------------
$("#fileInput").change(function readFile(e)
{
    const file = e.target.files[0];
    
    if (!file)
    {
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e)
    {
        const contents = e.target.result;
        sessionStorage.setItem("fileContentPersistence", contents);
        
        const benchmarkInfo = JSON.parse(contents);
        getBenchmarkData(benchmarkInfo);
    };
    
    reader.readAsText(file);
});

window.onunload = function()
{
    sessionStorage.clear();
}


//--------------------------------------------------------------------------------------------------
// Functions called from HTML
//--------------------------------------------------------------------------------------------------
function changeOutliers()
{
    const contents = sessionStorage.getItem("fileContentPersistence");
    
    if (contents)
    {
        const benchmarkInfo = JSON.parse(contents);
        getBenchmarkData(benchmarkInfo);
    }
}
