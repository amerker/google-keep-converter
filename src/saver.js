import fs from 'fs';
import path from 'path';
import { toMarkdown, toFilename } from './formatter/markdown.js';
import { toCsv } from './formatter/csv.js';

const timestamp = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
};

const writeMarkdown = (notes, outputDir) => {
  fs.mkdirSync(outputDir, { recursive: true });
  const seen = new Set();

  for (const note of notes) {
    let filename = toFilename(note);
    if (seen.has(filename)) {
      const ext = path.extname(filename);
      const stem = path.basename(filename, ext);
      let i = 2;
      while (seen.has(`${stem}-${i}${ext}`)) i++;
      filename = `${stem}-${i}${ext}`;
    }
    seen.add(filename);
    fs.writeFileSync(path.join(outputDir, filename), toMarkdown(note), 'utf8');
  }
};

const writeFiles = (notes = [], { csv = false, outputDir } = {}) => {
  const base = `keep-notes-${timestamp()}`;
  const dir = outputDir ?? base;

  writeMarkdown(notes, dir);

  let csvFile = null;
  if (csv) {
    csvFile = `${base}.csv`;
    fs.writeFileSync(csvFile, toCsv(notes), 'utf8');
  }

  return { outputDir: dir, mdCount: notes.length, csvFile };
};

export default writeFiles;
