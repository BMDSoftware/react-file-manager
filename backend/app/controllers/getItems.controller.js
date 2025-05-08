const fs = require("fs").promises;
const mime = require('mime-types');
const path = require("path");
const BASE_PATH = require('./filesystem.controller');
const normalizePath = require("./utils.controller");

async function readDir(dirPath, workspace, offset, limit, state = { count: 0, collected: [] }) {
  const files = await fs.readdir(BASE_PATH + dirPath, { withFileTypes: true });
  const total = files.length;

  for (const file of files) {
    if (state.collected.length >= limit) break;

    const fullPath = normalizePath(path.join(BASE_PATH + dirPath, file.name));
    const relativePath = fullPath.replace(BASE_PATH, "");
    const pathWithoutWorkSpace = relativePath.replace(workspace, "");

    let stats;
    try {
      stats = await fs.stat(fullPath);
    } catch (error) {
      console.log("error on file ", pathWithoutWorkSpace);
      continue;
    }

    const item = {
      _id: relativePath,
      name: file.name,
      path: pathWithoutWorkSpace,
      isDirectory: file.isDirectory(),
      createdAt: stats.birthtime,
      updatedAt: stats.mtime,
      ...(file.isDirectory() ? {} : {
        size: stats.size,
        mimeType: mime.lookup(fullPath),
      }),
    };

    if (state.count >= offset) {
      state.collected.push(item);
    }

    state.count++;
  }

  return {files: state.collected, total}
}

const getItems = async (req, res) => {
  try {
    directoryPath = "";
    const { workspace, currentPath, offset, limit } = req.query;
    
    addPath = currentPath || "";

    const files = await readDir(directoryPath + "/" + workspace + addPath, workspace, offset, limit);

    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = getItems;
