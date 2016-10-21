import fs from 'fs';
import json2csv from 'json2csv';
import moment from 'moment';

const BASE_FILENAME = `keep-notes-${moment().format('YYYY-MM-DD-HHmm')}`;

export const saveJson = (notes = [], baseFilename = BASE_FILENAME) => {
  const filename = `${baseFilename}.json`;
  fs.writeFileSync(filename, JSON.stringify(notes, null, 4), 'utf8');
  return filename;
};

export const saveCsv = (notes = [], baseFilename = BASE_FILENAME) => {
  const filename = `${baseFilename}.csv`;
  const csvData = json2csv({ data: notes });
  fs.writeFileSync(filename, csvData, 'utf8');
  return filename;
};

export const writeFile = (notes = [], hasCsvOutput = false) => {
  const savedTo = [saveJson(notes)];
  if (hasCsvOutput) {
    savedTo.push(saveCsv(notes));
  }
  return savedTo;
};
