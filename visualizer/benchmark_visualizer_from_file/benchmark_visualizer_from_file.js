//--------------------------------------------------------------------------------------------------
// Functions called from events
//--------------------------------------------------------------------------------------------------
function getBenchmarkData(contents)
{
    if (contents)
    {
        const benchmarkInfo = JSON.parse(contents);
        displayJSONData(benchmarkInfo);
    }
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
        
        resetOptionsPanel();
        getBenchmarkData(contents);
    };
    
    reader.readAsText(file);
});

$("#showOutliers").change(function()
{
    const contents = sessionStorage.getItem("fileContentPersistence");
    getBenchmarkData(contents);
});

$("#hideOutliers").change(function()
{
    const contents = sessionStorage.getItem("fileContentPersistence");
    getBenchmarkData(contents);
});

window.onunload = function()
{
    sessionStorage.clear();
}


//--------------------------------------------------------------------------------------------------
// Main
//--------------------------------------------------------------------------------------------------
resetOptionsPanel();
