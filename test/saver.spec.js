import test from 'ava';
import fs from 'fs';
import path from 'path';
import mock from 'mock-fs';
import writeFiles from '../src/saver.js';

const note = (title = 'Test') => ({
  title,
  created: '2024-01-01T00:00:00.000Z',
  updated: '2024-06-01T12:00:00.000Z',
  content: 'Hello',
  listItems: null,
  labels: [],
  color: 'DEFAULT',
  isPinned: false,
  isArchived: false,
  attachments: [],
  annotations: [],
  sourceFile: `${title.toLowerCase()}.json`,
});

test.before(() => mock());
test.after(() => mock.restore());

test('creates output directory and writes markdown files', (t) => {
  const { outputDir, mdCount } = writeFiles([note('Alpha')], { outputDir: 'out-test' });
  t.is(outputDir, 'out-test');
  t.is(mdCount, 1);
  t.true(fs.existsSync(path.join('out-test', 'Alpha.md')));
});

test('handles duplicate filenames by appending a counter', (t) => {
  writeFiles([note('Dupe'), note('Dupe')], { outputDir: 'out-dupe' });
  t.true(fs.existsSync(path.join('out-dupe', 'Dupe.md')));
  t.true(fs.existsSync(path.join('out-dupe', 'Dupe-2.md')));
});

test('writes csv file when csv option is true', (t) => {
  const { csvFile } = writeFiles([note('Beta')], { outputDir: 'out-csv', csv: true });
  t.truthy(csvFile);
  t.true(fs.existsSync(csvFile));
});

test('no csv file by default', (t) => {
  const { csvFile } = writeFiles([note('Gamma')], { outputDir: 'out-nocsv' });
  t.is(csvFile, null);
});

test('empty notes array creates empty output directory', (t) => {
  const { mdCount } = writeFiles([], { outputDir: 'out-empty' });
  t.is(mdCount, 0);
  t.true(fs.existsSync('out-empty'));
});
