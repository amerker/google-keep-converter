import test from 'ava';
import mock from 'mock-fs';
import findDir from '../src/dir-finder';

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
  }, 'NODIR');
});

test('dirList contains empty string', (t) => {
  t.throws(() => {
    findDir(['']);
  }, 'NODIR');
});

test('no dirs found', (t) => {
  t.throws(() => {
    findDir(['foo', '', 'bar']);
  }, 'NODIR');
});

test('single existing dir', (t) => {
  t.is(findDir(['.']), '.');
});

test('mixed missing and existing dirs', (t) => {
  t.is(findDir(['foo', '.']), '.');
});

test('multiple existing dirs & different syntaxes', (t) => {
  t.plan(3);
  t.is(findDir(['./Keep', '.']), './Keep');
  t.is(findDir(['Keep', './Keep']), 'Keep');
  t.is(findDir(['Keep/', './Keep/']), 'Keep/');
});

test.after('cleanup', () => {
  mock.restore();
});
