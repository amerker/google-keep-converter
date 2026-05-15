import path from 'path';

// eslint-disable-next-line no-control-regex
const sanitize = (str) => str.replace(/[<>:"/\\|?*\x00-\x1f]/g, '').trim().replace(/\s+/g, '-').slice(0, 100);

export const toFilename = (note) => {
  const stem = note.title ? sanitize(note.title) : path.basename(note.sourceFile, '.json');
  return `${stem || path.basename(note.sourceFile, '.json')}.md`;
};

const frontmatter = (note) => {
  const lines = ['---'];
  if (note.title) lines.push(`title: ${JSON.stringify(note.title)}`);
  lines.push(`created: ${note.created}`);
  lines.push(`updated: ${note.updated}`);
  if (note.labels.length) lines.push(`tags: [${note.labels.map(l => JSON.stringify(l)).join(', ')}]`);
  if (note.color !== 'DEFAULT') lines.push(`color: ${note.color}`);
  if (note.isPinned) lines.push('pinned: true');
  if (note.isArchived) lines.push('archived: true');
  lines.push('---');
  return lines.join('\n');
};

const body = (note) => {
  const parts = [];

  if (note.listItems) {
    parts.push(note.listItems.map(({ text, isChecked }) =>
      `- [${isChecked ? 'x' : ' '}] ${text}`
    ).join('\n'));
  } else if (note.content) {
    parts.push(note.content);
  }

  for (const { filePath } of note.attachments) {
    parts.push(`![](${filePath})`);
  }

  if (note.annotations.length) {
    parts.push(note.annotations.map(({ title, url }) => `[${title || url}](${url})`).join('\n'));
  }

  return parts.join('\n\n');
};

export const toMarkdown = (note) => {
  const b = body(note);
  return b ? `${frontmatter(note)}\n\n${b}\n` : `${frontmatter(note)}\n`;
};
