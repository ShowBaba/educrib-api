const multer = require('multer');

// configure multer

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'public/images'); // image destination
  },
  filename: (req, file, callback) => {
    callback(null, `${file.originalname}-${Date.now()}`); // originalname = same name as the client stored the name
  },
});

// filter the kind of image you want

const imageFileFilter = (req, file, callback) => {
  // check file extention;
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(new Error('You can upload only image files'), false);
  }
  callback(null, true);
};

// use configuration in application

const maxSize = 2 * 1024 * 1024; // specify img max size

const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: maxSize },
});

module.exports = upload;
