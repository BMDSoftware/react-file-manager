const fs = require("fs").promises;
const mime = require('mime-types');
const path = require("path");
const BASE_PATH = require('./filesystem.controller');
const normalizePath = require("./utils.controller");

async function readDirRecursively(dirPath, workspace) {
  let result = [];

  const files = await fs.readdir(BASE_PATH + dirPath, { withFileTypes: true });

  for (const file of files) {
    const fullPath = normalizePath(path.join(BASE_PATH + dirPath, file.name));
    const relativePath = fullPath.replace(BASE_PATH, "");
    // Need this so that UI can construct the tree, otherwise it does not show nothing with the react component
    const pathWithoutWorkSpace = relativePath.replace(workspace, "");
    if (file.isDirectory()) {
      // If the file is a directory, recurse into it and add information about each directory
      // Ignore files that give errors, e.g. broken symlinks
      let stats;
      try {
        stats = await fs.stat(fullPath);
      } catch (error) {
        continue;
      }
      result.push({
        _id: relativePath,
        name: file.name,
        path: pathWithoutWorkSpace,
        isDirectory: true,
        createdAt: stats.birthtime,
        updatedAt: stats.mtime,
      });
      result = result.concat(await readDirRecursively(relativePath, workspace));
    }
    else {
      // Otherwise, just push the file's details
      // Ignore files that give errors, e.g. broken symlinks
      let stats;
      try {
        stats = await fs.stat(fullPath);
      } catch (error) {
        continue;
      }
      result.push({
        _id: relativePath,
        name: file.name,
        path: pathWithoutWorkSpace,
        isDirectory: false,
        size: stats.size,
        mimeType: mime.lookup(fullPath),
        createdAt: stats.birthtime,
        updatedAt: stats.mtime,
      });
    }
  }

  return result;
}

const getItems = async (req, res) => {
  try {
    directoryPath = "";
    const { workspace } = req.query;
    const files = await readDirRecursively(directoryPath + "/" + workspace, workspace, {
      withFileTypes: true,
    });

    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = getItems;
