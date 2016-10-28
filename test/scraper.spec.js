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
const valid1970Date = moment(testDates.valid1970, datePattern, true).toISOString();
const valid2016Date = moment(testDates.valid2016, datePattern, true).toISOString();

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
    './TextNotes': {
      'goodTextNote.html': `
        <div class="note">
          <div class="heading">${testDates.valid1970}</div>
          <div class="title">foo</div>
          <div class="content">fooContent</div>
        </div>`,
      'badTextNote.html': `
        <div class="note">
          <div class="heading">${testDates.invalid}</div>
          <div class="titleBad">bar</div>
          <div class="contentBad">barContent</div>
        </div>`,
      'salvageableTextNote.html': `
        <div class="note">
          <div class="heading">${testDates.invalid}</div>
          <div class="title">baz</div>
          <div class="content">bazContent</div>
        </div>`,
      'singleLabeledTextNote.html': `
        <div class="note">
          <div class="heading">${testDates.valid2016}</div>
          <div class="title">qux</div>
          <div class="content">qux</div>
          <div class="labels">
            <span class="label">quxLabel</span>
          </div>
        </div>`,
      'multiLabeledTextNote.html': `
        <div class="note">
          <div class="heading">${testDates.valid2016}</div>
          <div class="title">quux</div>
          <div class="content">quux</div>
          <div class="labels">
            <span class="label">quuxFirstLabel</span>
            <span class="label">quuxSecondLabel</span>
          </div>
        </div>`,
    },
    './ListNotes': {
      'singleListItemNoteWithLabel.html': `
        <div class="note">
          <div class="heading">${testDates.valid2016}</div>
          <div class="title">corge</div>
          <div class="content">
            <div class="listitem">
              <div class="bullet">&#9744;</div>
              <div class="text">corgeSingleItem</div>
            </div>
          </div>
          <div class="labels">
            <span class="label">corgeLabel</span>
          </div>
        </div>`,
      'multiListItemNote.html': `
        <div class="note">
          <div class="heading">${testDates.valid1970}</div>
          <div class="title">grault</div>
          <div class="content">
            <div class="listitem">
              <div class="bullet">&#9744;</div>
              <div class="text">graultFirstItem</div>
            </div>
            <div class="listitem">
              <div class="bullet">&#9744;</div>
              <div class="text">graultSecondItem</div>
            </div>
          </div>
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

test('text notes', (t) => {
  const { notes, triedFileNum, failFiles } = scrapeKeepNotes('./TextNotes');
  t.deepEqual(notes, [
    {
      date: valid1970Date,
      title: 'foo',
      content: 'fooContent',
      filename: 'goodTextNote.html',
    },
    {
      date: valid2016Date,
      title: 'qux',
      content: 'qux',
      labels: ['quxLabel'],
      filename: 'singleLabeledTextNote.html',
    },
    {
      date: valid2016Date,
      title: 'quux',
      content: 'quux',
      labels: ['quuxFirstLabel', 'quuxSecondLabel'],
      filename: 'multiLabeledTextNote.html',
    },
    {
      date: 'Invalid date',
      title: 'baz',
      content: 'bazContent',
      filename: 'salvageableTextNote.html',
    },
  ]);
  t.is(triedFileNum, 5);
  t.is(failFiles.length, 1);
});

test('list notes', (t) => {
  const { notes, triedFileNum, failFiles } = scrapeKeepNotes('./ListNotes');
  t.deepEqual(notes, [
    {
      date: valid1970Date,
      title: 'grault',
      content: 'graultFirstItem\ngraultSecondItem',
      filename: 'multiListItemNote.html',
    },
    {
      date: valid2016Date,
      title: 'corge',
      content: 'corgeSingleItem',
      filename: 'singleListItemNoteWithLabel.html',
      labels: ['corgeLabel'],
    },
  ]);
  t.is(triedFileNum, 2);
  t.is(failFiles.length, 0);
});

test.after('cleanup', () => {
  mock.restore();
});
