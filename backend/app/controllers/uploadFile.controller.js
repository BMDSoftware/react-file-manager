const fs = require("fs").promises;
const BASE_PATH = require('./filesystem.controller');
const normalizePath = require("./utils.controller");

const uploadFile = async (req, res) => {

    const { parentId } = req.body;
    const file = req.file;

    let filePath = "";
    if (parentId) {
      filePath = `${parentId}/${file.originalname}`;
    } else {
      filePath = `/${file.originalname}`;
    }

    const stats = await fs.stat(BASE_PATH + filePath);
    
    const newFile = {
      _id: normalizePath(filePath),
      name: file.originalname,
      path: normalizePath(filePath),
      isDirectory: false,
      size: file.size,
      mimeType: file.mimetype,
      createdAt: stats.birthtime,
      updatedAt: stats.mtime
    };
    res.status(201).json(newFile);
};

module.exports = uploadFile;
