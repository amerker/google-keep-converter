import fs from 'fs';
import path from 'path';

const toISO = (usec) => new Date(usec / 1000).toISOString();

const parseNote = (dir, filename) => {
  const raw = JSON.parse(fs.readFileSync(path.join(dir, filename), 'utf8'));
  return {
    title: raw.title ?? '',
    created: toISO(raw.createdTimestampUsec),
    updated: toISO(raw.userEditedTimestampUsec),
    content: raw.textContent ?? null,
    listItems: raw.listContent
      ? raw.listContent.map(({ text, isChecked }) => ({ text, isChecked }))
      : null,
    labels: (raw.labels ?? []).map(l => l.name),
    color: raw.color ?? 'DEFAULT',
    isPinned: raw.isPinned ?? false,
    isArchived: raw.isArchived ?? false,
    isTrashed: raw.isTrashed ?? false,
    attachments: (raw.attachments ?? []).map(({ filePath, mimetype }) => ({ filePath, mimetype })),
    annotations: (raw.annotations ?? [])
      .filter(a => a.source === 'WEBLINK')
      .map(({ title, url, description }) => ({ title, url, description })),
    sourceFile: filename,
  };
};

const parseKeepExport = (dir) => {
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .sort();

  if (files.length === 0) throw new Error('No JSON files found in directory');

  const notes = files.map(f => parseNote(dir, f));

  notes.sort((a, b) => {
    if (a.updated < b.updated) return -1;
    if (a.updated > b.updated) return 1;
    return 0;
  });

  return notes;
};

export default parseKeepExport;
