import fs from 'fs';
import json2csv from 'json2csv';
import moment from 'moment';

const baseFilename = `keep-notes-${moment().format('YYYY-MM-DD-HHmm')}`;

const saveJson = (notes = []) => {
  const filename = `${baseFilename}.json`;
  fs.writeFileSync(filename, JSON.stringify(notes, null, 4), 'utf8');
  return filename;
};

const saveCsv = (notes = []) => {
  const filename = `${baseFilename}.csv`;
  const csv = json2csv({ data: notes });
  fs.writeFileSync(filename, csv, 'utf8');
  return filename;
};

const writeFile = (notes = [], hasCsvOutput = false) => {
  const savedTo = [saveJson(notes)];
  if (hasCsvOutput) {
    savedTo.push(saveCsv(notes));
  }
  return savedTo;
};

export default writeFile;
