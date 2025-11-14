import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const FileDropzone = ({ onFilesAdded, disabled }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (onFilesAdded) {
      onFilesAdded(acceptedFiles);
    }
  }, [onFilesAdded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    noClick: false,
    noKeyboard: false
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
        transition-colors duration-200
        ${isDragActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center">
        <svg
          className="w-16 h-16 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        {isDragActive ? (
          <p className="text-lg text-blue-600 font-medium">Drop files here...</p>
        ) : (
          <>
            <p className="text-lg text-gray-700 font-medium mb-2">
              Drag & drop files or folders here
            </p>
            <p className="text-sm text-gray-500">
              or click to select files
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileDropzone;
