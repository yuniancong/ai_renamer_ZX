const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

// 导入原有的处理逻辑
const processFile = require('../../ai-renamer-main/src/processFile');
const processDirectory = require('../../ai-renamer-main/src/processDirectory');
const chooseModel = require('../../ai-renamer-main/src/chooseModel');
const getNewName = require('../../ai-renamer-main/src/getNewName');
const isProcessableFile = require('../../ai-renamer-main/src/isProcessableFile');
const isImage = require('../../ai-renamer-main/src/isImage');
const isVideo = require('../../ai-renamer-main/src/isVideo');
const extractFrames = require('../../ai-renamer-main/src/extractFrames');
const readFileContent = require('../../ai-renamer-main/src/readFileContent');
const deleteDirectory = require('../../ai-renamer-main/src/deleteDirectory');

const { checkFileType } = require('./fileTypeManager');
const { loadConfig } = require('./configManager');

/**
 * 处理单个文件 - 预览模式
 * 不实际重命名，只返回建议的新名称
 */
const previewFileRename = async (filePath, options = {}) => {
  console.log('\n📝 [previewFileRename] Starting...');
  console.log('   File path:', filePath);

  let framesOutputDir = null;

  try {
    // 加载配置
    console.log('   Loading config...');
    const config = await loadConfig();
    const mergedOptions = {
      provider: config.defaultProvider,
      model: config.defaultModel,
      baseURL: config.defaultBaseURL,
      apiKey: config.defaultApiKey,
      frames: config.defaultFrames || 3,
      _case: config.defaultCase || 'kebabCase',
      chars: config.defaultChars || 50,
      language: config.defaultLanguage || 'English',
      customPrompt: config.defaultCustomPrompt || '',
      ...options
    };
    console.log('   Provider:', mergedOptions.provider);
    console.log('   Model:', mergedOptions.model);
    console.log('   Base URL:', mergedOptions.baseURL);

    // 检查文件类型
    console.log('   Checking file type...');
    const typeCheck = await checkFileType(filePath);
    console.log('   Type check:', typeCheck);

    // 检查文件是否可处理
    const processable = isProcessableFile({ filePath });
    console.log('   Is processable:', processable);

    if (!processable) {
      console.log('   ❌ File not processable');
      return {
        success: false,
        filePath,
        originalName: path.basename(filePath),
        error: 'File type not supported',
        typeCheck
      };
    }

    // 获取文件名和扩展名
    const fileName = path.basename(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const relativeFilePath = fileName;

    console.log('   File name:', fileName);
    console.log('   Extension:', ext);

    // 根据文件类型进行预处理
    let content;
    let videoPrompt;
    let images = [];

    if (isImage({ ext })) {
      console.log('   📷 Processing as image...');
      images.push(filePath);
    } else if (isVideo({ ext })) {
      console.log('   🎥 Processing as video...');
      console.log('   Extracting frames (this may take a while)...');

      framesOutputDir = `/tmp/ai-renamer/${uuidv4()}`;
      const extractedFrames = await extractFrames({
        frames: mergedOptions.frames,
        framesOutputDir,
        inputFile: filePath
      });

      images = extractedFrames.images;
      videoPrompt = extractedFrames.videoPrompt;
      console.log('   ✅ Extracted', images.length, 'frames');
    } else {
      console.log('   📄 Processing as text file...');
      content = await readFileContent({ filePath });

      if (!content) {
        console.log('   ⚠️ No text content found');
        return {
          success: false,
          filePath,
          originalName: path.basename(filePath),
          error: 'No text content found in file',
          typeCheck
        };
      }

      console.log('   ✅ Read', content.length, 'characters');
    }

    // 获取新文件名（使用原有逻辑）
    console.log('   Calling getNewName with processed data...');
    const newName = await getNewName({
      ...mergedOptions,
      images,
      content,
      videoPrompt,
      relativeFilePath,
      filePath
    });

    console.log('   ✅ New name generated:', newName);

    // 清理临时帧目录
    if (framesOutputDir) {
      console.log('   🧹 Cleaning up temporary frames...');
      await deleteDirectory({ folderPath: framesOutputDir });
    }

    return {
      success: true,
      filePath,
      originalName: path.basename(filePath),
      newName: newName || null,
      typeCheck,
      options: mergedOptions
    };
  } catch (err) {
    console.error('   ❌ Error in previewFileRename:', err);
    console.error('   Stack:', err.stack);

    // 清理临时帧目录（如果有）
    if (framesOutputDir) {
      try {
        await deleteDirectory({ folderPath: framesOutputDir });
      } catch (cleanupErr) {
        console.error('   ⚠️ Failed to cleanup frames:', cleanupErr.message);
      }
    }

    return {
      success: false,
      filePath,
      originalName: path.basename(filePath),
      error: err.message,
      stack: err.stack
    };
  }
};

/**
 * 批量预览文件重命名
 */
const previewBatchRename = async (filePaths, options = {}) => {
  const results = await Promise.all(
    filePaths.map(filePath => previewFileRename(filePath, options))
  );

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  // ✅ 打印预览完成总结
  console.log('\n' + '='.repeat(60));
  console.log('📊 PREVIEW BATCH COMPLETED');
  console.log('='.repeat(60));
  console.log(`Total files: ${results.length}`);
  console.log(`✅ Successful: ${successful}`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed}`);
  }
  console.log('='.repeat(60));
  console.log('🎉 Ready for rename operation!');
  console.log('='.repeat(60) + '\n');

  return {
    total: results.length,
    successful,
    failed,
    results
  };
};

/**
 * 执行文件重命名
 */
const executeFileRename = async (filePath, newName, options = {}) => {
  console.log('\n🔧 [executeFileRename] Starting...');
  console.log('   File path:', filePath);
  console.log('   New name:', newName);

  try {
    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const newNameWithExt = newName.endsWith(ext) ? newName : `${newName}${ext}`;
    const newPath = path.join(dir, newNameWithExt);

    console.log('   New path:', newPath);

    // 检查目标文件是否已存在
    try {
      await fs.access(newPath);
      console.log('   ❌ Target file already exists!');
      return {
        success: false,
        filePath,
        originalName: path.basename(filePath),
        error: 'Target file already exists',
        targetPath: newPath
      };
    } catch {
      // 文件不存在，可以继续
      console.log('   ✅ Target path is available');
    }

    // 执行重命名
    console.log('   🔄 Executing rename...');
    await fs.rename(filePath, newPath);
    console.log('   ✅ Rename successful!');

    return {
      success: true,
      filePath,
      originalName: path.basename(filePath),
      newName: newNameWithExt,
      newPath
    };
  } catch (err) {
    return {
      success: false,
      filePath,
      originalName: path.basename(filePath),
      error: err.message
    };
  }
};

/**
 * 批量执行文件重命名
 */
const executeBatchRename = async (renamePairs) => {
  console.log('\n🔧 [executeBatchRename] Starting...');
  console.log('   Total pairs:', renamePairs.length);
  console.log('   Pairs:', JSON.stringify(renamePairs.map(p => ({
    from: path.basename(p.filePath),
    to: p.newName
  })), null, 2));

  const results = await Promise.all(
    renamePairs.map(({ filePath, newName, options }) =>
      executeFileRename(filePath, newName, options)
    )
  );

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log('\n📊 [executeBatchRename] Results:');
  console.log('   Total:', results.length);
  console.log('   Successful:', successful);
  console.log('   Failed:', failed);

  return {
    total: results.length,
    successful,
    failed,
    results
  };
};

/**
 * 处理目录（递归）
 */
const processDirectoryWithPreview = async (dirPath, options = {}) => {
  try {
    const config = await loadConfig();
    const mergedOptions = { ...config, ...options };

    // 读取目录内容
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    const files = [];
    const subdirs = [];

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory() && mergedOptions.defaultIncludeSubdirectories) {
        subdirs.push(fullPath);
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }

    // 预览所有文件
    let allResults = await previewBatchRename(files, mergedOptions);

    // 处理子目录
    if (subdirs.length > 0) {
      for (const subdir of subdirs) {
        const subdirResults = await processDirectoryWithPreview(subdir, mergedOptions);
        allResults.results.push(...subdirResults.results);
        allResults.total += subdirResults.total;
        allResults.successful += subdirResults.successful;
        allResults.failed += subdirResults.failed;
      }
    }

    return allResults;
  } catch (err) {
    throw new Error(`Failed to process directory: ${err.message}`);
  }
};

/**
 * 自动选择模型
 */
const autoSelectModel = async (options = {}) => {
  try {
    const config = await loadConfig();
    const mergedOptions = { ...config, ...options };

    const model = await chooseModel({
      provider: mergedOptions.defaultProvider,
      baseURL: mergedOptions.defaultBaseURL,
      apiKey: mergedOptions.defaultApiKey,
      model: mergedOptions.defaultModel
    });

    return {
      success: true,
      model
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
};

module.exports = {
  previewFileRename,
  previewBatchRename,
  executeFileRename,
  executeBatchRename,
  processDirectoryWithPreview,
  autoSelectModel
};
