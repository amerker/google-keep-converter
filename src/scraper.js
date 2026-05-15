import fs from 'fs';
import { load } from 'cheerio';
import he from 'he';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';

dayjs.extend(customParseFormat);

const extractFromDOM = (dir, filename) => {
  const $ = load(fs.readFileSync(`${dir}/${filename}`, 'utf8'), {
    decodeEntities: false,
  });

  const keepNote = $('.note');

  if (!keepNote.length) {
    return null;
  }

  const keepDate = keepNote.find('.heading').text().trim();

  const parsed = dayjs(keepDate, 'MMM D, YYYY, h:mm:ss A', true);
  const date = parsed.isValid() ? parsed.toISOString() : 'Invalid date';
  const title = keepNote.find('.title').text().trim();
  const contentRoot = keepNote.find('.content');
  let content = '';
  let labels = [];

  if (!contentRoot.length) {
    return null;
  }

  if (contentRoot.find('div.listitem').length) {
    // Keep Note type: list
    content = contentRoot
      .find('div.text')
      .map((v, i) => $(i).html().trim())
      .get()
      .join('\n');
  } else {
    // Keep Note type: normal text
    content = contentRoot
      .html()
      .split(/<br>/)
      .join('\n');
  }

  if (keepNote.find('div.labels').length) {
    labels = keepNote
      .find('span.label')
      .map((v, i) => $(i).html().trim())
      .get();
  }

  // decode HTML entities with he as cheerio has issues with that
  content = he.decode(content);
  labels.map(label => he.decode(label));

  const keepObject = { date, title, content };
  if (labels.length) {
    keepObject.labels = labels;
  }
  keepObject.filename = filename;

  return keepObject;
};

const scrapeKeepNotes = (dir) => {
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
    if (a.date < b.date) return -1;
    if (a.date > b.date) return 1;
    return 0;
  });

  return {
    notes,
    triedFileNum: htmlFiles.length,
    failFiles,
  };
};

export default scrapeKeepNotes;
