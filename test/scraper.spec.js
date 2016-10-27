import test from 'ava';
import mock from 'mock-fs';
import moment from 'moment';
import scrapeKeepNotes from '../src/scraper';

const testDates = {
  valid: 'Jan 1, 1970, 1:23:45 AM',
  invalid: 'Feb 29, 1970, 25:67:89 XM',
};
const datePattern = 'MMM D, YYYY, h:mm:ss A';

test.before('prep', () => {
  mock({
    './EmptyDir': {},
    './NoHtmlFiles': {
      'foo.txt': '',
    },
    './OneEmptyHtmlFile': {
      'foo.html': '',
      'bar.txt': '',
    },
    './MixedNotes': {
      'foo.html': `
        <div class="note">
          <div class="heading">${testDates.valid}</div>
          <div class="title">foo</div>
          <div class="content">fooContent</div>
        </div>`,
      'bar.html': `
        <div class="note">
          <div class="heading">${testDates.invalid}</div>
          <div class="titleBad">bar</div>
          <div class="contentBad">barContent</div>
        </div>`,
      'baz.html': `
        <div class="note">
          <div class="heading">${testDates.invalid}</div>
          <div class="title">baz</div>
          <div class="content">bazContent</div>
        </div>`,
    },
  });
});

test('bad directory names', (t) => {
  t.throws(() => {
    scrapeKeepNotes();
  });
});

test('empty dir', (t) => {
  t.throws(() => {
    scrapeKeepNotes('./EmptyDir');
  }, 'Directory empty!');
});

test('no html files', (t) => {
  const { notes, triedFileNum, failFiles } = scrapeKeepNotes('./NoHtmlFiles');
  t.deepEqual(notes, []);
  t.is(triedFileNum, 0);
  t.is(failFiles.length, 0);
});

test('one empty html file', (t) => {
  const { notes, triedFileNum, failFiles } = scrapeKeepNotes('./OneEmptyHtmlFile');
  t.is(notes.length, 0);
  t.is(triedFileNum, 1);
  t.is(failFiles.length, 1);
});

test('three notes with good, bad, and salvageable content', (t) => {
  const validDate = moment(testDates.valid, datePattern, true).toISOString();
  const { notes, triedFileNum, failFiles } = scrapeKeepNotes('./MixedNotes');
  t.deepEqual(notes, [
    {
      date: validDate,
      title: 'foo',
      content: 'fooContent',
      filename: 'foo.html',
    },
    {
      date: 'Invalid date',
      title: 'baz',
      content: 'bazContent',
      filename: 'baz.html',
    },
  ]);
  t.is(triedFileNum, 3);
  t.is(failFiles.length, 1);
});

test.after('cleanup', () => {
  mock.restore();
});
