import Loader from "../components/Loader/Loader";
import Toolbar from "./Toolbar/Toolbar";
import NavigationPane from "./NavigationPane/NavigationPane";
import BreadCrumb from "./BreadCrumb/BreadCrumb";
import FileList from "./FileList/FileList";
import Actions from "./Actions/Actions";
import { FilesProvider } from "../contexts/FilesContext";
import { FileNavigationProvider } from "../contexts/FileNavigationContext";
import { SelectionProvider } from "../contexts/SelectionContext";
import { ClipBoardProvider } from "../contexts/ClipboardContext";
import { LayoutProvider } from "../contexts/LayoutContext";
import { useTriggerAction } from "../hooks/useTriggerAction";
import { useColumnResize } from "../hooks/useColumnResize";
import PropTypes from "prop-types";
import { dateStringValidator, urlValidator } from "../validators/propValidators";
import "./FileManager.scss";
import "./polyfill.js";

const FileManager = ({
  files,
  fileUploadConfig,
  isLoading,
  onCreateFolder,
  onFileUploading = () => {},
  onFileUploaded = () => {},
  onPaste,
  onRename,
  onDownload,
  onDelete = () => null,
  onLayoutChange = () => {},
  onRefresh,
  onFileOpen = () => {},
  onError = () => {},
  layout = "grid",
  enableFilePreview = true,
  maxFileSize,
  filePreviewPath,
  acceptedFileTypes,
  height = "600px",
  width = "100%",
  initialPath = "",
  onSelectionChange,
  filePreviewComponent,
  onSelectFolder,
  allowUpload = true,
  allowDownload = true,
  allowFolderCreation = true,
  allowDelete = true,
  allowRename = true,
  allowMoveOrCopy= true,
  lazyLoading = false,
  loadMoreFiles,
  currentTotal = 0,
  currentFetched = 0
}) => {

  const permissions = {"uploadFile" : allowUpload, "download" : allowDownload, "createFolder" : allowFolderCreation, "delete" : allowDelete, "rename": allowRename, "move": allowMoveOrCopy, "copy": allowMoveOrCopy}

  const triggerAction = useTriggerAction(permissions);

  const { containerRef, colSizes, isDragging, handleMouseMove, handleMouseUp, handleMouseDown } =
    useColumnResize(20, 80);

  return (
    <main
      className="file-explorer"
      onContextMenu={(e) => e.preventDefault()}
      style={{ height, width }}
    >
      <Loader isLoading={isLoading} />
      <FilesProvider filesData={files} onError={onError}>
        <FileNavigationProvider initialPath={initialPath}>
          <SelectionProvider onDownload={onDownload} onSelectionChange={onSelectionChange} allowDownload={allowDownload}>
            <ClipBoardProvider onPaste={onPaste}>
              <LayoutProvider layout={layout}>
                <Toolbar
                  allowCreateFolder={permissions["createFolder"]}
                  allowUploadFile={permissions["uploadFile"]}
                  onLayoutChange={onLayoutChange}
                  onRefresh={onRefresh}
                  triggerAction={triggerAction}
                  permissions={permissions}
                />
                <section
                  ref={containerRef}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  className="files-container"
                >
                  <div className="navigation-pane" style={{ width: colSizes.col1 + "%" }}>
                    <NavigationPane onSelectFolder={onSelectFolder}/>
                    <div
                      className={`sidebar-resize ${isDragging ? "sidebar-dragging" : ""}`}
                      onMouseDown={handleMouseDown}
                    />
                  </div>

                  <div className="folders-preview" style={{ width: colSizes.col2 + "%" }}>
                    <BreadCrumb onSelectFolder={onSelectFolder}/>
                    <FileList
                      onCreateFolder={onCreateFolder}
                      onRename={onRename}
                      onFileOpen={onFileOpen}
                      onRefresh={onRefresh}
                      enableFilePreview={enableFilePreview}
                      triggerAction={triggerAction}
                      onSelectFolder={onSelectFolder}
                      permissions={permissions}
                      lazyLoading={lazyLoading}
                      loadMoreFiles={loadMoreFiles}
                      currentTotal={currentTotal}
                      currentFetched={currentFetched}
                      isLoading={isLoading}
                    />
                  </div>
                </section>

                <Actions
                  fileUploadConfig={fileUploadConfig}
                  onFileUploading={onFileUploading}
                  onFileUploaded={onFileUploaded}
                  onDelete={onDelete}
                  onRefresh={onRefresh}
                  maxFileSize={maxFileSize}
                  filePreviewPath={filePreviewPath}
                  filePreviewComponent={filePreviewComponent}
                  acceptedFileTypes={acceptedFileTypes}
                  triggerAction={triggerAction}
                  permissions={permissions}
                />
              </LayoutProvider>
            </ClipBoardProvider>
          </SelectionProvider>
        </FileNavigationProvider>
      </FilesProvider>
    </main>
  );
};

FileManager.displayName = "FileManager";

FileManager.propTypes = {
  files: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      isDirectory: PropTypes.bool.isRequired,
      path: PropTypes.string.isRequired,
      updatedAt: dateStringValidator,
      size: PropTypes.number,
    })
  ).isRequired,
  fileUploadConfig: PropTypes.shape({
    url: urlValidator,
    headers: PropTypes.objectOf(PropTypes.string),
  }),
  isLoading: PropTypes.bool,
  onCreateFolder: PropTypes.func,
  onFileUploading: PropTypes.func,
  onFileUploaded: PropTypes.func,
  onRename: PropTypes.func,
  onDelete: PropTypes.func,
  onPaste: PropTypes.func,
  onDownload: PropTypes.func,
  onLayoutChange: PropTypes.func,
  onRefresh: PropTypes.func,
  onFileOpen: PropTypes.func,
  onError: PropTypes.func,
  layout: PropTypes.oneOf(["grid", "list"]),
  maxFileSize: PropTypes.number,
  enableFilePreview: PropTypes.bool,
  filePreviewPath: urlValidator,
  acceptedFileTypes: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  initialPath: PropTypes.string,
  filePreviewComponent: PropTypes.func,
};

export default FileManager;
