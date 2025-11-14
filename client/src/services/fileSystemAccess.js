/**
 * File System Access API 服务
 * 使用现代浏览器 API 直接访问和修改本地文件系统
 *
 * 浏览器支持：
 * - Chrome/Edge 86+
 * - Opera 72+
 * - Safari: 不支持
 * - Firefox: 部分支持（需要启用标志）
 */

/**
 * 检查浏览器是否支持 File System Access API
 */
export const isFileSystemAccessSupported = () => {
  return 'showDirectoryPicker' in window;
};

/**
 * 选择工作目录
 * @returns {Promise<DirectoryHandle>} 目录句柄
 */
export const selectDirectory = async () => {
  try {
    console.log('📁 Opening directory picker...');

    const dirHandle = await window.showDirectoryPicker({
      mode: 'readwrite', // 需要读写权限
      startIn: 'desktop'  // 从桌面开始
    });

    console.log('✅ Directory selected:', dirHandle.name);
    return dirHandle;
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('❌ User cancelled directory selection');
      throw new Error('Directory selection cancelled');
    }
    console.error('❌ Failed to select directory:', err);
    throw err;
  }
};

/**
 * 列出目录中的所有文件
 * @param {DirectoryHandle} dirHandle - 目录句柄
 * @param {Object} options - 选项
 * @returns {Promise<Array>} 文件列表
 */
export const listFilesInDirectory = async (dirHandle, options = {}, _depth = 0) => {
  const {
    recursive = false,
    includeHidden = false
  } = options;

  const indent = '  '.repeat(_depth);
  if (_depth === 0) {
    console.log(`📂 Listing files in directory: ${dirHandle.name}${recursive ? ' (recursive)' : ''}`);
  } else {
    console.log(`${indent}📁 Scanning subdirectory: ${dirHandle.name}`);
  }

  const files = [];

  try {
    for await (const entry of dirHandle.values()) {
      // 跳过隐藏文件
      if (!includeHidden && entry.name.startsWith('.')) {
        continue;
      }

      if (entry.kind === 'file') {
        const file = await entry.getFile();
        files.push({
          name: entry.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          file: file,
          handle: entry,  // 文件句柄
          parentDirHandle: dirHandle  // ✅ 当前目录就是文件的父目录
        });
      } else if (entry.kind === 'directory' && recursive) {
        // 递归处理子目录
        const subFiles = await listFilesInDirectory(entry, options, _depth + 1);  // 递归扫描
        files.push(...subFiles);
      }
    }

    if (_depth === 0) {
      console.log(`✅ Found ${files.length} total files${recursive ? ' (including subdirectories)' : ''}`);
    } else {
      console.log(`${indent}  └─ ${files.length} files in this branch`);
    }
    return files;
  } catch (err) {
    console.error('❌ Failed to list files:', err);
    throw err;
  }
};

/**
 * 重命名文件（使用文件句柄）
 * @param {DirectoryHandle} dirHandle - 目录句柄
 * @param {FileHandle} fileHandle - 文件句柄
 * @param {string} oldName - 原文件名
 * @param {string} newName - 新文件名
 * @returns {Promise<Object>} 重命名结果
 */
export const renameFile = async (dirHandle, fileHandle, oldName, newName) => {
  console.log(`🔄 Renaming file: ${oldName} → ${newName}`);

  try {
    // 检查新文件名是否已存在
    try {
      await dirHandle.getFileHandle(newName);
      console.warn('⚠️ Target file already exists:', newName);
      return {
        success: false,
        oldName,
        newName,
        error: 'Target file already exists'
      };
    } catch (err) {
      // 文件不存在，可以继续
    }

    // 读取原文件内容
    const file = await fileHandle.getFile();
    const content = await file.arrayBuffer();

    // 创建新文件
    const newFileHandle = await dirHandle.getFileHandle(newName, { create: true });
    const writable = await newFileHandle.createWritable();
    await writable.write(content);
    await writable.close();

    // 删除原文件
    await dirHandle.removeEntry(oldName);

    console.log('✅ File renamed successfully');
    return {
      success: true,
      oldName,
      newName
    };
  } catch (err) {
    console.error('❌ Failed to rename file:', err);
    return {
      success: false,
      oldName,
      newName,
      error: err.message
    };
  }
};

/**
 * 批量重命名文件
 * @param {DirectoryHandle} dirHandle - 根目录句柄（用于向后兼容，实际使用每个文件的 parentDirHandle）
 * @param {Array} renamePairs - 重命名对 [{fileHandle, parentDirHandle, oldName, newName}]
 * @returns {Promise<Object>} 批量重命名结果
 */
export const batchRenameFiles = async (dirHandle, renamePairs) => {
  console.log(`🔄 Batch renaming ${renamePairs.length} files...`);

  const results = [];
  let successCount = 0;
  let failedCount = 0;

  for (const pair of renamePairs) {
    // ✅ 使用文件的父目录句柄，而不是根目录句柄
    const parentDir = pair.parentDirHandle || dirHandle;

    const result = await renameFile(
      parentDir,
      pair.fileHandle,
      pair.oldName,
      pair.newName
    );

    results.push(result);
    if (result.success) {
      successCount++;
    } else {
      failedCount++;
    }
  }

  console.log(`✅ Batch rename completed: ${successCount} succeeded, ${failedCount} failed`);

  return {
    total: renamePairs.length,
    successful: successCount,
    failed: failedCount,
    results
  };
};

/**
 * 请求目录权限
 * @param {DirectoryHandle} dirHandle - 目录句柄
 * @param {string} mode - 权限模式 'read' | 'readwrite'
 * @returns {Promise<boolean>} 是否已授权
 */
export const verifyPermission = async (dirHandle, mode = 'readwrite') => {
  const options = { mode };

  // 检查是否已有权限
  if ((await dirHandle.queryPermission(options)) === 'granted') {
    return true;
  }

  // 请求权限
  if ((await dirHandle.requestPermission(options)) === 'granted') {
    return true;
  }

  return false;
};

/**
 * 保存目录句柄到 IndexedDB（用于下次访问）
 * @param {string} key - 存储键
 * @param {DirectoryHandle} dirHandle - 目录句柄
 */
export const saveDirectoryHandle = async (key, dirHandle) => {
  try {
    // 使用 IndexedDB 存储目录句柄
    const dbName = 'ai-renamer-zx';
    const storeName = 'directory-handles';

    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    store.put(dirHandle, key);

    await new Promise((resolve, reject) => {
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });

    console.log('✅ Directory handle saved');
  } catch (err) {
    console.error('❌ Failed to save directory handle:', err);
  }
};

/**
 * 从 IndexedDB 加载目录句柄
 * @param {string} key - 存储键
 * @returns {Promise<DirectoryHandle|null>} 目录句柄或 null
 */
export const loadDirectoryHandle = async (key) => {
  try {
    const dbName = 'ai-renamer-zx';
    const storeName = 'directory-handles';

    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);

    const dirHandle = await new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (dirHandle) {
      // 验证权限是否仍然有效
      const hasPermission = await verifyPermission(dirHandle);
      if (hasPermission) {
        console.log('✅ Directory handle loaded');
        return dirHandle;
      } else {
        console.warn('⚠️ Permission denied for saved directory');
        return null;
      }
    }

    return null;
  } catch (err) {
    console.error('❌ Failed to load directory handle:', err);
    return null;
  }
};

export default {
  isFileSystemAccessSupported,
  selectDirectory,
  listFilesInDirectory,
  renameFile,
  batchRenameFiles,
  verifyPermission,
  saveDirectoryHandle,
  loadDirectoryHandle
};
