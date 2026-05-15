# Changelog

## 2.0.0 (2026)

Complete rewrite. The tool is now a migration tool rather than a scraper.

### Breaking changes
- Output is now Markdown (individual `.md` files) instead of JSON
- `--fix` / `-f` flag removed — the Google Takeout filename bug it worked around is no longer relevant with JSON-based parsing
- `-c` / `--csv` is now opt-in rather than the secondary default output

### New
- Markdown output with YAML frontmatter (title, timestamps, tags, color, pinned, archived)
- List notes render as `- [ ]` / `- [x]` checkboxes
- Attachment references included in Markdown output
- Web link annotations included as Markdown links
- `--trashed` flag to include trashed notes (excluded by default)
- `--output <dir>` flag for custom output directory

### Changed
- Now reads `.json` files from Google Takeout instead of scraping `.html` files — more reliable and locale-independent
- Timestamps are now ISO 8601 (were locale-dependent strings parsed from HTML)
- Dropped dependencies: `cheerio`, `he`, `dayjs`, `json2csv`, `babel`
- Requires Node.js >= 24

### Fixed
- Dates returned as "Invalid date" for non-English locales (#4) — moot with JSON input
- `commander` install failure due to git URL dependency (#5) — fixed in 1.0.0

## 1.0.0 (2026)

Modernized the codebase to run on a current Node.js stack.

- Node 6 → >=18, ESM (`"type": "module"`)
- Replaced `moment` with `dayjs`, removed `babel` and `nyc`
- Bumped all dependencies to current versions
- Fixed `fs.rename()` → `fs.renameSync()` (broke silently on Node 18)
- Fixed sort comparator for notes with equal timestamps

## 0.5.0 (2016)

- Added label support

## 0.4.0 (2016)

- Initial public release
