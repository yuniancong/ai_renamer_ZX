import React, { useState, useEffect } from 'react';
import FileDropzone from './components/FileDropzone';
import SettingsPanel from './components/SettingsPanel';
import FileList from './components/FileList';
import DebugPanel from './components/DebugPanel';
import { configAPI, filesAPI, modelsAPI } from './services/api';
import fileSystemAccess from './services/fileSystemAccess';

function App() {
  const [config, setConfig] = useState({});
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [message, setMessage] = useState(null);
  const [availableModels, setAvailableModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [debugPanelOpen, setDebugPanelOpen] = useState(false);

  // File System Access API 支持
  const [fsaSupported, setFsaSupported] = useState(false);
  const [workingDirectory, setWorkingDirectory] = useState(null);
  const [directFileMode, setDirectFileMode] = useState(false);

  // 检查 File System Access API 支持
  useEffect(() => {
    const supported = fileSystemAccess.isFileSystemAccessSupported();
    setFsaSupported(supported);
    console.log('🔍 File System Access API supported:', supported);

    if (supported) {
      // 尝试加载上次使用的目录
      fileSystemAccess.loadDirectoryHandle('lastWorkingDirectory')
        .then(dirHandle => {
          if (dirHandle) {
            setWorkingDirectory(dirHandle);
            console.log('✅ Loaded last working directory:', dirHandle.name);
          }
        })
        .catch(err => {
          console.log('ℹ️ No saved directory or permission denied');
        });
    }
  }, []);

  // 加载配置
  useEffect(() => {
    loadConfig();
  }, []);

  // 当 provider 或 baseURL 改变时，自动刷新模型列表和测试连接
  useEffect(() => {
    if (config.defaultProvider) {
      fetchModels();
      testConnection();
    }
  }, [config.defaultProvider, config.defaultBaseURL]);

  const loadConfig = async () => {
    try {
      const response = await configAPI.getConfig();
      setConfig(response.data.config);
    } catch (err) {
      console.error('Failed to load config:', err);
      showMessage('Failed to load configuration', 'error');
    }
  };

  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  // 获取可用模型列表
  const fetchModels = async () => {
    if (!config.defaultProvider) return;

    setLoadingModels(true);
    try {
      const response = await modelsAPI.listModels(
        config.defaultProvider,
        config.defaultBaseURL,
        config.defaultApiKey
      );

      if (response.data.success) {
        setAvailableModels(response.data.models || []);
      } else {
        setAvailableModels([]);
        console.error('Failed to fetch models:', response.data.message);
      }
    } catch (err) {
      console.error('Failed to fetch models:', err);
      setAvailableModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  // 测试连接
  const testConnection = async () => {
    if (!config.defaultProvider) return;

    setConnectionStatus('connecting');
    try {
      const response = await modelsAPI.test(
        config.defaultProvider,
        config.defaultBaseURL,
        config.defaultApiKey,
        config.defaultModel
      );

      if (response.data.success) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (err) {
      console.error('Connection test failed:', err);
      setConnectionStatus('disconnected');
    }
  };

  const handleFilesAdded = async (newFiles) => {
    console.log('\n📁 === Adding Files ===');
    console.log('Files to add:', newFiles.length);
    console.log('Files:', newFiles.map(f => f.name));
    console.log('Direct file mode:', directFileMode);

    setLoading(true);
    try {
      // 如果在直接文件模式，需要从工作目录获取文件句柄
      let processedFiles;
      let filesWithHandles = [];
      let filesWithoutHandles = [];

      if (directFileMode && workingDirectory) {
        console.log('📁 Direct file mode: Getting file handles from working directory (including subdirectories)');

        // 从工作目录递归获取所有文件（包括子目录）
        const filesInDir = await fileSystemAccess.listFilesInDirectory(workingDirectory, {
          recursive: true,  // ✅ 启用递归扫描子目录
          includeHidden: false
        });
        console.log(`📂 Files in working directory (recursive): ${filesInDir.length}`);

        // 匹配用户拖拽的文件（使用文件名、大小、修改时间精确匹配）
        newFiles.forEach(file => {
          // 使用多个条件匹配，避免同名文件冲突
          const matchingFile = filesInDir.find(f =>
            f.name === file.name &&
            f.size === file.size &&
            Math.abs(f.lastModified - file.lastModified) < 1000 // 允许1秒误差
          );

          if (matchingFile) {
            console.log(`✅ Found file handle for: ${file.name} (size: ${file.size}, modified: ${new Date(file.lastModified).toISOString()})`);
            filesWithHandles.push({
              file,
              handle: matchingFile.handle,
              parentDirHandle: matchingFile.parentDirHandle  // ✅ 保存父目录句柄
            });
          } else {
            console.warn(`⚠️ File not found in working directory: ${file.name}`);
            filesWithoutHandles.push(file);
          }
        });

        // 如果有文件不在工作目录中，回退到服务器模式检查这些文件
        if (filesWithoutHandles.length > 0) {
          console.warn(`⚠️ ${filesWithoutHandles.length} files not in working directory, falling back to server mode for type checking`);

          const filePaths = filesWithoutHandles.map(f => f.name);
          const typeCheckResponse = await filesAPI.checkMultipleTypes(filePaths);
          console.log('✅ Type check response for files outside directory:', typeCheckResponse.data);

          // 合并结果
          processedFiles = [
            // 有句柄的文件（在工作目录中）
            ...filesWithHandles.map(({ file, handle, parentDirHandle }) => ({
              name: file.name,
              path: file.path,
              size: file.size,
              file: file,
              handle: handle,
              parentDirHandle: parentDirHandle,  // ✅ 传递父目录句柄
              typeCheck: { supported: true, type: 'direct' },
              askedUser: false
            })),
            // 没有句柄的文件（不在工作目录中，使用服务器类型检查）
            ...filesWithoutHandles.map((file, index) => ({
              name: file.name,
              path: file.path,
              size: file.size,
              file: file,
              handle: null,
              typeCheck: typeCheckResponse.data.files[index],
              askedUser: false
            }))
          ];

          // 显示警告
          showMessage(
            `⚠️ ${filesWithoutHandles.length} files are not in the working directory "${workingDirectory.name}". They will be processed in server mode (no direct rename).`,
            'warning'
          );
        } else {
          // 所有文件都在工作目录中
          processedFiles = filesWithHandles.map(({ file, handle, parentDirHandle }) => ({
            name: file.name,
            path: file.path,
            size: file.size,
            file: file,
            handle: handle,
            parentDirHandle: parentDirHandle,  // ✅ 传递父目录句柄
            typeCheck: { supported: true, type: 'direct' },
            askedUser: false
          }));
        }
      } else {
        // 正常模式：检查文件类型
        const filePaths = newFiles.map(f => f.name);
        console.log('📤 Checking file types for:', filePaths);

        const typeCheckResponse = await filesAPI.checkMultipleTypes(filePaths);
        console.log('✅ Type check response:', typeCheckResponse.data);

        processedFiles = newFiles.map((file, index) => ({
          name: file.name,
          path: file.path,
          size: file.size,
          file: file,
          handle: null,
          typeCheck: typeCheckResponse.data.files[index],
          askedUser: false
        }));
      }

      console.log('📋 Processed files:', processedFiles.map(f => ({
        name: f.name,
        type: f.typeCheck?.type,
        supported: f.typeCheck?.supported,
        hasHandle: !!f.handle
      })));

      setFiles(prev => [...prev, ...processedFiles]);

      const supportedCount = processedFiles.filter(f => f.typeCheck?.supported).length;
      const unsupportedCount = processedFiles.length - supportedCount;
      const directRenameCount = processedFiles.filter(f => f.handle).length;

      if (unsupportedCount > 0) {
        showMessage(
          `Added ${newFiles.length} files: ${supportedCount} supported (${directRenameCount} can be directly renamed), ${unsupportedCount} unsupported`,
          'warning'
        );
      } else if (directFileMode && directRenameCount < newFiles.length) {
        showMessage(
          `Added ${newFiles.length} files: ${directRenameCount} can be directly renamed, ${newFiles.length - directRenameCount} will use server mode`,
          'info'
        );
      } else {
        showMessage(`Added ${newFiles.length} file(s)`, 'success');
      }
    } catch (err) {
      console.error('❌ Failed to process files:', err);
      console.error('Error details:', err.response?.data || err.message);
      showMessage('Failed to process files: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearAllFiles = () => {
    console.log('🗑️ Clearing all files');
    setFiles([]);
  };

  const handleConfigChange = async (newConfig) => {
    setConfig(newConfig);
    try {
      await configAPI.updateConfig(newConfig);
    } catch (err) {
      console.error('Failed to save config:', err);
    }
  };

  const handleTestConnection = async () => {
    setLoading(true);
    try {
      const response = await modelsAPI.test(
        config.defaultProvider,
        config.defaultBaseURL,
        config.defaultApiKey,
        config.defaultModel
      );

      if (response.data.success) {
        showMessage('Connection successful!', 'success');
      } else {
        showMessage('Connection failed: ' + response.data.message, 'error');
      }
    } catch (err) {
      showMessage('Connection failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAskUser = (index) => {
    const file = files[index];
    const extension = file.typeCheck?.extension;

    if (!extension) return;

    const confirmed = window.confirm(
      `Unknown file type "${extension}" detected.\n\n` +
      `Do you want to try processing this file with the AI model?\n\n` +
      `Choose OK to:\n` +
      `- Try processing this file\n` +
      `- Add "${extension}" to supported formats\n\n` +
      `Choose Cancel to skip this file.`
    );

    if (confirmed) {
      filesAPI.addCustomType(extension)
        .then(() => {
          // 更新文件状态
          setFiles(prev => prev.map((f, i) => {
            if (i === index) {
              return {
                ...f,
                typeCheck: { ...f.typeCheck, type: 'custom', supported: true },
                askedUser: true
              };
            }
            return f;
          }));
          showMessage(`Added "${extension}" to supported formats`, 'success');
        })
        .catch(err => {
          console.error('Failed to add custom type:', err);
          showMessage('Failed to add custom type', 'error');
        });
    } else {
      // 标记为已询问
      setFiles(prev => prev.map((f, i) => {
        if (i === index) {
          return { ...f, askedUser: true };
        }
        return f;
      }));
    }
  };

  const handlePreview = async () => {
    console.log('\n🎬 === Starting Preview Process ===');
    console.log('Total files:', files.length);
    console.log('Config:', config);

    setLoading(true);
    try {
      // 过滤支持的文件
      const supportedFiles = files.filter(f => f.typeCheck?.supported);
      console.log('Supported files:', supportedFiles.length);

      const filesToUpload = supportedFiles.map(f => f.file);

      if (filesToUpload.length === 0) {
        console.error('❌ No supported files to preview');
        showMessage('No supported files to preview. Please add files with supported formats.', 'error');
        setLoading(false);
        return;
      }

      // 上传文件
      console.log('📤 Uploading', filesToUpload.length, 'files...');
      const uploadResponse = await filesAPI.upload(filesToUpload);
      console.log('✅ Upload response:', uploadResponse.data);

      const uploadedFiles = uploadResponse.data.files;
      const uploadedPaths = uploadedFiles.map(f => f.path);
      console.log('📁 Uploaded paths:', uploadedPaths);

      // 预览重命名
      console.log('🔮 Requesting preview with config:', config);
      const previewResponse = await filesAPI.preview(uploadedPaths, config);
      console.log('✅ Preview response:', previewResponse.data);

      if (!previewResponse.data.results) {
        throw new Error('No results returned from preview API');
      }

      // 更新文件预览 - 使用索引匹配而不是文件名匹配
      console.log('📝 Updating file previews...');

      // 创建 supportedFiles 的索引映射
      const supportedFileIndices = new Map();
      let supportedIndex = 0;
      files.forEach((file, originalIndex) => {
        if (file.typeCheck?.supported) {
          supportedFileIndices.set(supportedIndex, originalIndex);
          supportedIndex++;
        }
      });

      // ✅ 先计算哪些文件会被更新（在 setFiles 之前）
      let updatedCount = 0;
      let successfulPreviews = 0;
      let failedPreviews = 0;

      // 预先计算统计数据
      files.forEach((file, fileIndex) => {
        let resultIndex = -1;
        for (const [suppIdx, origIdx] of supportedFileIndices.entries()) {
          if (origIdx === fileIndex) {
            resultIndex = suppIdx;
            break;
          }
        }

        if (resultIndex !== -1 && previewResponse.data.results[resultIndex]) {
          const previewResult = previewResponse.data.results[resultIndex];
          updatedCount++;

          if (previewResult.success && previewResult.newName) {
            successfulPreviews++;
            console.log(`   ✅ ${file.name} → ${previewResult.newName}`);
          } else {
            failedPreviews++;
            console.log(`   ❌ ${file.name} → Failed (${previewResult.error || 'No name generated'})`);
          }
        }
      });

      // 然后更新状态
      setFiles(prev => prev.map((file, fileIndex) => {
        // 找到这个文件在 supportedFiles 中的索引
        let resultIndex = -1;
        for (const [suppIdx, origIdx] of supportedFileIndices.entries()) {
          if (origIdx === fileIndex) {
            resultIndex = suppIdx;
            break;
          }
        }

        if (resultIndex !== -1 && previewResponse.data.results[resultIndex]) {
          const previewResult = previewResponse.data.results[resultIndex];
          return { ...file, preview: previewResult };
        }
        return file;
      }));

      console.log(`✅ Updated ${updatedCount} file previews (${successfulPreviews} successful, ${failedPreviews} failed)`);

      const successCount = previewResponse.data.successful || 0;
      const failedCount = previewResponse.data.failed || 0;

      // 打印阶段性完成提示
      console.log('\n' + '='.repeat(60));
      console.log('📊 PREVIEW SUMMARY');
      console.log('='.repeat(60));
      console.log(`Total files processed: ${successCount + failedCount}`);
      console.log(`✅ Successful: ${successCount}`);
      if (failedCount > 0) {
        console.log(`❌ Failed: ${failedCount}`);
      }
      console.log('='.repeat(60));

      if (successCount > 0) {
        console.log('✅ You can now click "Execute Rename" to rename the successful files');
      } else {
        console.log('❌ No files were successfully previewed. Please check the errors above.');
      }
      console.log('='.repeat(60) + '\n');

      if (failedCount > 0) {
        showMessage(
          `Preview completed: ${successCount} succeeded, ${failedCount} failed. You can still rename the successful files.`,
          'warning'
        );
      } else {
        showMessage(`Preview generated successfully for ${successCount} files`, 'success');
      }
    } catch (err) {
      console.error('❌ Preview failed:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        stack: err.stack
      });

      console.log('\n' + '='.repeat(60));
      console.log('❌ PREVIEW FAILED');
      console.log('='.repeat(60));
      console.log('Error:', err.message);
      console.log('='.repeat(60) + '\n');

      showMessage(
        'Preview failed: ' + (err.response?.data?.message || err.message),
        'error'
      );
    } finally {
      setLoading(false);
      console.log('🏁 Preview process completed\n');
    }
  };

  const handleDownloadScript = async (scriptType = 'auto') => {
    console.log('\n📜 === Downloading Rename Script ===');
    console.log('Script type:', scriptType);

    try {
      const previewResults = files
        .filter(f => f.preview?.success && f.preview?.newName)
        .map(f => f.preview);

      if (previewResults.length === 0) {
        console.error('❌ No files to download script for');
        showMessage('No files available. Run preview first.', 'error');
        return;
      }

      console.log('📝 Preview results:', previewResults.length);

      // 请求生成脚本
      console.log('📤 Requesting script generation...');
      const response = await filesAPI.generateScript(previewResults, scriptType, null);

      // 创建下载链接
      const blob = new Blob([response.data], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // 根据脚本类型设置文件名
      const filename = scriptType === 'bash' ? 'rename.sh' :
                      scriptType === 'powershell' ? 'rename.ps1' :
                      scriptType === 'batch' ? 'rename.bat' :
                      'rename.sh'; // default to bash
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ Script downloaded:', filename);
      showMessage(`Script downloaded: ${filename}`, 'success');
    } catch (err) {
      console.error('❌ Script download failed:', err);
      showMessage('Failed to download script: ' + err.message, 'error');
    }
  };

  // 选择工作目录（File System Access API）
  const handleSelectDirectory = async () => {
    console.log('\n📁 === Selecting Working Directory ===');

    if (!fsaSupported) {
      showMessage('Your browser does not support direct file access. Please use Chrome/Edge 86+.', 'error');
      return;
    }

    try {
      const dirHandle = await fileSystemAccess.selectDirectory();
      setWorkingDirectory(dirHandle);

      // 保存目录句柄供下次使用
      await fileSystemAccess.saveDirectoryHandle('lastWorkingDirectory', dirHandle);

      // 列出目录中的文件（包括子目录）
      const filesInDir = await fileSystemAccess.listFilesInDirectory(dirHandle, {
        recursive: true,  // ✅ 启用递归扫描子目录
        includeHidden: false
      });
      console.log('✅ Found files (including subdirectories):', filesInDir.length);

      // 设置为直接文件模式
      setDirectFileMode(true);

      showMessage(`Selected directory: ${dirHandle.name} (${filesInDir.length} files including subdirectories)`, 'success');

      // 自动添加文件到列表（用户可以选择）
      // 注意：这里我们不立即添加，让用户拖拽选择
    } catch (err) {
      if (err.message !== 'Directory selection cancelled') {
        console.error('❌ Failed to select directory:', err);
        showMessage('Failed to select directory: ' + err.message, 'error');
      }
    }
  };

  // 直接重命名文件（使用 File System Access API）
  const handleDirectRename = async () => {
    console.log('\n🎬 === Starting Direct Rename Process ===');
    console.log('Direct file mode:', directFileMode);
    console.log('Working directory:', workingDirectory);

    if (!workingDirectory) {
      showMessage('Please select a working directory first', 'error');
      return;
    }

    setLoading(true);
    try {
      const renamePairs = files
        .filter(f => f.preview?.success && f.preview?.newName && f.handle)
        .map(f => {
          const ext = f.name.match(/\.[^.]+$/)?.[0] || '';
          const newName = f.preview.newName.endsWith(ext)
            ? f.preview.newName
            : `${f.preview.newName}${ext}`;

          return {
            fileHandle: f.handle,
            parentDirHandle: f.parentDirHandle,  // ✅ 传递父目录句柄
            oldName: f.name,
            newName: newName
          };
        });

      console.log('📝 Rename pairs:', renamePairs.length);
      console.log('Pairs:', JSON.stringify(renamePairs.map(p => ({
        from: p.oldName,
        to: p.newName
      })), null, 2));

      if (renamePairs.length === 0) {
        console.error('❌ No files to rename');
        showMessage('No files to rename. Run preview first.', 'error');
        setLoading(false);
        return;
      }

      // 使用 File System Access API 直接重命名
      console.log('🔄 Renaming files directly in file system...');
      const result = await fileSystemAccess.batchRenameFiles(workingDirectory, renamePairs);
      console.log('✅ Direct rename result:', result);

      // 打印完成总结
      console.log('\n' + '='.repeat(60));
      console.log('✅ RENAME COMPLETED');
      console.log('='.repeat(60));
      console.log(`Total files: ${result.total}`);
      console.log(`✅ Successful: ${result.successful}`);
      if (result.failed > 0) {
        console.log(`❌ Failed: ${result.failed}`);
      }
      console.log('='.repeat(60));
      if (result.successful > 0) {
        console.log('Successfully renamed files:');
        result.results.filter(r => r.success).forEach(r => {
          console.log(`   ✅ ${r.oldName} → ${r.newName}`);
        });
      }
      if (result.failed > 0) {
        console.log('Failed files:');
        result.results.filter(r => !r.success).forEach(r => {
          console.log(`   ❌ ${r.oldName} - ${r.error}`);
        });
      }
      console.log('='.repeat(60));
      console.log('🎉 DONE!');
      console.log('='.repeat(60) + '\n');

      showMessage(
        `Renamed ${result.successful} of ${result.total} files in your directory`,
        result.successful === result.total ? 'success' : 'warning'
      );

      console.log('🏁 Direct Rename process completed');

      // 清空文件列表
      setFiles([]);
    } catch (err) {
      console.error('❌ Direct rename failed:', err);
      showMessage('Direct rename failed: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 服务器端重命名（原有功能）
  const handleRename = async () => {
    console.log('\n🎬 === Starting Execute Rename Process ===');
    setLoading(true);
    try {
      const renamePairs = files
        .filter(f => f.preview?.success && f.preview?.newName)
        .map(f => ({
          filePath: f.preview.filePath,
          newName: f.preview.newName,
          options: config
        }));

      console.log('📝 Rename pairs:', renamePairs.length);
      console.log('Pairs:', JSON.stringify(renamePairs.map(p => ({
        from: p.filePath,
        to: p.newName
      })), null, 2));

      if (renamePairs.length === 0) {
        console.error('❌ No files to rename');
        showMessage('No files to rename. Run preview first.', 'error');
        setLoading(false);
        return;
      }

      console.log('📤 Sending rename request...');
      const response = await filesAPI.rename(renamePairs);
      console.log('✅ Rename response:', response.data);

      showMessage(
        `Renamed ${response.data.successful} of ${response.data.total} files`,
        response.data.successful === response.data.total ? 'success' : 'warning'
      );

      console.log('🏁 Execute Rename completed');

      // 清空文件列表
      setFiles([]);
    } catch (err) {
      console.error('❌ Rename failed:', err);
      console.error('Error details:', err.response?.data || err.message);
      showMessage('Rename failed: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              AI Renamer ZX
            </h1>
            <p className="text-gray-600 mt-1">
              Intelligent file renaming powered by AI
            </p>
            {workingDirectory && (
              <p className="text-sm text-green-600 mt-1">
                📁 Working in: {workingDirectory.name}
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            {fsaSupported && (
              <button
                onClick={handleSelectDirectory}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <span>📁</span>
                <span>{workingDirectory ? 'Change Directory' : 'Select Directory'}</span>
              </button>
            )}
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              {settingsOpen ? 'Hide' : 'Show'} Settings
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-4 p-4 rounded-md ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : message.type === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Settings Panel */}
        {settingsOpen && (
          <div className="mb-6">
            <SettingsPanel
              config={config}
              onConfigChange={handleConfigChange}
              onTest={handleTestConnection}
              onRefreshModels={fetchModels}
              availableModels={availableModels}
              loadingModels={loadingModels}
              connectionStatus={connectionStatus}
            />
          </div>
        )}

        {/* Important Notice for Direct File Mode */}
        {fsaSupported && !workingDirectory && (
          <div className="mb-6 bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
            <div className="flex items-start">
              <span className="text-4xl mr-4">🎯</span>
              <div>
                <h3 className="text-lg font-bold text-blue-900 mb-2">
                  Start Here: Select Your Working Directory
                </h3>
                <p className="text-blue-800 mb-4">
                  To rename your <strong>original files</strong> automatically, you must first select the directory where your files are located.
                </p>
                <button
                  onClick={handleSelectDirectory}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
                >
                  <span>📁</span>
                  <span>Select Directory (Chrome/Edge Required)</span>
                </button>
                <p className="text-xs text-blue-700 mt-3">
                  💡 After selecting, drag files from that directory to enable direct renaming.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* File Upload */}
        <div className="mb-6">
          <FileDropzone onFilesAdded={handleFilesAdded} disabled={loading} />
        </div>

        {/* File List */}
        <FileList
          files={files}
          onRemoveFile={handleRemoveFile}
          onClearAll={handleClearAllFiles}
          onAskUser={handleAskUser}
        />

        {/* Action Buttons */}
        {files.length > 0 && (
          <div className="mt-6 space-y-4">
            {/* Direct File Mode Notice */}
            {directFileMode && workingDirectory && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">✨</span>
                  <div className="text-sm text-green-800">
                    <p className="font-semibold mb-1">Direct File Mode Enabled!</p>
                    <p>You're working in: <strong>{workingDirectory.name}</strong></p>
                    <p>Files will be renamed directly in your directory when you click Execute Rename.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Primary Actions */}
            <div className="flex space-x-4">
              <button
                onClick={handlePreview}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processing...' : 'Preview Rename'}
              </button>

              {directFileMode && workingDirectory ? (
                <button
                  onClick={handleDirectRename}
                  disabled={loading || !files.some(f => f.preview?.success)}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold"
                >
                  {loading ? 'Renaming...' : '✨ Execute Rename (Direct)'}
                </button>
              ) : (
                <button
                  onClick={handleRename}
                  disabled={loading || !files.some(f => f.preview?.success)}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Renaming...' : 'Execute Rename (Server Only)'}
                </button>
              )}
            </div>

            {/* Warning: Not in Direct File Mode */}
            {!directFileMode && fsaSupported && files.some(f => f.preview?.success) && (
              <div className="border-t pt-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">⚠️</span>
                    <div className="text-sm text-red-800">
                      <p className="font-semibold mb-2">Warning: Files will only be renamed on the server!</p>
                      <p className="mb-3">To rename your <strong>original files</strong>, you must first select your working directory.</p>
                      <button
                        onClick={handleSelectDirectory}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        📁 Select Directory Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Debug Panel */}
      <DebugPanel
        isOpen={debugPanelOpen}
        onToggle={() => setDebugPanelOpen(!debugPanelOpen)}
      />
    </div>
  );
}

export default App;
