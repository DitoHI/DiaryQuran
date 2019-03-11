const multer = require('multer');

const UPLOAD_PATH = 'public/users/';
const { createDir } = require('../helpers');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const PHOTO_PATH = `${UPLOAD_PATH}${req.body.username}`;
    createDir(PHOTO_PATH, function (err) {
      if (err) {
        req.file.multerError = err;
      }
    });
    cb(null, PHOTO_PATH);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.body.username}-${Date.now()}.png`)
  }
});

export const upload = multer({ storage: storage });

