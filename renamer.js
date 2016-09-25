'use strict';

const fs = require('fs');

exports.renameToHtml = (dir) => {
  const files = fs.readdirSync(dir);

  let renamedFiles = 0;
  files
    .filter(f => !f.match(/\.(html|jpg|png)$/))
    .forEach((f) => {
      fs.rename(dir + f, `${dir}${f}.html`);
      renamedFiles += 1;
    });

  return renamedFiles;
};
