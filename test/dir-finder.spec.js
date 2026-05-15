import test from 'ava';
import mock from 'mock-fs';
import findDir from '../src/dir-finder.js';

test.before('prep', () => {
  mock({ './Keep': {} });
});

test('dirList is missing', (t) => {
  t.throws(() => {
    findDir();
  });
});

test('dirList has wrong type', (t) => {
  t.throws(() => {
    findDir('foo');
  });
});

test('dirList is empty array', (t) => {
  t.throws(() => {
    findDir([]);
  }, { message: 'NODIR' });
});

test('dirList contains empty string', (t) => {
  t.throws(() => {
    findDir(['']);
  }, { message: 'NODIR' });
});

test('no dirs found', (t) => {
  t.throws(() => {
    findDir(['foo', '', 'bar']);
  }, { message: 'NODIR' });
});

test('single existing dir', (t) => {
  t.is(findDir(['.']), '.');
});

test('mixed missing and existing dirs', (t) => {
  t.is(findDir(['foo', '.']), '.');
});

test('multiple existing dirs & different syntaxes', (t) => {
  t.is(findDir(['./Keep', '.']), './Keep');
  t.is(findDir(['Keep', './Keep']), 'Keep');
  t.is(findDir(['Keep/', './Keep/']), 'Keep/');
});

test.after('cleanup', () => {
  mock.restore();
});
