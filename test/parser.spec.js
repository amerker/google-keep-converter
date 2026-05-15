import test from 'ava';
import mock from 'mock-fs';
import parseKeepExport from '../src/parser.js';

const note = (overrides = {}) => JSON.stringify({
  color: 'DEFAULT',
  isTrashed: false,
  isPinned: false,
  isArchived: false,
  title: 'Test Note',
  textContent: 'Hello world',
  userEditedTimestampUsec: 1700000000000000,
  createdTimestampUsec: 1699000000000000,
  ...overrides,
});

test.before(() => {
  mock({
    './Empty': {},
    './NoJson': { 'foo.html': '' },
    './Notes': {
      'text.json': note(),
      'list.json': note({
        title: 'My List',
        textContent: undefined,
        listContent: [
          { text: 'First', textHtml: '', isChecked: false },
          { text: 'Done', textHtml: '', isChecked: true },
        ],
        labels: [{ name: 'work' }],
        color: 'RED',
        isPinned: true,
      }),
      'trashed.json': note({ title: 'Deleted', isTrashed: true }),
      'archived.json': note({ title: 'Archived', isArchived: true }),
      'attachment.json': note({
        title: 'With Image',
        attachments: [{ filePath: 'photo.jpg', mimetype: 'image/jpeg' }],
        annotations: [{ source: 'WEBLINK', title: 'Example', url: 'https://example.com', description: '' }],
      }),
      'older.json': note({ title: 'Older', userEditedTimestampUsec: 1600000000000000 }),
    },
  });
});

test('empty directory throws', (t) => {
  t.throws(() => parseKeepExport('./Empty'), { message: 'No JSON files found in directory' });
});

test('directory with no json files throws', (t) => {
  t.throws(() => parseKeepExport('./NoJson'), { message: 'No JSON files found in directory' });
});

test('parses text note correctly', (t) => {
  const notes = parseKeepExport('./Notes');
  const n = notes.find(n => n.sourceFile === 'text.json');
  t.is(n.title, 'Test Note');
  t.is(n.content, 'Hello world');
  t.is(n.listItems, null);
  t.is(n.created, new Date(1699000000000000 / 1000).toISOString());
  t.is(n.updated, new Date(1700000000000000 / 1000).toISOString());
  t.deepEqual(n.labels, []);
  t.is(n.color, 'DEFAULT');
  t.false(n.isPinned);
  t.false(n.isArchived);
  t.false(n.isTrashed);
});

test('parses list note correctly', (t) => {
  const notes = parseKeepExport('./Notes');
  const n = notes.find(n => n.sourceFile === 'list.json');
  t.is(n.title, 'My List');
  t.is(n.content, null);
  t.deepEqual(n.listItems, [
    { text: 'First', isChecked: false },
    { text: 'Done', isChecked: true },
  ]);
  t.deepEqual(n.labels, ['work']);
  t.is(n.color, 'RED');
  t.true(n.isPinned);
});

test('parses attachments and annotations', (t) => {
  const notes = parseKeepExport('./Notes');
  const n = notes.find(n => n.sourceFile === 'attachment.json');
  t.deepEqual(n.attachments, [{ filePath: 'photo.jpg', mimetype: 'image/jpeg' }]);
  t.deepEqual(n.annotations, [{ title: 'Example', url: 'https://example.com', description: '' }]);
});

test('includes trashed and archived notes (filtering is caller responsibility)', (t) => {
  const notes = parseKeepExport('./Notes');
  t.truthy(notes.find(n => n.isTrashed));
  t.truthy(notes.find(n => n.isArchived));
});

test('sorts by updated timestamp ascending', (t) => {
  const notes = parseKeepExport('./Notes');
  const older = notes.findIndex(n => n.sourceFile === 'older.json');
  const newer = notes.findIndex(n => n.sourceFile === 'text.json');
  t.true(older < newer);
});

test.after(() => mock.restore());
