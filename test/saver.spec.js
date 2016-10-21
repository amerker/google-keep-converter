import test from 'ava';
import fs from 'fs';
import mock from 'mock-fs';
import json2csv from 'json2csv';
import { saveJson, saveCsv } from '../src/saver';

const notesStub = { 'foo': 'bar', 'baz': ['qux'] };

test.before('prep', () => {
  mock();
});

test('JSON file is written and matches with input data', (t) => {
  saveJson(notesStub, 'foo');
  const fileContent = fs.readFileSync('foo.json', 'utf-8');
  t.deepEqual(JSON.parse(fileContent), notesStub);
});

test('CSV file is written and matches with input data', (t) => {
  saveCsv(notesStub, 'foo');
  const fileContent = fs.readFileSync('foo.csv', 'utf-8');
  t.is(fileContent, json2csv({ data: notesStub }));
});

test.after('cleanup', () => {
  mock.restore();
});
