function initViz() {
    
    var workbook, activeSheet;

    var containerDiv = document.getElementById("tableauViz"),
    url = "https://public.tableau.com/shared/WR7WYHBBR?:display_count=yes";
    
    var options = {
        width: 700,
        height: 500,
        hideTabs: true,
        hideToolbar: true,
        onFirstInteractive: function () {
            workbook = viz.getWorkbook();
            activeSheet = workbook.getActiveSheet();
        }
    };

    var viz = new tableau.Viz(containerDiv, url, options); 
}

function filterSingleValue() {
    activeSheet.applyFilterAsync(
        "Category",
        "Furniture",
        tableau.FilterUpdateType.REPLACE);
}

function addValuesToFilter() {
    activeSheet.applyFilterAsync(
        "Category",
        ["Furniture", "Technology"],
        tableau.FilterUpdateType.ADD);
}

function removeValuesFromFilter() {
    activeSheet.applyFilterAsync(
        "Category",
        "Furniture",
        tableau.FilterUpdateType.REMOVE);
}

function filterOnValue(category) {
    activeSheet.applyFilterAsync(
        "Category",
        category,
        tableau.FilterUpdateType.REPLACE);
}

function filterRangeOfValues() {
    activeSheet.applyRangeFilterAsync(
        "SUM(Sales)",
        {
            min: 500000,
            max: 1000000
        },
        tableau.FilterUpdateType.REPLACE);
}

function clearFilters() {
    activeSheet.clearFilterAsync("Category");
    activeSheet.clearFilterAsync("SUM(Sales)");
}

function swtichTab(sheetName) {
    workbook.activateSheetAsync(sheetName);
}