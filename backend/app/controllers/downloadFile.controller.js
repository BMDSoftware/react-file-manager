const path = require("path");
const fs = require("fs");
const archiver = require("archiver");
const BASE_PATH = require('./filesystem.controller');


const downloadFile = async (req, res) => {
  try {
    let files = req.query.files;
    const isSingleFile = !Array.isArray(files);
    const isMultipleFiles = Array.isArray(files);


    if (!files || (!isSingleFile && !isMultipleFiles)) {
      return res
        .status(400)
        .json({ error: "Invalid request body, expected a file ID or an array of file IDs." });
    }

    if (isSingleFile) {
      
      const isDirectory = fs.statSync(BASE_PATH + files).isDirectory();
      if (isDirectory) {
        files = [files];
      } else {
        if (fs.existsSync(BASE_PATH + files)) {
          const filename = files.replace("/", "")
          res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
          // sending the file requires the full path in the host
          return res.sendFile(path.join(__dirname, '../../' + BASE_PATH, files)); 
        } else {
          return res.status(404).send("File not found");
        }
      }
    }
    
    const multipleFiles = [];
    for (let i = 0; i <  files.length; i++){
      if (fs.existsSync(BASE_PATH + files[i])) {
        multipleFiles.push( files[i]);
      }
    }
    
    if (!multipleFiles || multipleFiles.length !== files.length) {
      return res.status(404).json({ error: "One or more of the provided file IDs do not exist." });
    }

    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.on("error", (err) => {
      throw err;
    });

    res.setHeader("Content-Disposition", 'attachment; filename="download.zip"');
    res.setHeader("Content-Type", "application/zip");
    
    archive.pipe(res);

    multipleFiles.forEach((file) => {
      const filePath = BASE_PATH + file;
      if (fs.existsSync(filePath)) {
        const isDirectory = fs.statSync(BASE_PATH + file).isDirectory();
        if (isDirectory) {
          archive.directory(filePath, path.basename(file));
        } else {
          archive.file(filePath, {name: path.basename(file)});
        }
      } else {
        console.log("File not found");
      }
    });

    await archive.finalize();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = downloadFile;
