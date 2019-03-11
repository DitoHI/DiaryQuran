export function createDir(folderName, cb) {
  const fs = require('fs');
  if (!fs.existsSync(folderName)) {
    fs.mkdir(folderName, function (err) {
      if (err) {
        if (err.code === 'EEXIST') {
          cb(null);
        } else {
          cb(err);
        }
      } else {
        cb(null);
      }
    })
  }
}
