const path = require('path');
const os = require('os');

/**
 * 生成 Bash 脚本（macOS/Linux）
 */
const generateBashScript = (renamePairs, options = {}) => {
  const { originalPath = '.' } = options;

  let script = `#!/bin/bash
# AI Renamer ZX - Batch Rename Script
# Generated: ${new Date().toLocaleString()}
# Original directory: ${originalPath}
#
# Instructions:
# 1. Copy this script to the directory containing your files
# 2. Make it executable: chmod +x rename.sh
# 3. Run it: ./rename.sh
# 4. Or run with dry-run: bash rename.sh --dry-run

set -e  # Exit on error

# Parse arguments
DRY_RUN=false
if [ "$1" == "--dry-run" ]; then
  DRY_RUN=true
  echo "🔍 DRY RUN MODE - No files will be renamed"
  echo ""
fi

# Color output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
NC='\\033[0m' # No Color

echo "🤖 AI Renamer ZX - Batch Rename Script"
echo "========================================"
echo ""
echo "Total files to rename: ${renamePairs.length}"
echo ""

SUCCESS_COUNT=0
SKIP_COUNT=0
ERROR_COUNT=0

`;

  renamePairs.forEach((pair, index) => {
    const { originalName, newName } = pair;
    const oldEscaped = originalName.replace(/'/g, "'\\''");
    const newEscaped = newName.replace(/'/g, "'\\''");

    script += `
# File ${index + 1}/${renamePairs.length}
if [ -f '${oldEscaped}' ]; then
  if [ -f '${newEscaped}' ]; then
    echo "\${YELLOW}⚠️  Skip: Target exists${NC}"
    echo "   From: ${oldEscaped}"
    echo "   To:   ${newEscaped}"
    ((SKIP_COUNT++))
  else
    if [ "$DRY_RUN" = true ]; then
      echo "\${GREEN}✓ Would rename${NC}"
    else
      mv '${oldEscaped}' '${newEscaped}'
      echo "\${GREEN}✓ Renamed${NC}"
    fi
    echo "   From: ${oldEscaped}"
    echo "   To:   ${newEscaped}"
    ((SUCCESS_COUNT++))
  fi
else
  echo "\${RED}✗ Not found: ${oldEscaped}${NC}"
  ((ERROR_COUNT++))
fi
echo ""
`;
  });

  script += `
echo "========================================"
echo "Summary:"
echo "  ✅ Success: $SUCCESS_COUNT"
echo "  ⚠️  Skipped: $SKIP_COUNT"
echo "  ❌ Errors: $ERROR_COUNT"
echo ""

if [ "$DRY_RUN" = true ]; then
  echo "This was a DRY RUN. Run without --dry-run to actually rename files."
else
  echo "✅ Rename completed!"
fi
`;

  return script;
};

/**
 * 生成 Windows Batch 脚本
 */
const generateBatchScript = (renamePairs, options = {}) => {
  const { originalPath = '.' } = options;

  let script = `@echo off
REM AI Renamer ZX - Batch Rename Script
REM Generated: ${new Date().toLocaleString()}
REM Original directory: ${originalPath}
REM
REM Instructions:
REM 1. Copy this script to the directory containing your files
REM 2. Double-click to run, or run from command prompt
REM 3. For dry-run: rename.bat --dry-run

setlocal EnableDelayedExpansion

REM Parse arguments
set DRY_RUN=false
if "%1"=="--dry-run" set DRY_RUN=true

if "%DRY_RUN%"=="true" (
  echo.
  echo DRY RUN MODE - No files will be renamed
  echo.
)

echo AI Renamer ZX - Batch Rename Script
echo ========================================
echo.
echo Total files to rename: ${renamePairs.length}
echo.

set SUCCESS_COUNT=0
set SKIP_COUNT=0
set ERROR_COUNT=0

`;

  renamePairs.forEach((pair, index) => {
    const { originalName, newName } = pair;

    script += `
REM File ${index + 1}/${renamePairs.length}
if exist "${originalName}" (
  if exist "${newName}" (
    echo [93mWARNING Skip: Target exists[0m
    echo    From: ${originalName}
    echo    To:   ${newName}
    set /a SKIP_COUNT+=1
  ) else (
    if "%DRY_RUN%"=="true" (
      echo [92mOK Would rename[0m
    ) else (
      ren "${originalName}" "${newName}"
      echo [92mOK Renamed[0m
    )
    echo    From: ${originalName}
    echo    To:   ${newName}
    set /a SUCCESS_COUNT+=1
  )
) else (
  echo [91mERROR Not found: ${originalName}[0m
  set /a ERROR_COUNT+=1
)
echo.
`;
  });

  script += `
echo ========================================
echo Summary:
echo   Success: %SUCCESS_COUNT%
echo   Skipped: %SKIP_COUNT%
echo   Errors:  %ERROR_COUNT%
echo.

if "%DRY_RUN%"=="true" (
  echo This was a DRY RUN. Run without --dry-run to actually rename files.
) else (
  echo Rename completed!
)

pause
`;

  return script;
};

/**
 * 生成 PowerShell 脚本（Windows）
 */
const generatePowerShellScript = (renamePairs, options = {}) => {
  const { originalPath = '.' } = options;

  let script = `# AI Renamer ZX - Batch Rename Script
# Generated: ${new Date().toLocaleString()}
# Original directory: ${originalPath}
#
# Instructions:
# 1. Copy this script to the directory containing your files
# 2. Run PowerShell as Administrator (if needed)
# 3. Enable script execution: Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
# 4. Run: .\\rename.ps1
# 5. For dry-run: .\\rename.ps1 -DryRun

param(
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

if ($DryRun) {
  Write-Host ""
  Write-Host "🔍 DRY RUN MODE - No files will be renamed" -ForegroundColor Yellow
  Write-Host ""
}

Write-Host "🤖 AI Renamer ZX - Batch Rename Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total files to rename: ${renamePairs.length}"
Write-Host ""

$successCount = 0
$skipCount = 0
$errorCount = 0

`;

  renamePairs.forEach((pair, index) => {
    const { originalName, newName } = pair;

    script += `
# File ${index + 1}/${renamePairs.length}
if (Test-Path "${originalName}") {
  if (Test-Path "${newName}") {
    Write-Host "⚠️  Skip: Target exists" -ForegroundColor Yellow
    Write-Host "   From: ${originalName}"
    Write-Host "   To:   ${newName}"
    $skipCount++
  } else {
    if ($DryRun) {
      Write-Host "✓ Would rename" -ForegroundColor Green
    } else {
      Rename-Item "${originalName}" "${newName}"
      Write-Host "✓ Renamed" -ForegroundColor Green
    }
    Write-Host "   From: ${originalName}"
    Write-Host "   To:   ${newName}"
    $successCount++
  }
} else {
  Write-Host "✗ Not found: ${originalName}" -ForegroundColor Red
  $errorCount++
}
Write-Host ""
`;
  });

  script += `
Write-Host "========================================"
Write-Host "Summary:"
Write-Host "  ✅ Success: $successCount" -ForegroundColor Green
Write-Host "  ⚠️  Skipped: $skipCount" -ForegroundColor Yellow
Write-Host "  ❌ Errors: $errorCount" -ForegroundColor Red
Write-Host ""

if ($DryRun) {
  Write-Host "This was a DRY RUN. Run without -DryRun to actually rename files." -ForegroundColor Yellow
} else {
  Write-Host "✅ Rename completed!" -ForegroundColor Green
}
`;

  return script;
};

/**
 * 根据平台自动选择脚本类型
 */
const generateScript = (renamePairs, options = {}) => {
  const { platform = os.platform(), type } = options;

  // 如果指定了类型，使用指定的类型
  if (type === 'bash') {
    return {
      script: generateBashScript(renamePairs, options),
      filename: 'rename.sh',
      type: 'bash'
    };
  } else if (type === 'batch') {
    return {
      script: generateBatchScript(renamePairs, options),
      filename: 'rename.bat',
      type: 'batch'
    };
  } else if (type === 'powershell') {
    return {
      script: generatePowerShellScript(renamePairs, options),
      filename: 'rename.ps1',
      type: 'powershell'
    };
  }

  // 根据平台自动选择
  if (platform === 'win32') {
    return {
      script: generatePowerShellScript(renamePairs, options),
      filename: 'rename.ps1',
      type: 'powershell'
    };
  } else {
    return {
      script: generateBashScript(renamePairs, options),
      filename: 'rename.sh',
      type: 'bash'
    };
  }
};

/**
 * 从预览结果生成重命名脚本
 * @param {Array} previewResults - Preview API 返回的结果
 * @param {Object} options - 选项
 */
const generateScriptFromPreview = (previewResults, options = {}) => {
  console.log('\n📜 [generateScriptFromPreview] Starting...');
  console.log('   Preview results count:', previewResults.length);

  // 提取重命名对
  const renamePairs = previewResults
    .filter(r => r.success && r.newName)
    .map(r => {
      const originalName = r.originalName;
      const ext = path.extname(originalName);
      const newName = r.newName.endsWith(ext) ? r.newName : `${r.newName}${ext}`;

      return {
        originalName,
        newName,
        filePath: r.filePath
      };
    });

  console.log('   Rename pairs:', renamePairs.length);
  console.log('   Pairs:', JSON.stringify(renamePairs.map(p => ({
    from: p.originalName,
    to: p.newName
  })), null, 2));

  if (renamePairs.length === 0) {
    throw new Error('No files to rename. Please run preview first.');
  }

  const result = generateScript(renamePairs, options);
  console.log('   Generated script type:', result.type);
  console.log('   Script filename:', result.filename);
  console.log('   Script length:', result.script.length, 'bytes');

  return result;
};

module.exports = {
  generateBashScript,
  generateBatchScript,
  generatePowerShellScript,
  generateScript,
  generateScriptFromPreview
};
