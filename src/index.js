#!/usr/bin/env node

const program = require('commander');
const chalk = require('chalk');

const dirFinder = require('./dir-finder');
const renamer = require('./renamer');
const scraper = require('./scraper');
const saver = require('./saver');

const dirsToCheck = ['./Takeout/Keep/', './Keep/', './'];

const error = chalk.bold.red;
const log = chalk.bold.green;
const warn = chalk.gray;

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

// === find correct dir ===

let dir;
try {
  dir = dirFinder.findDir(dirsToCheck);
  console.log(log(`- Using directory ${dir}`));
} catch (e) {
  console.error(error(`Error: ${e.message}`));
  process.exit(1);
}

// === rename ===

if (program.fix) {
  try {
    metrics.renamedFiles = renamer.renameToHtml(dir);
    console.log(log(`- Renamed ${metrics.renamedFiles} files`));
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

  console.log(log(`- Scraped ${metrics.scrapedFiles} / ${metrics.triedFiles} files`));
  if (failedFiles.length) {
    console.warn(warn('- Failed files:'));
    failedFiles.forEach(ff => console.warn(warn(`  > ${ff}`)));
  }
} catch (e) {
  console.error(error(`Error: ${e.message}`));
  process.exit(1);
}

// === save ===

if (notes.length) {
  try {
    savedFiles = saver.writeFile(notes, program.csv);
    console.log(log(`- Data saved to "${savedFiles.join('" and "')}"`));
  } catch (e) {
    console.error(error(`Error: ${e.message}`));
    process.exit(1);
  }
}

// GitHub: https://github.com/amerker
