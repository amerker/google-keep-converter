import fs from 'fs';
import json2csv from 'json2csv';
import moment from 'moment';

const BASE_FILENAME = `keep-notes-${moment().format('YYYY-MM-DD-HHmm')}`;

const saveJson = (notes, baseFilename) => {
  const filename = `${baseFilename}.json`;
  fs.writeFileSync(filename, JSON.stringify(notes, null, 4), 'utf8');
  return filename;
};

const saveCsv = (notes, baseFilename) => {
  const filename = `${baseFilename}.csv`;
  const csvData = json2csv({ data: notes });
  fs.writeFileSync(filename, csvData, 'utf8');
  return filename;
};

const writeFile = (notes = [], hasCsvOutput = false, baseFilename = BASE_FILENAME) => {
  const savedTo = [saveJson(notes, baseFilename)];
  if (hasCsvOutput) {
    savedTo.push(saveCsv(notes, baseFilename));
  }
  return savedTo;
};

export default writeFile;
