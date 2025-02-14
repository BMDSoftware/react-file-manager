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
    url: "http://localhost:3005/api/file-system/upload",
  };
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState("");
  const isMountRef = useRef(false);

  const fetchWorkspacePath = () => {
    const elements = ["/workspace1"];
    const randomIndex = Math.floor(Math.random() * 1);
    return elements[randomIndex];
  };
  
   // Get Files
   const getFiles = async () => {
    setIsLoading(true);
    const response = (await getAllFilesAPI(
      fetchWorkspacePath(),
      currentPath
    ));

    // clear files that need to be replaced as to not present old data, for example when a file is deleted

    const currentFullPath = fetchWorkspacePath() + currentPath;

    setFiles((prevFiles) => {
      // Filter out items that may have suffered some change -> currentPath
      
      const filteredFiles = prevFiles.filter((file) => !file._id.startsWith(currentFullPath + "/"));

      const uniqueNewFiles = response.data.filter(
        (newItem) => !filteredFiles.some((existingItem) => existingItem._id === newItem._id)
      );

      return ([...filteredFiles, ...uniqueNewFiles]);
    });
    
    setIsLoading(false);
  };

  useEffect(() => {
    if (isMountRef.current) return;
    isMountRef.current = true;
    getFiles();
  }, [files]);

  // Create Folder
  const handleCreateFolder = async (name, parentFolder) => {
    setIsLoading(true);
    const response = (await createFolderAPI(
      name,
      parentFolder?._id,
      fetchWorkspacePath(),
    ))
    if (response.status === 200 || response.status === 201) {
      setFiles((prev) => [...prev, response.data]);
    } else {
      console.error(response);
    }
    setIsLoading(false);
  };

  // File Upload Handlers
  const handleFileUploading = (_file, parentFolder) => {
    return { parentId: parentFolder?._id, workspace: fetchWorkspacePath() };
  };

  const handleFileUploaded = (response) => {
    const uploadedFile = JSON.parse(response);
    setFiles((prev) => [...prev, uploadedFile]);
  };

  // Rename File/Folder
  const handleRename = async (file, newName) => {
    setIsLoading(true);
    const response = await renameAPI(file._id, newName, fetchWorkspacePath());
    if (response.status === 200) {
      getFiles();
    } else {
      console.error(response);
    }
    setIsLoading(false);
  };

  // Delete File/Folder
  const handleDelete = async (files) => {
    setIsLoading(true);
    const idsToDelete = files.map((file) => file._id);
    const response = await deleteAPI(idsToDelete, fetchWorkspacePath());
    if (response.status === 200) {
      getFiles();
    } else {
      console.error(response);
    }
    setIsLoading(false);
  };


  // Paste File/Folder
  const handlePaste = async (
    copiedItems,
    destinationFolder,
    operationType,
  ) => {
    setIsLoading(true);
    const copiedItemIds = copiedItems.map((item) => item._id);
    if (operationType === "copy") {
      try {
        (await copyItemAPI(
          copiedItemIds,
          destinationFolder?._id,
          fetchWorkspacePath(),
        ))
        getFiles();
      } catch (error) {
        setIsLoading(false);
      }
    } else {
      try {
        (await moveItemAPI(
          copiedItemIds,
          destinationFolder?._id,
          fetchWorkspacePath(),
        ))
        getFiles();
      } catch (error) {
        setIsLoading(false);
      }
    }
  };

  // Refresh Files
  const handleRefresh = () => {
    getFiles();
  };

  const handleError = (error, file) => {
    console.error(`Error on file: ${file.name}`, error);
  };

  const handleDownload = async (files) => {
    await downloadFile(files);
  };

  const handleLayoutChange = async (layout) => {
  }

  const fetchData = async (additionalPath) => {
    try {
      const response = await getAllFilesAPI(fetchWorkspacePath(), additionalPath);
      const data = await response.data;
      
      setFiles((prevFiles) => {
        // Filter out items that already exist
        const uniqueNewFiles = data.filter(
          (newItem) => !prevFiles.some((existingItem) => existingItem._id === newItem._id)
        );
        return ([...prevFiles, ...uniqueNewFiles]);
      });

    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setCurrentPath(additionalPath);
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
          onError={handleError}
          layout="list"
          enableFilePreview
          maxFileSize={104857600} 
          filePreviewPath={"http://localhost:3000"}
          height="100%"
          width="100%"
          initialPath=""
          onSelectFolder={fetchData}
          allowUpload = {false}
          allowDownload = {false}
          allowFolderCreation = {false}
          allowDelete = {false}
          allowRename = {false}
          allowMoveOrCopy= {false}
        />
      </div>
    </div>
  );
}

export default App;
