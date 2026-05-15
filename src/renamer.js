import fs from 'fs';

const renameToHtml = (dir) => {
  const files = fs.readdirSync(dir);

  let renamedFileNum = 0;
  files
    .filter(f => !f.match(/\.(html|jpg|png)$/))
    .forEach((f) => {
      fs.renameSync(`${dir}/${f}`, `${dir}/${f}.html`);
      renamedFileNum += 1;
    });

  return renamedFileNum;
};

export default renameToHtml;
