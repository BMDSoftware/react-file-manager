const multer = require("multer");
const path = require("path");
const fs = require("fs");

const BASE_PATH = require("../controllers/filesystem.controller");

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    let uploadPath = BASE_PATH;

    if (req.body.parentId) {
      try {
        parentFolderPath = req.body.parentId;
        uploadPath = path.join(BASE_PATH, parentFolderPath);
      } catch (error) {
        return cb(error, false);
      }
    }
    
    else{
      uploadPath = path.join(BASE_PATH, req.body.workspace);
    }

    const fullFilePath = path.join(uploadPath, file.originalname);
    if (fs.existsSync(fullFilePath)) {
      return cb(new multer.MulterError("File already exists!", file), false);
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

module.exports = upload;
