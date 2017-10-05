var workbook, activeSheet, viz;

function initViz() {

    var containerDiv = document.getElementById("vizContainer"),
        url = "https://public.tableau.com/views/globalsuperstore_14/SalesbySub-Category?:embed=y&:display_count=yes";

    var options = {
        width: 600,
        height: 600,
        hideTabs: true,
        hideToolbar: true,
        onFirstInteractive: function () {
            listenToMarksSelection();
            workbook = viz.getWorkbook();
            activeSheet = workbook.getActiveSheet();
        }
    };

    viz = new tableau.Viz(containerDiv, url, options);
}

function filterOnFurniture() {
    activeSheet.applyFilterAsync(
        "Category",
        "Furniture",
        tableau.FilterUpdateType.REPLACE);
}

function addValuesToFilter() {
    activeSheet.applyFilterAsync(
        "Category",
        ["Office Supplies", "Technology"],
        tableau.FilterUpdateType.ADD);
}

function removeValuesFromFilter() {
    activeSheet.applyFilterAsync(
        "Category",
        "Technology",
        tableau.FilterUpdateType.REMOVE);
}

function filterRangeOfValues() {
    activeSheet = workbook.getActiveSheet();
    activeSheet.applyRangeFilterAsync(
        "SUM(Sales)",
        {
            min: 500000,
            max: 1200000
        },
        tableau.FilterUpdateType.REPLACE);
}

function clearFilters() {
    activeSheet.clearFilterAsync("Category");
    activeSheet.clearFilterAsync("SUM(Sales)");
}

function switchToTab(sheetName) {
    workbook.activateSheetAsync(sheetName);
}

function addValuesToSelection() {
    workbook.getActiveSheet().selectMarksAsync(
        "Country",
        ["United States", "Mexico"],
        tableau.FilterUpdateType.ADD);
}

function removeFromSelection() {
    workbook.getActiveSheet().selectMarksAsync(
        "SUM(Profit)",
        {
            min: 0
        },
        tableau.FilterUpdateType.REMOVE);
}

function switchTabsThenFilterThenSelectMarks() {
    workbook.activateSheetAsync("Global Sales and Profits")
        .then(function (newSheet) {
            activeSheet = newSheet;

            // It's important to return the promise so the next link in the chain
            // won't be called until the filter completes.
            return activeSheet.applyRangeFilterAsync(
                "SUM(Sales)",
                {
                    min: 50000,
                },
                tableau.FilterUpdateType.REPLACE);
        })
        .then(function (filterFieldName) {
            return activeSheet.selectMarksAsync(
                "Country",
                ["United States", "Mexico"],
                tableau.SelectionUpdateType.REPLACE);
        });
}

function querySheets() {
    var sheets = workbook.getPublishedSheetsInfo();
    var text = getSheetsAlertText(sheets);
    text = "Sheets in the workbook:\n" + text;
    alert(text);
}

function getSheetsAlertText(sheets) {
    var alertText = [];

    for (var i = 0, len = sheets.length; i < len; i++) {
        var sheet = sheets[i];
        alertText.push("  Sheet " + i);
        alertText.push(" (" + sheet.getSheetType() + ")");
        alertText.push(" - " + sheet.getName());
        alertText.push("\n");
    }

    return alertText.join("");
}

function queryDashboard() {
    workbook.activateSheetAsync("Dashboard 1")
        .then(function (dashboard) {
            var worksheets = dashboard.getWorksheets();
            var text = getSheetsAlertText(worksheets);
            text = "Worksheets in the dashboard:\n" + text;
            alert(text);
        });
}

function changeDashboardSize() {
    workbook.activateSheetAsync("Dashboard 1")
        .then(function (dashboard) {
            dashboard.changeSizeAsync({
                behavior: tableau.SheetSizeBehavior.AUTOMATIC
            });
        });
}

var dashboard, mapSheet, graphSheet;
function doSomeStuff() {
    workbook.activateSheetAsync("Dashboard 1")
        .then(function (sheet) {
            dashboard = sheet;
            mapSheet = dashboard.getWorksheets().get("Global Sales and Profits");
            graphSheet = dashboard.getWorksheets().get("Sales by Sub-Category");
            return mapSheet.applyFilterAsync("Country", "United States", tableau.FilterUpdateType.REPLACE);
        })
        .then(function () {
            // Do these two steps in parallel since they work on different sheets.
            mapSheet.applyFilterAsync("AVG(Sales)", { min: 5, max: 100000 }, tableau.FilterUpdateType.REPLACE);
            return graphSheet.applyFilterAsync("Category", "Furniture", tableau.FilterUpdateType.REPLACE);
        })
        .then(function () {
            return graphSheet.selectMarksAsync("Sub-Category (group)", "Tables", tableau.SelectionUpdateType.REPLACE);
        });
}

function exportPDF() {
    viz.showExportPDFDialog();
}

function exportImage() {
    viz.showExportImageDialog();
}

function exportCrossTab() {
    viz.showExportCrossTabDialog();
}

function exportData() {
    viz.showExportDataDialog();
}

function revertAll() {
    workbook.revertAllAsync();
}

function listenToMarksSelection() {
    viz.addEventListener(tableau.TableauEventName.MARKS_SELECTION, onMarksSelection);
}

function onMarksSelection(marksEvent) {
    return marksEvent.getMarksAsync().then(reportSelectedMarks);
}

function reportSelectedMarks(marks) {
    var html = "";

    for (var markIndex = 0; markIndex < marks.length; markIndex++) {
        var pairs = marks[markIndex].getPairs();
        html += "<b>Deatils " + (markIndex + 1) + ":</b><ul>";

        for (var pairIndex = 0; pairIndex < pairs.length; pairIndex++) {
            var pair = pairs[pairIndex];
            html += "<li><b>Field Name:</b> " + pair.fieldName;
            html += "<br/><b>Value:</b> " + pair.formattedValue + "</li>";
        }

        html += "</ul>";
    }

    var infoDiv = document.getElementById('markDetails');
    infoDiv.innerHTML = html;
}