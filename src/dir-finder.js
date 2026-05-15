import fs from 'fs';

const findDir = (dirsToCheck) => {
  const foundDir = dirsToCheck.find((d) => {
    try {
      fs.lstatSync(d);
      return true;
    } catch {
      return false;
    }
  });

  if (!foundDir) {
    throw Error('NODIR');
  }

  return foundDir;
};

export default findDir;
