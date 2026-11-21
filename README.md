# Plans Workbook Search

Search tools for one very large Google Sheets workbook:
**"Plans: commands for rclone/bash/sqlite"** — a master plans workbook with 80+ tabs.

**The problem:** the workbook is huge. When you remember a keyword but not which
tab it lives in, finding it by hand means opening tab after tab.

**The fix:** type one keyword, get back a list of every match — the tab name,
the exact cell (like `B4`), and a short snippet of the text in that cell.
Each result can be turned into a link that jumps straight to that cell.

There are two versions of the same tool. They do the same job in two
different places.

---

## 1. `search_plans.py` — the Python version (runs outside the sheet)

**What it does**

- Connects to the workbook through the Google Sheets API.
- Reads every tab in one pass (a single batch read, so it is fast —
  the whole workbook searches in about 5 seconds).
- Prints one line per match: tab name, exact cell, snippet.
- Matching is case-insensitive and matches partial words
  (searching `oracle` also finds `Oracle`).

**How to use it**

```bash
python3 search_plans.py "Oracle"
```

Example output:

```
tab 49. Infrastructure — Computers & Cloud Accounts — cell B4: Oracle Cloud computer — account 1 of 1 (the only one)
```

Options:

- `--exact` — match whole words only.
- `--sheet <workbook ID>` — search a different workbook.
- `--out results.txt` — also save the results to a file.

**Who runs it:** this version runs from a terminal / by an assistant.
You just say the keyword; the script does the hunting.

---

## 2. `apps-script/` — the Google Apps Script version (lives inside the sheet)

**What it does**

- Adds a **"Plans Search"** menu to the spreadsheet itself.
- Click the menu, type a keyword, and a dialog lists every match —
  tab name, exact cell, snippet — with each result as a clickable link
  that jumps straight to that cell.

**Files**

- `PlansSearch.gs` — the search logic and the menu.
- `SearchDialog.html` — the little search box window.
- `appsscript.json` — the project settings (timezone, permissions).

**How to install it**

1. Open the workbook in Google Sheets in a browser.
2. Extensions → Apps Script.
3. Replace the default `Code.gs` with `PlansSearch.gs`.
4. Add an HTML file named `SearchDialog` with the contents of `SearchDialog.html`.
5. Replace the manifest (`appsscript.json`) with the one in this repo
   (Project Settings → "Show appsscript.json manifest file in editor").
6. Reload the sheet. The **Plans Search** menu appears. The first run asks
   you to authorize the script — that is normal for your own script.

**One honest limit:** Google does not show custom menus inside the Sheets
phone app. This menu appears when the sheet is opened in a browser
(desktop or mobile browser). On the phone app, use version 1 — just ask
for the keyword and the Python script runs it.

---

## Why two versions?

- The Python version works from anywhere, including from a phone chat —
  no need to open the sheet at all.
- The Apps Script version lives inside the sheet for anyone already
  looking at it in a browser.

Same search, same results, two doors in.
