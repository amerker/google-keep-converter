#!/usr/bin/env node

const program = require('commander');
const chalk = require('chalk');

const renamer = require('./renamer');
const scraper = require('./scraper');
const saver = require('./saver');

const dir = './Keep/';
const error = chalk.bold.red;
const log = chalk.bold.cyan;
const warn = chalk.green;

program
  .description('Convert Google Keep notes to sensible file formats like JSON (default) and CSV.')
  .option('-f, --fix', 'fix naming of HTML files (workaround for Google Takeout bug)')
  .option('-c, --csv', 'save data as CSV file (in addition to JSON)')
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
    console.error(error(`Error: ${e.message}`));
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
  if (e.code === 'ENOENT') {
    console.error(error(`Error: No ${dir} directory found!`));
  } else {
    console.error(error(`Error: ${e.message}`));
  }
  process.exit(1);
}

// === save ===

if (notes.length) {
  try {
    savedFiles = saver.writeFile(notes, program.csv);
  } catch (e) {
    console.error(error(`Error: ${e.message}`));
    process.exit(1);
  }
}

// === result info ===

console.log(log(`- Renamed ${metrics.renamedFiles} files`));
console.log(log(`- Scraped ${metrics.scrapedFiles} / ${metrics.triedFiles} files`));
if (failedFiles.length) {
  console.warn(warn('- Failed files:'));
  failedFiles.forEach(ff => console.warn(warn(`  > ${ff}`)));
}
console.log(log(`- Data saved to "${savedFiles.join('" and "')}"`));

// GitHub: https://github.com/amerker
