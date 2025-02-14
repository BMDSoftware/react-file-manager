import { createContext, useContext, useState, useEffect } from "react";
import { validateApiCallback } from "../utils/validateApiCallback";

const SelectionContext = createContext();

const SelectionProvider = ({ children, onDownload, onSelectionChange, allowDownload }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  const handleDownload = () => {
    if (allowDownload){
      validateApiCallback(onDownload, "onDownload", selectedFiles);
    }
  };

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedFiles);
    }
  }, [selectedFiles, onSelectionChange]);

  return (
    <SelectionContext.Provider value={{ selectedFiles, setSelectedFiles, handleDownload }}>
      {children}
    </SelectionContext.Provider>
  );
};

const useSelection = () => {
  return useContext(SelectionContext);
};

// Export everything consistently
export { SelectionProvider, useSelection };
