'use strict';

const program = require('commander');

const renamer = require('./renamer');
const scraper = require('./scraper');
const saver = require('./saver');

const dir = './Keep/';

program
  .description('Convert Google Keep notes to sensible file formats like JSON (default) and CSV.')
  .option('-f, --fix', 'fix naming of HTML files (workaround for Google Takeout bug)')
  .option('-c, --csv', 'save data as CSV file (additionally)')
  .parse(process.argv);

const metrics = {
  renamedFiles: 0,
  triedFiles: 0,
  scrapedFiles: 0,
};
let notes = [];
let savedFiles = [];
let failedFiles = [];

// === rename ===

if (program.fix) {
  try {
    metrics.renamedFiles = renamer.renameToHtml(dir);
  } catch (e) {
    console.error('Error:', e.message);
    console.error('Something went wrong while fixing the HTML filenames.');
    process.exit(1);
  }
}

// === scrape ===

try {
  const scrapeResult = scraper.scrapeKeepNotes(dir);
  metrics.triedFiles = scrapeResult.htmlFileNum;
  failedFiles = scrapeResult.failFiles;
  notes = scrapeResult.notes;
  metrics.scrapedFiles = notes.length;
} catch (e) {
  console.error('Error:', e.message);
  console.error('Make sure to put the Keep HTML files into ./Keep/');
  process.exit(1);
}

// === save ===

if (notes.length) {
  try {
    savedFiles = saver.writeFile(notes, program.csv);
  } catch (e) {
    console.error('Error:', e.message);
    console.error('Something went wrong while writing the output.');
    process.exit(1);
  }
}

// === result info ===

console.log(`- Renamed ${metrics.renamedFiles} files`);
console.log(`- Scraped ${metrics.scrapedFiles} / ${metrics.triedFiles} files`);
if (failedFiles.length) {
  console.log('- Failed files:');
  failedFiles.forEach(ff =>
    console.log(`  > ${ff}`)
  );
}
console.log(`- Data saved to "${savedFiles.join('" and "')}"`);

// GitHub: https://github.com/amerker
