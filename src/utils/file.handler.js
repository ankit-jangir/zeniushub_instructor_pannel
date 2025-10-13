const multer = require('multer');
const path = require('path');
const customError = require('./error.handle');

const getMulterConfig = (allowedTypes) => {
    const storage = multer.diskStorage({

        filename: (req, file, cb) => {
            cb(null, Date.now() + path.extname(file.originalname));
        }
    });

    const fileFilter = (req, file, cb) => {
        const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = allowedTypes.test(file.mimetype);

        if (extName && mimeType) {
            cb(null, true);
        } else {
            cb(new customError(`Only ${allowedTypes} files can be uploaded!`, 400), false);
        }
    };

    return multer({
        storage: storage,
        limits: { fileSize: 1024 * 1024 * 5 },
        fileFilter: fileFilter
    });
};

module.exports = getMulterConfig;