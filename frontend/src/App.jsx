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
  const [limit] = useState(1000); // fetch 50 files at most for any request
  const [currentPath, setCurrentPath] = useState("");
  const isMountRef = useRef(false);
  const [offsetByPath, setOffsetByPath] = useState({});
  const [currentTotal, setCurrentTotal] = useState(0);
  const [currentFetched, setCurrentFetched] = useState(0); // number of items fetched at folder level

  // Behavior modes when fetching the files from backend
  const FetchMode = {
    INITIAL: "INITIAL", // Executed at startup, and as well when we select a given folder
    LOAD_MORE: "LOAD_MORE", // Load files with offset
    OPERATION: "OPERATION", // Load files after an operation has been executed in the files
    REFRESH: "REFRESH", // Refresh operation
  };

  const fetchWorkspacePath = () => {
    const elements = ["/workspace1"];
    const randomIndex = Math.floor(Math.random() * 1);
    return elements[randomIndex];
  };
  
  useEffect(() => {
    if (!isMountRef.current) {
      isMountRef.current = true;
      fetchData(currentPath, FetchMode.INITIAL);
    }
  }, []);


  const fetchData = async (folderPath, mode = FetchMode.INITIAL, updateOffset = true) => {
    setIsLoading(true);
    const workspacePath = fetchWorkspacePath();
  
    const currentOffset = offsetByPath[folderPath] || 0; // current offset for a given folder
    let fetchOffset = 0;
    let fetchLimit = limit;
    if (mode === FetchMode.LOAD_MORE) {
      fetchOffset = currentOffset;
    } else if (mode === FetchMode.INITIAL || mode === FetchMode.REFRESH || mode === FetchMode.OPERATION) {
      // For refresh, fetch files from 0 to currentOffset
      fetchLimit = currentOffset || limit;
    }
  
    try {
      const response = await getAllFilesAPI(workspacePath, folderPath, fetchOffset, fetchLimit);
      const { files: data, total } = response.data;
      const currentFullPath = workspacePath + folderPath;
      setFiles((prevFiles) => {
        // INITIAL or LOAD_MORE
        if (mode === FetchMode.INITIAL || mode === FetchMode.LOAD_MORE){
          const newItems = data.filter(
            (newItem) =>
              !prevFiles.some((existingItem) => existingItem._id === newItem._id)
          );
          return [...prevFiles, ...newItems];
        }

        else if (mode === FetchMode.REFRESH) {
          // Refresh only files under current path
          const others = prevFiles.filter(
            (f) => !f._id.startsWith(currentFullPath + "/")
          );
          const existing = prevFiles.filter((f) => f._id.startsWith(currentFullPath + "/"));
          const merged = data.map((newItem) => {
            const match = existing.find((f) => f._id === newItem._id);
            return match ? { ...match, ...newItem } : newItem;
          });
          return [...others, ...merged];
        }

        else if (mode === FetchMode.OPERATION) {
          // Clear items under the path and replace with new data
          // For example, renamed files
          const others = prevFiles.filter(
            (f) => !f._id.startsWith(currentFullPath + "/")
          );
          return [...others, ...data];
        } 
      });
      
      // Only update offset on INITIAL or LOAD_MORE
      // When we change between folders , we also do not update
      if (updateOffset && (mode === FetchMode.INITIAL || mode === FetchMode.LOAD_MORE)) {
        setOffsetByPath((prev) => ({
          ...prev,
          [folderPath]: (prev[folderPath] || 0) + data.length,
        }));
      }
      
      // Set the number of fetched results for a given folder (mostly to compare with total and hide the load more button)
      if (mode === FetchMode.INITIAL || mode === FetchMode.OPERATION || mode === FetchMode.REFRESH){
        // No new files were added, what we receive from the API is the number of files
        setCurrentFetched(data.length);
      }
      else if (mode === FetchMode.LOAD_MORE) {
        // When the operation is to load more, that means there are already results (length is defined in the offsetByPath)
        // which means that to compute the total is previous + current data length
        setCurrentFetched((offsetByPath[folderPath] || 0) + data.length);
      }
      setCurrentTotal(total);
      setCurrentPath(folderPath);
    } catch (err) {
      console.error("Error fetching folder data:", err);
    }
  
    setIsLoading(false);
  };

  const handleCreateFolder = async (name, parentFolder) => {
    setIsLoading(true);
    const response = await createFolderAPI(
      name,
      parentFolder?._id,
      fetchWorkspacePath()
    );
    if (response.status === 200 || response.status === 201) {
      setFiles((prev) => [...prev, response.data]);
      // This will not go to backend, update the total and fetched variables
      setOffsetByPath((prev) => ({
        ...prev,
        [currentPath]: (prev[currentPath] || 0) + 1,
      }));
      setCurrentFetched((prev) => prev + 1);
      setCurrentTotal((prev) => prev + 1);
      
    } else {
      console.error(response);
    }
    setIsLoading(false);
  };

  const handleRename = async (file, newName) => {
    setIsLoading(true);
    const response = await renameAPI(file._id, newName, fetchWorkspacePath());
    if (response.status === 200) {
      fetchData(currentPath, FetchMode.OPERATION);
    }
    setIsLoading(false);
  };

  const handleDelete = async (files) => {
    setIsLoading(true);
    const ids = files.map((f) => f._id);
    const response = await deleteAPI(ids, fetchWorkspacePath());
    if (response.status === 200) {
      fetchData(currentPath, FetchMode.OPERATION);
    }
    setIsLoading(false);
  };

  const handlePaste = async (items, dest, opType) => {
    setIsLoading(true);
    const ids = items.map((i) => i._id);
    try {
      if (opType === "copy") {
        await copyItemAPI(ids, dest?._id, fetchWorkspacePath());
      } else {
        await moveItemAPI(ids, dest?._id, fetchWorkspacePath());
      }
      fetchData(currentPath, FetchMode.OPERATION);
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  const handleRefresh = () => {
    fetchData(currentPath, FetchMode.REFRESH);
  };

  const loadMoreFiles = () => {
    fetchData(currentPath, FetchMode.LOAD_MORE);
  };

  const handleFileUploading = (_file, parentFolder) => ({
    parentId: parentFolder?._id,
    workspace: fetchWorkspacePath(),
  });

  const handleFileUploaded = (response) => {
    const uploadedFile = JSON.parse(response);
    setFiles((prev) => [...prev, uploadedFile]);
    setOffsetByPath((prev) => ({
      ...prev,
      [currentPath]: (prev[currentPath] || 0) + 1,
    }));
    setCurrentFetched((prev) => prev + 1);
    setCurrentTotal((prev) => prev + 1);
  };
  
    // Rename File/Folder
  

  const handleDownload = async (files) => {
    await downloadFile(files);
  };

  const handleError = (err, file) => {
    console.error(`Error on ${file.name}:`, err);
  };

  const handleLayoutChange = (layout) => {
    // No-op
  };

  return (
    <div className="app">
      <div className="file-manager-container">
        <FileManager
          files={files}
          fileUploadConfig={fileUploadConfig}
          onSelectionChange={(files) => console.log("Selected files:", files)}
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
          onSelectFolder={(path) => fetchData(path, FetchMode.INITIAL, false)}
          allowUpload={true}
          allowDownload={true}
          allowFolderCreation={true}
          allowDelete={true}
          allowRename={true}
          allowMoveOrCopy={true}
          lazyLoading={true}
          loadMoreFiles={loadMoreFiles}
          currentTotal={currentTotal}
          currentFetched={currentFetched}
        />
      </div>
    </div>
  );
}

export default App;