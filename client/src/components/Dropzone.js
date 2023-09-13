import React from "react";
import { useDropzone } from "react-dropzone";

const Dropzone = ({ acceptProductFile }) => {
  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    maxFiles: 1,
    maxSize: 52428800,
    // accept: {

    // }
  });

  if (acceptedFiles.length > 0) {
    acceptedFiles.forEach((file) => {
      acceptProductFile(file);
    });
  }

  return (
    <div {...getRootProps({ className: "dropzone" })}>
      <input className="input-zone" {...getInputProps()} />
      <div className="text-center">
        <p className="dropzone-content">
          Select a file to upload or drag and drop a file here
        </p>
        <p>Max file size 50MB</p>
      </div>
    </div>
  );
};

export default Dropzone;
