// Scrub Names (version 1) — Google Docs Apps Script (from Lucky's Google Drive, Doc "Scrub names").
// Adds a "Custom Tools" menu to a Google Doc. It finds "Firstname Lastname" pairs
// (capitalized two-word names) and replaces each one with the word "scrubbed".
// The Drive Doc's own how-to notes are kept at the top of the code below.

Simply add this to app script via the document
Remember sometimes you have to save as google doc to get the extension button next to help for apps script


function onOpen() {
  var ui = DocumentApp.getUi();
  ui.createMenu('Custom Tools')
    .addItem('Scrub Names', 'scrubNames')
    .addToUi();
}

function scrubNames() {
  var doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();

  // Regular expression to match first and last names starting with capital letters
  var regex = /\b[A-Z][a-z]+\s[A-Z][a-z]+\b/g;

  // Get the document text
  var text = body.getText();

  // Log the matches to check if the regex is working
  var matches = text.match(regex);
  Logger.log(matches); // This will log the matched names in the script's execution log

  // Replace all matched names with "scrubbed"
  if (matches !== null) {
    for (var i = 0; i < matches.length; i++) {
      body.replaceText(matches[i], "scrubbed");
    }
  }
}
