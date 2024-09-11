![React File Manager](https://github.com/user-attachments/assets/53b09633-220e-460d-a5a5-48f553640dd0)

An open-source React.js package for easy integration of a file manager into applications. It provides a user-friendly interface for managing files and folders, including viewing, uploading, and deleting, with full UI and backend integration.

## ✨ Features

- **File & Folder Management**: View, upload, delete, copy, move, create, and rename files or folders seamlessly.
- **Grid & List View**: Switch between grid and list views to browse files in your preferred layout.
- **Navigation**: Use the breadcrumb trail and sidebar navigation pane for quick directory traversal.
- **Toolbar & Context Menu**: Access all common actions (upload, delete, copy, move, rename, etc.) via the toolbar or right-click for the same options in the context menu.

## 🚀 Installation

To install `React File Manager`, use the following command:

```bash
npm i @cubone/react-file-manager
```

## 💻 Usage

Here’s a basic example of how to use the File Manager Component in your React application:

```javascript
import { useState } from "react";
import { FileManager } from "@cubone/react-file-manager";
import "@cubone/react-file-manager/dist/style.css";

function App() {
  const [files, setFiles] = useState([
    {
      name: "Documents",
      isDirectory: true, // Folder
      path: "/Documents", // Located in Root directory
      updatedAt: "2024-09-09T10:30:00Z", // Last updated time (ISO 8601 format)
    },
    {
      name: "Pictures",
      isDirectory: true, // Folder
      path: "/Pictures", // Located in Root directory
      updatedAt: "2024-09-09T11:00:00Z", // Last updated time (ISO 8601 format)
    },
    {
      name: "Pic.png",
      isDirectory: false, // File
      path: "/Pictures/Pic.png", // Located inside the "Pictures" folder
      updatedAt: "2024-09-08T16:45:00Z", // Last updated time (ISO 8601 format)
      size: 2048, // File size in bytes (example: 2 KB)
    },
  ]);

  return (
    <>
      <FileManager files={files} />
    </>
  );
}
```

## 📂 File Structure

The `files` prop accepts an array of objects, where each object represents a file or folder. You can customize the structure to meet your application needs. Each file or folder object follows the structure detailed below:

```typescript
type File = {
  name: string;
  isDirectory: boolean;
  path: string;
  updatedAt?: string;
  size?: number;
};
```

## ⚙️ Props

| Name                    | Type                                                                                                                   | Description                                                                                                                                                                                                                                                                                                                                                                             |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `files`                 | Array<[File](#-file-structure)>                                                                                        | An array of file and folder objects representing the current directory structure. Each object includes `name`, `isDirectory`, and `path` properties.                                                                                                                                                                                                                                    |
| `isLoading`             | boolean                                                                                                                | A boolean state indicating whether the application is currently performing an operation, such as creating, renaming, or deleting a file/folder. Displays a loading state if set `true`.                                                                                                                                                                                                 |
| `fileUploadConfig`      | { url: string; headers?: { [key: string]: string } }                                                                   | Configuration object for file uploads. It includes the upload URL (`url`) and an optional `headers` object for setting custom HTTP headers in the upload request. The `headers` object can accept any standard or custom headers required by the server. Example: `{ url: "https://example.com/fileupload", headers: { Authorization: "Bearer" + TOKEN, "X-Custom-Header": "value" } }` |
| `filePreviewPath`       | String                                                                                                                 | The base URL for file previews e.g. `https://example.com`, file path will be appended automatically to it i.e. `https://example.com/yourFilePath`.                                                                                                                                                                                                                                      |
| `allowedFileExtensions` | String                                                                                                                 | A comma-separated list of allowed file extensions for uploading files. (e.g., `.txt, .png, .pdf`).                                                                                                                                                                                                                                                                                      |
| `onCreateFolder`        | (name: string, parentFolder: [File](#-file-structure)) => void                                                         | A callback function triggered when a new folder is created. Use this function to update the files state to include the new folder under the specified parent folder using create folder API call to your server.                                                                                                                                                                        |
| `onFileUploading`       | (file: [File](#-file-structure), parentFolder: [File](#-file-structure)) => { [key: string]: any }                     | A callback function triggered during the file upload process. You can also return an object with key-value pairs that will be appended to the `FormData` along with the file being uploaded. The object can contain any number of valid properties.                                                                                                                                     |
| `onFileUploaded`        | (response: { [key: string]: any }) => void                                                                             | A callback function triggered after a file is successfully uploaded. Provides JSON `response` holding uploaded file details, use it to extract the uploaded file details and add it to the `files` state e.g. `setFiles((prev) => [...prev, JSON.parse(response)]);`                                                                                                                    |
| `onRename`              | (file: [File](#-file-structure), newName: string) => void                                                              | A callback function triggered when a file or folder is renamed.                                                                                                                                                                                                                                                                                                                         |
| `onDelete`              | (file: [File](#-file-structure)) => void                                                                               | A callback function triggered when a file or folder is deleted.                                                                                                                                                                                                                                                                                                                         |
| `onPaste`               | (file: [File](#-file-structure), destinationFolder: [File](#-file-structure), operationType: "copy" \| "move") => void | A callback function triggered when a file or folder is pasted into a new location. Depending on `operationType`, use this to either copy or move the `sourceItem` to the `destinationFolder`, updating the files state accordingly.                                                                                                                                                     |
| `onRefresh`             | () => void                                                                                                             | A callback function triggered when the file manager is refreshed. Use this to refresh the `files` state to reflect any changes or updates.                                                                                                                                                                                                                                              |

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/branch-name`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature/branch-name`).
6. Open a Pull Request.

Get started by running following commands:

```bash
git clone https://github.com/Saifullah-dev/react-file-manager.git
cd react-file-manager
npm i
npm run dev
```

The application should now be running on `http://localhost:5173`, have fun!

## ©️ License

React File Manager is [MIT Licensed](LICENSE).
