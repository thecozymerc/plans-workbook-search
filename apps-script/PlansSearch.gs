/**
 * Plans Search — keyword search for the "Plans: commands for rclone/bash/sqlite" workbook.
 *
 * What it does:
 * - Adds a "Plans Search" menu to the spreadsheet when it opens (desktop web Sheets).
 * - You type one keyword; it searches every tab in the workbook.
 * - It shows a list of results: the tab name, the exact cell (like B4), and a short snippet.
 * - Each result is a link that jumps straight to that cell.
 *
 * Plain-English note: Google does not show custom menus like this inside the
 * Sheets phone app. The menu appears when the sheet is opened in a browser.
 * On the phone, the fastest route is still to tell Muse the keyword and let
 * the Python version (search_plans.py) run.
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Plans Search')
    .addItem('Search all tabs by keyword…', 'plansSearchOpen')
    .addToUi();
}

function plansSearchOpen() {
  var html = HtmlService.createHtmlOutputFromFile('SearchDialog')
    .setWidth(560)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, 'Search all tabs by keyword');
}

/**
 * Runs the search. Called from SearchDialog.html.
 * Returns an array of { tab, cell, snippet, url }.
 */
function plansSearchRun(keyword) {
  keyword = String(keyword || '').trim();
  if (!keyword) return [];
  var needle = keyword.toLowerCase();

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ssId = ss.getId();
  var results = [];

  ss.getSheets().forEach(function (sheet) {
    var range = sheet.getDataRange();
    var values = range.getDisplayValues();
    for (var r = 0; r < values.length; r++) {
      for (var c = 0; c < values[r].length; c++) {
        var cellText = values[r][c];
        if (cellText && cellText.toLowerCase().indexOf(needle) !== -1) {
          var a1 = columnLetter(c + 1) + (r + 1);
          results.push({
            tab: sheet.getName(),
            cell: a1,
            snippet: cellText.length > 140 ? cellText.slice(0, 140) + '…' : cellText,
            url: 'https://docs.google.com/spreadsheets/d/' + ssId +
                 '/edit#gid=' + sheet.getSheetId() + '&range=' + a1
          });
        }
      }
    }
  });

  return results;
}

function columnLetter(n) {
  var s = '';
  while (n > 0) {
    var m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}
