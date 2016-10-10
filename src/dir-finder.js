const fs = require('fs');

exports.findDir = (dirsToCheck) => {
  const foundDir = dirsToCheck.find((d) => {
    try {
      fs.lstatSync(d);
      return true;
    } catch (e) {
      return false;
    }
  });

  if (!foundDir) {
    throw Error('NODIR');
  }

  return foundDir;
};
