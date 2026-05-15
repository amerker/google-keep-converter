# google-keep-converter

> Migrate your Google Keep notes to Markdown — ready for [Obsidian](https://obsidian.md), [Logseq](https://logseq.com), [Notion](https://notion.so), or any Markdown-based tool.

Each note becomes an individual `.md` file with YAML frontmatter. List notes get `- [ ]` / `- [x]` checkboxes. Labels become tags. A CSV export is also available.

## Requirements

- Node.js >= 24
- A Google Keep export from [Google Takeout](https://takeout.google.com) (select "Keep")

## Installation

```sh
npm install -g google-keep-converter
```

## Usage

1. Export your Google Keep data via [Google Takeout](https://takeout.google.com) and extract the archive
2. Navigate to the folder containing your Keep export (or anywhere within it)
3. Run:

```sh
google-keep-converter
```

The tool searches for your notes in `./Takeout/Keep/`, `./Keep/`, or the current directory — in that order.

Output is saved to a new `keep-notes-YYYY-MM-DD-HHmm/` folder in the current directory, one `.md` file per note.

## Options

| Option | Description |
|---|---|
| `--csv` | Also export a `keep-notes-YYYY-MM-DD-HHmm.csv` file |
| `--trashed` | Include trashed notes (excluded by default) |
| `--output <dir>` | Write Markdown files to a custom directory |
| `-h, --help` | Show help |

## Output format

### Markdown

```markdown
---
title: "Shopping list"
created: 2024-03-15T10:30:00.000Z
updated: 2024-11-01T14:22:00.000Z
tags: ["groceries"]
color: GREEN
---

- [ ] Milk
- [x] Eggs
- [ ] Bread
```

Text notes, list notes (with checked/unchecked state), labels, color, pinned and archived status are all preserved. Notes with image or audio attachments include a reference to the attachment file.

### CSV

When `--csv` is passed, a single CSV file is written alongside the Markdown folder. Columns: `title`, `created`, `updated`, `content`, `labels`, `color`, `isPinned`, `isArchived`, `sourceFile`.

## How it works

Google Takeout exports Keep notes as both `.html` and `.json` files. This tool reads the `.json` files, which contain clean structured data: plain-text content, machine-readable timestamps, checked state for list items, labels, and metadata. No HTML parsing.
