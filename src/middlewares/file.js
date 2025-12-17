const multer = require('multer')
const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const path = require("path");
const fs = require("fs");

const bookStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'Books',
    allowedFormats: ['jpg', 'png', 'jpeg', 'gif', 'webp']
  },
});
const userStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'Users',
      allowedFormats: ['jpg', 'png', 'jpeg', 'gif', 'webp']
    },
  });

const uploadCSV = multer({
  storage: multer.memoryStorage(), //file se guarda en req.file.buffer-->actualizar controladores
  fileFilter: function (req, file, cb) {
    const isCSV =
      file.mimetype === "text/csv" ||
      file.originalname.toLowerCase().endsWith(".csv");
    if (isCSV) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, //10MB límite
  },
});

const uploadBook = multer({ storage: bookStorage });
const uploadUser = multer({ storage: userStorage });

module.exports = {
  uploadBook,
  uploadUser,
  uploadCSV,
};


