import test from 'ava';
import fs from 'fs';
import mock from 'mock-fs';
import json2csv from 'json2csv';
import writeFile from '../src/saver';

const notesStub = { 'foo': 'bar', 'baz': ['qux'] };

test.before('prep', () => {
  mock();
});

test('only JSON file is written and matches with input data', (t) => {
  t.plan(2);
  writeFile(notesStub, false, 'foo');

  const fileContent = fs.readFileSync('foo.json', 'utf-8');
  t.deepEqual(JSON.parse(fileContent), notesStub);

  t.throws(() => {
    fs.lstatSync('foo.csv');
  });
});

test('JSON and CSV files are written and match with input data', (t) => {
  t.plan(3);
  writeFile(notesStub, true, 'bar');

  const jsonFileContent = fs.readFileSync('bar.json', 'utf-8');
  t.deepEqual(JSON.parse(jsonFileContent), notesStub);

  t.notThrows(() => {
    fs.lstatSync('bar.csv');
  });

  const csvFileContent = fs.readFileSync('bar.csv', 'utf-8');
  t.is(csvFileContent, json2csv({ data: notesStub }));
});

test.after('cleanup', () => {
  mock.restore();
});
