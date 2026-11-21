// Scrub Names (version 2, improved) — Google Docs Apps Script (from Lucky's Google Drive, Doc "scrub names 2").
// Adds a "Custom Tools" menu with two items: Preview Names (shows what would be scrubbed,
// without changing anything) and Scrub Names (replaces names with [REDACTED_NAME]).
// Smarter than version 1: handles hyphenated names and suffixes (Jr., Sr., III, IV),
// and skips phrases on an ignore list (New York, San Francisco, United States, ...).

function onOpen() {
  DocumentApp.getUi()
    .createMenu('Custom Tools')
    .addItem('Preview Names', 'previewNames')
    .addItem('Scrub Names', 'scrubNames')
    .addToUi();
}

// Match "Firstname Lastname" (+ optional -hyphen and suffix)
const NAME_PATTERN =
  '\\b([A-Z][a-z]+(?:-[A-Z][a-z]+)?)\\s([A-Z][a-z]+(?:-[A-Z][a-z]+)?)(?:\\s(?:Jr\\.|Sr\\.|III|IV))?\\b';

// Add common non-person phrases you don’t want scrubbed
const IGNORE = new Set([
  'New York','San Francisco','United States','Time To Market','Project Manager'
]);

function previewNames() {
  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody();
  const text = body.getText();
  const re = new RegExp(NAME_PATTERN, 'g');
  const matches = Array.from(text.matchAll(re)).map(m => m[0])
    .filter(name => !IGNORE.has(name));
  DocumentApp.getUi().alert(
    matches.length
      ? `Found ${matches.length} possible names:\n\n` + unique(matches).slice(0, 20).join('\n') +
        (matches.length > 20 ? '\n…' : '')
      : 'No candidate names found.'
  );
}

function scrubNames() {
  const ui = DocumentApp.getUi();
  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody();
  const text = body.getText();

  const re = new RegExp(NAME_PATTERN, 'g');
  const matches = Array.from(text.matchAll(re)).map(m => m[0])
    .filter(name => !IGNORE.has(name));
  const uniqueNames = unique(matches);
  if (!uniqueNames.length) {
    ui.alert('No candidate names to scrub.');
    return;
  }
  // Replace each unique name globally
  uniqueNames.forEach(n => body.replaceText(escapeForRegex(n), '[REDACTED_NAME]'));
  ui.alert(`Scrubbed ${matches.length} occurrence(s) across ${uniqueNames.length} unique name(s).`);
}

function unique(arr){ return Array.from(new Set(arr)); }

// Because replaceText takes a regex string, escape any special chars just in case
function escapeForRegex(s){
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
