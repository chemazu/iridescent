import React from "react";
import { useDropzone } from "react-dropzone";

const Dropzone = ({ acceptWebinarImage }) => {
  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    maxFiles: 1,
    maxSize: 26214400,
    // accept: {

    // }
  });

  if (acceptedFiles.length > 0) {
    acceptedFiles.forEach((file) => {
      acceptWebinarImage(file);
    });
  }

  return (
    <div {...getRootProps({ className: "dropzone" })}>
      <input className="input-zone" {...getInputProps()} />
      <div>
        <p className="top-drop-image">
          Select a file to upload or drag and drop a file here
        </p>
        <p className="bottom-drop-image">UPLOAD</p>
      </div>
    </div>
  );
};

export default Dropzone;
