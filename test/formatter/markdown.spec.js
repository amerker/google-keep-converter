import test from 'ava';
import { toMarkdown, toFilename } from '../../src/formatter/markdown.js';

const baseNote = {
  title: 'My Note',
  created: '2024-01-01T00:00:00.000Z',
  updated: '2024-06-01T12:00:00.000Z',
  content: 'Hello world',
  listItems: null,
  labels: [],
  color: 'DEFAULT',
  isPinned: false,
  isArchived: false,
  attachments: [],
  annotations: [],
  sourceFile: 'my-note.json',
};

test('text note produces valid frontmatter and body', (t) => {
  const md = toMarkdown(baseNote);
  t.true(md.startsWith('---\n'));
  t.true(md.includes('title: "My Note"'));
  t.true(md.includes('created: 2024-01-01T00:00:00.000Z'));
  t.true(md.includes('updated: 2024-06-01T12:00:00.000Z'));
  t.true(md.includes('Hello world'));
});

test('DEFAULT color is omitted from frontmatter', (t) => {
  const md = toMarkdown(baseNote);
  t.false(md.includes('color:'));
});

test('non-default color appears in frontmatter', (t) => {
  const md = toMarkdown({ ...baseNote, color: 'RED' });
  t.true(md.includes('color: RED'));
});

test('labels become tags in frontmatter', (t) => {
  const md = toMarkdown({ ...baseNote, labels: ['work', 'ideas'] });
  t.true(md.includes('tags: ["work", "ideas"]'));
});

test('pinned flag appears in frontmatter', (t) => {
  const md = toMarkdown({ ...baseNote, isPinned: true });
  t.true(md.includes('pinned: true'));
});

test('archived flag appears in frontmatter', (t) => {
  const md = toMarkdown({ ...baseNote, isArchived: true });
  t.true(md.includes('archived: true'));
});

test('list items render as checkboxes', (t) => {
  const md = toMarkdown({
    ...baseNote,
    content: null,
    listItems: [
      { text: 'Buy milk', isChecked: false },
      { text: 'Buy eggs', isChecked: true },
    ],
  });
  t.true(md.includes('- [ ] Buy milk'));
  t.true(md.includes('- [x] Buy eggs'));
});

test('attachment renders as image reference', (t) => {
  const md = toMarkdown({ ...baseNote, attachments: [{ filePath: 'photo.jpg', mimetype: 'image/jpeg' }] });
  t.true(md.includes('![](photo.jpg)'));
});

test('web annotation renders as link', (t) => {
  const md = toMarkdown({ ...baseNote, annotations: [{ title: 'Example', url: 'https://example.com', description: '' }] });
  t.true(md.includes('[Example](https://example.com)'));
});

test('note without title omits title from frontmatter', (t) => {
  const md = toMarkdown({ ...baseNote, title: '' });
  t.false(md.includes('title:'));
});

test('toFilename uses sanitized title', (t) => {
  t.is(toFilename(baseNote), 'My-Note.md');
});

test('toFilename falls back to source file stem when no title', (t) => {
  t.is(toFilename({ ...baseNote, title: '' }), 'my-note.md');
});

test('toFilename strips characters illegal in filenames', (t) => {
  t.is(toFilename({ ...baseNote, title: 'Notes: 2024/01 "draft"' }), 'Notes-202401-draft.md');
});
