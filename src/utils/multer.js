const multer = require("multer");

const excelStorage = multer.memoryStorage();

const upload = multer({
  storage: excelStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel files are allowed"));
    }
  },
});

const pdfStorage = multer.memoryStorage();

const uploadPdf = multer({
  storage: pdfStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});






const imageStorage = multer.memoryStorage();

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") // jpeg, png, jpg, webp, etc.
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

module.exports = {
  upload,
  uploadPdf,
  uploadImage
};
