import test from 'ava';
import mock from 'mock-fs';
import renameToHtml from '../src/renamer';

test.before('prep', () => {
  mock({
    './Keep': {
      'foo': '',
      'bar.html': '',
      'baz.png': '',
      'qux.jpg': '',
    },
  });
});

test('dir is missing', (t) => {
  t.throws(() => {
    renameToHtml();
  });
});

test('dir has wrong type', (t) => {
  t.throws(() => {
    renameToHtml(123);
  });
});

test('dir doesn\'t exist', (t) => {
  t.throws(() => {
    renameToHtml('./Takeout');
  });
});

test('one renamable file', (t) => {
  t.is(renameToHtml('./Keep'), 1);
});

test.after('cleanup', () => {
  mock.restore();
});
