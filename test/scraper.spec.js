import test from 'ava';
import mock from 'mock-fs';
import moment from 'moment';
import scrapeKeepNotes from '../src/scraper';

const testDates = {
  valid2016: 'Dec 31, 2016, 11:59:59 PM',
  valid1970: 'Jan 1, 1970, 1:23:45 AM',
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
      '1.html': `
        <div class="note">
          <div class="heading">${testDates.valid2016}</div>
          <div class="title">foo</div>
          <div class="content">fooContent</div>
        </div>`,
      '2.html': `
        <div class="note">
          <div class="heading">${testDates.invalid}</div>
          <div class="titleBad">bar</div>
          <div class="contentBad">barContent</div>
        </div>`,
      '3.html': `
        <div class="note">
          <div class="heading">${testDates.invalid}</div>
          <div class="title">baz</div>
          <div class="content">bazContent</div>
        </div>`,
      '4.html': `
        <div class="note">
          <div class="heading">${testDates.valid1970}</div>
          <div class="title">qux</div>
          <div class="content">
            <div class="listitem">
              <div class="bullet">&#9744;</div>
              <div class="text">listItem</div>
            </div>
          </div>
        </div>`,
      '5.html': `
        <div class="note">
          <div class="heading">${testDates.valid2016}</div>
          <div class="title">quux</div>
          <div class="content">quux</div>
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

test('unordered notes with mixed quality levels', (t) => {
  const valid1970Date = moment(testDates.valid1970, datePattern, true).toISOString();
  const valid2016Date = moment(testDates.valid2016, datePattern, true).toISOString();
  const { notes, triedFileNum, failFiles } = scrapeKeepNotes('./MixedNotes');
  t.deepEqual(notes, [
    {
      date: valid1970Date,
      title: 'qux',
      content: 'listItem',
      filename: '4.html',
    },
    {
      date: valid2016Date,
      title: 'foo',
      content: 'fooContent',
      filename: '1.html',
    },
    {
      date: valid2016Date,
      title: 'quux',
      content: 'quux',
      filename: '5.html',
    },
    {
      date: 'Invalid date',
      title: 'baz',
      content: 'bazContent',
      filename: '3.html',
    },
  ]);
  t.is(triedFileNum, 5);
  t.is(failFiles.length, 1);
});

test.after('cleanup', () => {
  mock.restore();
});
