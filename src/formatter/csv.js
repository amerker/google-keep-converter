const HEADERS = ['title', 'created', 'updated', 'content', 'labels', 'color', 'isPinned', 'isArchived', 'sourceFile'];

const escape = (val) => {
  const str = Array.isArray(val) ? val.join('; ') : String(val ?? '');
  return /[,"\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

const noteToRow = (note) => HEADERS.map(h => {
  if (h === 'content') {
    return escape(note.listItems
      ? note.listItems.map(({ text, isChecked }) => `[${isChecked ? 'x' : ' '}] ${text}`).join('\n')
      : note.content ?? '');
  }
  if (h === 'labels') return escape(note.labels);
  return escape(note[h]);
}).join(',');

export const toCsv = (notes) =>
  [HEADERS.join(','), ...notes.map(noteToRow)].join('\n');
