#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';

import findDir from './dir-finder.js';
import parseKeepExport from './parser.js';
import writeFiles from './saver.js';

const dirsToCheck = ['./Takeout/Keep', './Keep', '.'];

const error = chalk.bold.red;
const log = chalk.bold.green;
const warn = chalk.gray;

program
  .description('Migrate Google Keep notes to Markdown (and optionally CSV).')
  .option('--csv', 'also export a CSV file')
  .option('--trashed', 'include trashed notes (excluded by default)')
  .option('--output <dir>', 'output directory for Markdown files')
  .parse(process.argv);

const opts = program.opts();

let dir;
try {
  dir = findDir(dirsToCheck);
  console.log(log(`- Using directory: ${dir}`));
} catch (e) {
  console.error(error(`Error: ${e.message}`));
  process.exit(1);
}

let notes;
try {
  notes = parseKeepExport(dir);
} catch (e) {
  console.error(error(`Error: ${e.message}`));
  process.exit(1);
}

if (!opts.trashed) {
  const before = notes.length;
  notes = notes.filter(n => !n.isTrashed);
  const skipped = before - notes.length;
  if (skipped) console.log(warn(`- Skipped ${skipped} trashed note${skipped !== 1 ? 's' : ''}`));
}

console.log(log(`- Parsed ${notes.length} note${notes.length !== 1 ? 's' : ''}`));

if (!notes.length) {
  console.log(warn('- No notes to export.'));
  process.exit(0);
}

try {
  const { outputDir, mdCount, csvFile } = writeFiles(notes, { csv: opts.csv, outputDir: opts.output });
  console.log(log(`- Saved ${mdCount} Markdown file${mdCount !== 1 ? 's' : ''} to ${outputDir}/`));
  if (csvFile) console.log(log(`- CSV saved to ${csvFile}`));
} catch (e) {
  console.error(error(`Error: ${e.message}`));
  process.exit(1);
}
