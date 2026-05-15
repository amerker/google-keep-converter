import test from 'ava';
import { toCsv } from '../../src/formatter/csv.js';

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
  sourceFile: 'my-note.json',
};

test('outputs header row', (t) => {
  const csv = toCsv([baseNote]);
  const header = csv.split('\n')[0];
  t.is(header, 'title,created,updated,content,labels,color,isPinned,isArchived,sourceFile');
});

test('outputs correct values for text note', (t) => {
  const csv = toCsv([baseNote]);
  const row = csv.split('\n')[1];
  t.true(row.startsWith('My Note,'));
  t.true(row.includes('Hello world'));
});

test('list items are rendered as checkbox text in content column', (t) => {
  const note = { ...baseNote, content: null, listItems: [
    { text: 'First', isChecked: false },
    { text: 'Done', isChecked: true },
  ]};
  const csv = toCsv([note]);
  t.true(csv.includes('[ ] First'));
  t.true(csv.includes('[x] Done'));
});

test('multiple labels are joined with semicolon', (t) => {
  const csv = toCsv([{ ...baseNote, labels: ['work', 'ideas'] }]);
  t.true(csv.includes('work; ideas'));
});

test('values with commas are quoted', (t) => {
  const csv = toCsv([{ ...baseNote, title: 'Hello, world' }]);
  t.true(csv.includes('"Hello, world"'));
});

test('produces one row per note', (t) => {
  const csv = toCsv([baseNote, { ...baseNote, title: 'Second' }]);
  t.is(csv.split('\n').length, 3); // header + 2 rows
});
