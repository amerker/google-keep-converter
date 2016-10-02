const fs = require('fs');
const cheerio = require('cheerio');
const he = require('he');
const moment = require('moment');

const extractFromDOM = (dir, filename) => {
  const $ = cheerio.load(fs.readFileSync(dir + filename, 'utf8'), { normalizeWhitespace: true, decodeEntities: false });

  const keepNote = $('.note');

  if (!keepNote.length) {
    return null;
  }

  const keepDate = keepNote.find('.heading').text().trim();

  const date = moment(keepDate, 'MMM D, YYYY, h:mm:ss A', true).toISOString();
  const title = keepNote.find('.title').text().trim();
  let content = keepNote.find('.content');

  if (!content.length) {
    return null;
  }

  if (content.find('div.listitem').length) {
    // Keep Note type: list
    content = content
      .find('div.text')
      .map((v, i) => $(i).html().trim())
      .get()
      .join('\n');
  } else {
    // Keep Note type: normal text
    content = content
      .html()
      .split(/<br>/)
      .join('\n');
  }

  // decode HTML entities with he as cheerio has issues with that
  content = he.decode(content);

  return { date, title, content, filename };
};

exports.scrapeKeepNotes = (dir) => {
  const files = fs.readdirSync(dir);
  const notes = [];
  const failFiles = [];

  if (files.length === 0) {
    throw Error('Directory empty!');
  }

  const htmlFiles = files
    .filter(f => f.match(/\.html$/));

  htmlFiles
    .forEach((f) => {
      const data = extractFromDOM(dir, f);
      if (data === null) {
        failFiles.push(f);
      } else {
        notes.push(data);
      }
    });

  notes.sort((a, b) => {
    if (a.date < b.date) {
      return -1;
    } else if (a.date > b.date) {
      return 1;
    }
    return 0;
  });

  return {
    notes,
    htmlFileNum: htmlFiles.length,
    failFiles,
  };
};
