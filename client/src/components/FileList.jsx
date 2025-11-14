import React from 'react';

const FileList = ({ files, onRemoveFile, onClearAll, onAskUser }) => {
  const getStatusIcon = (file) => {
    if (file.preview?.success === false) {
      return <span className="text-red-500" title={file.preview.error}>❌</span>;
    }
    if (file.typeCheck?.type === 'whitelist') {
      return <span className="text-green-500" title="Supported format">✅</span>;
    }
    if (file.typeCheck?.type === 'custom') {
      return <span className="text-blue-500" title="Custom format">💎</span>;
    }
    if (file.typeCheck?.type === 'unknown') {
      return <span className="text-yellow-500" title="Unknown format">⚠️</span>;
    }
    return <span className="text-gray-400">•</span>;
  };

  const getFileTypeLabel = (file) => {
    if (!file.typeCheck) return '';
    const { type, extension } = file.typeCheck;

    if (type === 'whitelist') return `${extension} (Supported)`;
    if (type === 'custom') return `${extension} (Custom)`;
    if (type === 'unknown') return `${extension} (Unknown)`;
    return extension;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Files ({files.length})
        </h3>
        {files.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            🗑️ Clear All
          </button>
        )}
      </div>

      {files.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No files added yet
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <span className="text-xl">{getStatusIcon(file)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-800 truncate">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {getFileTypeLabel(file)}
                    </span>
                  </div>
                  {file.preview?.newName && (
                    <div className="text-xs text-green-600 mt-1">
                      → {file.preview.newName}
                    </div>
                  )}
                  {file.typeCheck?.type === 'unknown' && !file.askedUser && (
                    <button
                      onClick={() => onAskUser(index)}
                      className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                    >
                      Ask to process this file type
                    </button>
                  )}
                </div>
              </div>
              <button
                onClick={() => onRemoveFile(index)}
                className="ml-4 text-gray-400 hover:text-red-600 transition-colors"
                title="Remove file"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileList;
