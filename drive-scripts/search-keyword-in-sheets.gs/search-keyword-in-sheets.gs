// Search Keyword in Sheets — Lucky's original Apps Script (from his Google Drive,
// Apps Script project "search for word and find the tab and cell", last modified June 16, 2024).
// Adds a "Custom Scripts" menu to a Google Sheet: type a keyword, and it pops up
// a list of every match as "Sheet: <tab name>, Cell: <cell>".

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Custom Scripts')
    .addItem('Search Keyword in Sheets', 'searchKeywordInSheets')
    .addToUi();
}

function searchKeywordInSheets() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt("Enter the keyword to search:");
  var keyword = response.getResponseText();

  if (response.getSelectedButton() == ui.Button.CLOSE || keyword == "") {
    return;
  }

  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = spreadsheet.getSheets();
  var results = [];

  sheets.forEach(function(sheet) {
    var range = sheet.getDataRange();
    var values = range.getValues();

    for (var row = 0; row < values.length; row++) {
      for (var col = 0; col < values[row].length; col++) {
        if (String(values[row][col]).toLowerCase().includes(keyword.toLowerCase())) {
          var cell = sheet.getRange(row + 1, col + 1).getA1Notation();
          results.push('Sheet: ' + sheet.getName() + ', Cell: ' + cell);
        }
      }
    }
  });

  if (results.length > 0) {
    var message = 'Keyword found in the following locations:\n' + results.join('\n');
    ui.alert(message);
  } else {
    ui.alert('Keyword not found in any sheet.');
  }
}
