// Bold Headings — Google Docs Apps Script (from Lucky's Google Drive, Doc "Bold headings script").
// Adds a "Custom Formatting" menu to a Google Doc. One click: Heading 1 bold,
// Heading 2 bold, Heading 3 bold + italic.
// The Drive Doc's own first line ("Bold headings 1 and 2 bold and italicize heading 3") is kept below.

// Bold headings 1 and 2 bold and italicize heading 3

function onOpen() {
  var ui = DocumentApp.getUi();
  // Add a new custom menu
  ui.createMenu('Custom Formatting')
    .addItem('Format Headings', 'formatHeadings')
    .addToUi();
}

function formatHeadings() {
  var body = DocumentApp.getActiveDocument().getBody();
  var paragraphs = body.getParagraphs();

  paragraphs.forEach(function(paragraph) {
    var headingType = paragraph.getHeading();

    if (headingType == DocumentApp.ParagraphHeading.HEADING1) {
      paragraph.editAsText().setBold(true);
    } else if (headingType == DocumentApp.ParagraphHeading.HEADING2) {
      paragraph.editAsText().setBold(true);
    } else if (headingType == DocumentApp.ParagraphHeading.HEADING3) {
      paragraph.editAsText().setBold(true).setItalic(true);
    }
  });
}
