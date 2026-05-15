import test from 'ava';
import fs from 'fs';
import mock from 'mock-fs';
import dayjs from 'dayjs';
import writeFile from '../src/saver.js';

const notesStub = { 'foo': 'bar', 'baz': ['qux'] };

test.before('prep', () => {
  mock();
});

test('empty JSON file is written', (t) => {
  const baseFilename = `keep-notes-${dayjs().format('YYYY-MM-DD-HHmm')}`;
  writeFile();

  const fileContent = fs.readFileSync(`${baseFilename}.json`, 'utf-8');
  t.deepEqual(JSON.parse(fileContent), []);

  t.false(fs.existsSync(`${baseFilename}.csv`));
});

test('only JSON file is written and matches with input data', (t) => {
  writeFile(notesStub, false, 'foo');

  const fileContent = fs.readFileSync('foo.json', 'utf-8');
  t.deepEqual(JSON.parse(fileContent), notesStub);

  t.false(fs.existsSync('foo.csv'));
});

test('JSON and CSV files are written and match with input data', (t) => {
  writeFile(notesStub, true, 'bar');

  const jsonFileContent = fs.readFileSync('bar.json', 'utf-8');
  t.deepEqual(JSON.parse(jsonFileContent), notesStub);

  t.notThrows(() => {
    fs.lstatSync('bar.csv');
  });

  const csvFileContent = fs.readFileSync('bar.csv', 'utf-8');
  t.is(csvFileContent, 'foo,baz\nbar,qux');
});

test.after('cleanup', () => {
  mock.restore();
});
