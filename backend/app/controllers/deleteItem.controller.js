const fs = require("fs");
const path = require("path");
const BASE_PATH = require('./filesystem.controller');


const deleteItem = async (req, res) => {

  const { ids, workspace } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "Invalid request body, expected an array of ids." });
  }

  try {

    filesToDelete = [];
    for (let i = 0; i <  ids.length; i++){
      if (fs.existsSync(BASE_PATH + workspace + ids[i])) {
        filesToDelete.push( ids[i]);
      }
    }

    if (ids.length !== filesToDelete.length) {
      return res.status(404).json({ error: "One or more of the provided ids do not exist." });
    }

    const deletePromises = ids.map(async (item) => {
      const itemPath = path.join(BASE_PATH, workspace, item);
      await fs.promises.rm(itemPath, { recursive: true });

    });

    await Promise.all(deletePromises);

    res.status(200).json({ message: "File(s) or Folder(s) deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = deleteItem;
