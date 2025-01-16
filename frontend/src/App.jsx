import { useEffect, useRef, useState, useContext } from "react";
import FileManager from "./FileManager/FileManager";
import { createFolderAPI } from "./api/createFolderAPI";
import { renameAPI } from "./api/renameAPI";
import { deleteAPI } from "./api/deleteAPI";
import { copyItemAPI, moveItemAPI } from "./api/fileTransferAPI";
import { getAllFilesAPI } from "./api/getAllFilesAPI";
import { downloadFile } from "./api/downloadFileAPI";
import "./App.scss";

function App() {
  const fileUploadConfig = {
    url: "http://localhost:3000/api/file-system/upload",
  };
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const isMountRef = useRef(false);

  // Get Files
  const getFiles = async () => {
    setIsLoading(true);
    const response = await getAllFilesAPI();
    setFiles(response.data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isMountRef.current) return;
    isMountRef.current = true;
    getFiles();
  }, []);
  //

  // Create Folder
  const handleCreateFolder = async (name, parentFolder) => {
    setIsLoading(true);
    const response = await createFolderAPI(name, parentFolder?.path);
    if (response.status === 200 || response.status === 201) {
      setFiles((prev) => [...prev, response.data]);
    } else {
      console.error(response);
    }
    setIsLoading(false);
  };
  //

  // File Upload Handlers
  const handleFileUploading = (file, parentFolder) => {
    return { parentId: parentFolder?._id };
  };

  const handleFileUploaded = (response) => {
    setFiles((prev) => [...prev, JSON.parse(response)]);
  };
  //

  // Rename File/Folder
  const handleRename = async (file, newName) => {
    setIsLoading(true);
    const response = await renameAPI(file._id, newName);
    if (response.status === 200) {
      getFiles();
    } else {
      console.error(response);
    }
    setIsLoading(false);
  };
  //

  // Delete File/Folder
  const handleDelete = async (files) => {
    setIsLoading(true);
    const idsToDelete = files.map((file) => file._id);
    const response = await deleteAPI(idsToDelete);
    if (response.status === 200) {
      getFiles();
    } else {
      console.error(response);
      setIsLoading(false);
    }
  };
  //

  // Paste File/Folder
  const handlePaste = async (copiedItems, destinationFolder, operationType) => {
    setIsLoading(true);
    const copiedItemIds = copiedItems.map((item) => item._id);
    if (operationType === "copy") {
      const response = await copyItemAPI(copiedItemIds, destinationFolder?._id);
    } else {
      const response = await moveItemAPI(copiedItemIds, destinationFolder?._id);
    }
    await getFiles();
  };
  //

  const handleLayoutChange = (layout) => {
    console.log(layout);
  };

  // Refresh Files
  const handleRefresh = () => {
    getFiles();
  };
  //

  const handleFileOpen = (file) => {
    console.log(`Opening file: ${file.name}`);
  };

  const handleError = (error, file) => {
    console.error(error);
  };

  const handleDownload = async (files) => {
    console.log("downloading files...");
    await downloadFile(files);
  };

  return (
    <div className="app">
      <div className="file-manager-container">
        <FileManager
          files={files}
          fileUploadConfig={fileUploadConfig}
          onSelectionChange={(files) => console.log('Selected files:', files)}
          isLoading={isLoading}
          onCreateFolder={handleCreateFolder}
          onFileUploading={handleFileUploading}
          onFileUploaded={handleFileUploaded}
          onPaste={handlePaste}
          onRename={handleRename}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onLayoutChange={handleLayoutChange}
          onRefresh={handleRefresh}
          onFileOpen={handleFileOpen}
          onError={handleError}
          layout="list"
          enableFilePreview
          maxFileSize={104857600} 
          filePreviewPath={"http://localhost:3000"}
          height="100%"
          width="100%"
          initialPath=""
        />
      </div>
    </div>
  );
}

export default App;
