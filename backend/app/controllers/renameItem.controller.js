const fs = require("fs");
const path = require("path");
const BASE_PATH = require('./filesystem.controller');


const renameItem = async (req, res) => {

  try {
    const { id, newName, workspace } = req.body;

    const parentDir = `${path.dirname(id)}`;
    const newPath = `${parentDir}${parentDir === "/" ? "" : "/"}${newName}`;

    const oldFullPath = path.join(BASE_PATH, id);
    const newFullPath = path.join(BASE_PATH, newPath);

    if (fs.existsSync(newFullPath)) {
      return res.status(400).json({ error: "A file or folder with that name already exists!" });
    }

    await fs.promises.rename(oldFullPath, newFullPath);

    res.status(200).json({ message: "File or Folder renamed successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = renameItem;
