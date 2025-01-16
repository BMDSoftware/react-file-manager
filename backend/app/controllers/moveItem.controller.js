const fs = require("fs");
const path = require("path");
const BASE_PATH = require('./filesystem.controller');


const moveItem = async (req, res) => {

  const { sourceIds, destinationId, workspace } = req.body;
  const isRootDestination = !destinationId;

  if (!sourceIds || !Array.isArray(sourceIds) || sourceIds.length === 0) {
    return res.status(400).json({ error: "Invalid request body, expected an array of sourceIds." });
  }
  try {
    
    validFiles = [];
    for (let i = 0; i <  sourceIds.length; i++){
      if (fs.existsSync(BASE_PATH + sourceIds[i])) {
        validFiles.push( sourceIds[i])
      }
    }

    if (validFiles.length !== sourceIds.length) {
      return res.status(404).json({ error: "One or more of the provided sourceIds do not exist." });
    }

    const movePromises = sourceIds.map(async (sourceItem) => {
     
      const srcFullPath = path.join(BASE_PATH, sourceItem);

      if (isRootDestination) {
        const destFullPath = path.join(BASE_PATH, path.basename(sourceItem));
        await fs.promises.cp(srcFullPath, destFullPath, { recursive: true });
        await fs.promises.rm(srcFullPath, { recursive: true });

      } else {
        
        const destinationPath = path.join(BASE_PATH, destinationId, path.basename(sourceItem));
        await fs.promises.cp(srcFullPath, destinationPath, { recursive: true });
        await fs.promises.rm(srcFullPath, { recursive: true });
      }
      
    });

    try {
      await Promise.all(movePromises);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: "Item(s) moved successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = moveItem;
