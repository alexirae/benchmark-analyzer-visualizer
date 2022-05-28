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
$("#file_input").change(function readFile(e)
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

$("#show_outliers").change(function()
{
    const contents = sessionStorage.getItem("fileContentPersistence");
    getBenchmarkData(contents);
});

$("#hide_outliers").change(function()
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
