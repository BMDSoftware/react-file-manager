const fs = require("fs");
const path = require("path");
const BASE_PATH = require('./filesystem.controller');
const normalizePath = require('./utils.controller');

const createFolder = async (req, res) => {

  try {
    const { name, parentId, workspace } = req.body;

    // Path calculation
    let folderPath = "";
    if (parentId) {
      folderPath = `${parentId}/${name}`; // parentId already contains information about workspace
    } else {
      folderPath = `${workspace}/${name}`; // Root Folder
    }

    // Physical folder creation using fs
    const fullPath = normalizePath(path.join(BASE_PATH, folderPath));

    if (!fs.existsSync(fullPath)) {
      await fs.promises.mkdir(fullPath, { recursive: true });
    } else {
      return res.status(400).json({ error: "Folder already exists!" });
    }

    const newFolder = {
      _id: folderPath,
      name: name,
      isDirectory: true,
      path: folderPath.replace(workspace, ""),
    }

    res.status(201).json(newFolder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = createFolder;
