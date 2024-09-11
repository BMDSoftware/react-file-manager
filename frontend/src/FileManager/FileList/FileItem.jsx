import { useEffect, useState } from "react";
import { FaRegFile, FaRegFolderOpen, FaRegPaste } from "react-icons/fa6";
import { PiFolderOpen } from "react-icons/pi";
import { MdOutlineDelete } from "react-icons/md";
import ContextMenu from "../../components/ContextMenu/ContextMenu";
import { useDetectOutsideClick } from "../../hooks/useDetectOutsideClick";
import { BiRename } from "react-icons/bi";
import { BsCopy, BsScissors } from "react-icons/bs";
import { useFileIcons } from "../../hooks/useFileIcons";
import CreateFolderAction from "../Actions/CreateFolder/CreateFolder.action";
import RenameAction from "../Actions/Rename/Rename.action";
import { getDataSize } from "../../utils/getDataSize";
import { formatDate } from "../../utils/formatDate";
import { useFileNavigation } from "../../contexts/FileNavigationContext";
import { useSelection } from "../../contexts/SelectionContext";
import { useClipBoard } from "../../contexts/ClipboardContext";
import { useLayout } from "../../contexts/LayoutContext";

const FileItem = ({
  index,
  file,
  onCreateFolder,
  onPaste,
  onRename,
  filesViewRef,
  selectedFileIndex,
  setSelectedFileIndex,
  triggerAction,
}) => {
  const { activeLayout } = useLayout();
  const iconSize = activeLayout === "grid" ? 48 : 20;
  const fileIcons = useFileIcons(iconSize);
  const { setCurrentPath, currentPathFiles } = useFileNavigation();
  const { isItemSelection, setSelectedFile } = useSelection();
  const { clipBoard, setClipBoard } = useClipBoard();

  const [visible, setVisible] = useState(false);
  const [fileSelected, setFileSelected] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);
  const isFileMoving =
    clipBoard?.isMoving &&
    clipBoard.files.find((f) => f.name === file.name && f.path === file.path);

  const contextMenuRef = useDetectOutsideClick(() => {
    setVisible(false);
  });

  const handleCutCopy = (e, isMoving) => {
    e.stopPropagation();
    setClipBoard({
      files: [file],
      isMoving: isMoving,
    });
    setVisible(false);
  };

  const handleFilePasting = (e) => {
    e.stopPropagation();
    if (clipBoard) {
      const selectedCopiedFile = clipBoard.files[0];
      const operationType = clipBoard.isMoving ? "move" : "copy";

      onPaste(selectedCopiedFile, file, operationType);

      clipBoard.isMoving && setClipBoard(null);
      setSelectedFile(null);
      setVisible(false);
    }
  };

  const handleRenaming = (e) => {
    e.stopPropagation();
    setVisible(false);
    triggerAction.show("rename");
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setVisible(false);
    triggerAction.show("delete");
  };

  const handleFileAccess = () => {
    setVisible(false);
    if (file.isDirectory) {
      setCurrentPath((prev) => prev + "/" + file.name);
      setSelectedFileIndex(null);
      setSelectedFile(null);
    } else {
      // Display File Image/PDF/Txt etc
      triggerAction.show("previewFile");
    }
  };

  const handleFileSelection = (e) => {
    e.stopPropagation();
    if (file.isEditing) return;

    setSelectedFile(file);
    setSelectedFileIndex(index);
    const currentTime = new Date().getTime();
    if (currentTime - lastClickTime < 300) {
      handleFileAccess();
      return;
    }
    setLastClickTime(currentTime);
  };

  const handleFileOpen = (e) => {
    e.stopPropagation();
    handleFileAccess();
  };

  const handleOnKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      setSelectedFile(file);
      setSelectedFileIndex(index);
      handleFileAccess();
    }
  };

  useEffect(() => {
    setFileSelected(selectedFileIndex === index);
  }, [selectedFileIndex]);

  useEffect(() => {
    selectedFileIndex === index && setFileSelected(isItemSelection);
  }, [isItemSelection]);

  const menuItems = (
    <div className="file-context-menu-list">
      <ul>
        <li onClick={handleFileOpen}>
          {file.isDirectory ? <PiFolderOpen size={20} /> : <FaRegFile size={16} />}
          <span>Open</span>
        </li>
        <li onClick={(e) => handleCutCopy(e, true)}>
          <BsScissors size={19} />
          <span>Cut</span>
        </li>
        <li onClick={(e) => handleCutCopy(e, false)}>
          <BsCopy strokeWidth={0.1} size={17} />
          <span>Copy</span>
        </li>
        {file.isDirectory ? (
          <li onClick={handleFilePasting} className={`${clipBoard ? "" : "disable-paste"}`}>
            <FaRegPaste size={18} />
            <span>Paste</span>
          </li>
        ) : (
          <></>
        )}
        <li onClick={handleRenaming}>
          <BiRename size={19} />
          <span>Rename</span>
        </li>
        <li onClick={handleDelete}>
          <MdOutlineDelete size={19} />
          <span>Delete</span>
        </li>
      </ul>
    </div>
  );

  return (
    <>
      <ContextMenu
        filesViewRef={filesViewRef}
        contextMenuRef={contextMenuRef.ref}
        visible={visible}
        setVisible={setVisible}
        content={menuItems}
      >
        <div
          className={`file-item-container ${
            fileSelected || !!file.isEditing ? "file-selected" : ""
          } ${isFileMoving ? "file-moving" : ""}`}
          title={file.name}
          onClick={handleFileSelection}
          onKeyDown={handleOnKeyDown}
          onContextMenu={(e) => {
            if (currentPathFiles.some((f) => f.isEditing)) {
              e.preventDefault();
              e.stopPropagation();
              return;
            }
            setSelectedFile(file);
            setSelectedFileIndex(index);
          }}
          tabIndex={0}
        >
          <div className="file-item">
            {file.isDirectory ? (
              <FaRegFolderOpen size={iconSize} />
            ) : (
              <>
                {fileIcons[file.name?.split(".").pop()?.toLowerCase()] ?? (
                  <FaRegFile size={iconSize} />
                )}
              </>
            )}

            {file.isEditing ? (
              <div className={`rename-file-container ${activeLayout}`}>
                {triggerAction.actionType === "createFolder" ? (
                  <CreateFolderAction
                    filesViewRef={filesViewRef}
                    file={file}
                    onCreateFolder={onCreateFolder}
                    triggerAction={triggerAction}
                  />
                ) : (
                  <RenameAction
                    filesViewRef={filesViewRef}
                    file={file}
                    onRename={onRename}
                    triggerAction={triggerAction}
                  />
                )}
              </div>
            ) : (
              <span className="text-truncate file-name">{file.name}</span>
            )}
          </div>

          {activeLayout === "list" && (
            <>
              <div className="modified-date">{formatDate(file.updatedAt)}</div>
              <div className="size">{file?.size > 0 ? getDataSize(file?.size) : ""}</div>
            </>
          )}
        </div>
      </ContextMenu>
    </>
  );
};

export default FileItem;
