import fs from 'fs';
import dayjs from 'dayjs';

const BASE_FILENAME = `keep-notes-${dayjs().format('YYYY-MM-DD-HHmm')}`;

const saveJson = (notes, baseFilename) => {
  const filename = `${baseFilename}.json`;
  fs.writeFileSync(filename, JSON.stringify(notes, null, 4), 'utf8');
  return filename;
};

const toCsvRow = (headers, obj) => {
  return headers.map(h => {
    const val = obj[h];
    const str = Array.isArray(val) ? val.join('; ') : String(val ?? '');
    return /[,"\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  }).join(',');
};

const saveCsv = (notes, baseFilename) => {
  const filename = `${baseFilename}.csv`;
  const data = Array.isArray(notes) ? notes : [notes];
  const headers = data.length ? Object.keys(data[0]) : [];
  const rows = [headers.join(','), ...data.map(n => toCsvRow(headers, n))];
  fs.writeFileSync(filename, rows.join('\n'), 'utf8');
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
