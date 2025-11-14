const changeCase = require('./changeCase')
const getModelResponse = require('./getModelResponse')

module.exports = async options => {
  const { _case, chars, content, language, videoPrompt, customPrompt, relativeFilePath } = options

  try {
    const promptLines = [
      'Generate a concise, descriptive filename for the following content:',
      `- Use ${_case} format`,
      `- Maximum ${chars} characters`,
      `- Use ${language} language in the filename`,
      '- Exclude file extension',
      '- Avoid special characters',
      '- Output only the filename',
      '',
      `IMPORTANT: Your entire response should be just the filename in ${_case} format, in ${language} language, and max ${chars} characters. Do not include any other text.`
    ]

    if (videoPrompt) {
      promptLines.unshift(videoPrompt, '')
    }

    if (content) {
      promptLines.push('', 'Content:', content)
    }

    if (customPrompt) {
      promptLines.push('', 'Custom instructions:', customPrompt)
    }

    const prompt = promptLines.join('\n')

    const modelResult = await getModelResponse({ ...options, prompt })

    // 清理模型输出，提取真正的文件名
    let text = modelResult.trim()

    // 移除常见的模型思考过程标记
    const thinkPatterns = [
      /think[:-]?\s*/gi,
      /the\s+final\s+answer\s+(is|would\s+be)[:-]?\s*/gi,
      /so\s+the\s+filename\s+(is|would\s+be|should\s+be)[:-]?\s*/gi,
      /therefore[,:]?\s+/gi,
      /the\s+filename\s+should\s+be[:-]?\s*/gi,
      /answer[:-]?\s*/gi,
      /^.*?因此[，：、]?\s*/,
      /^.*?所以[，：、]?\s*/,
      /^.*?文件名[应该是为：，、]?\s*/,
    ]

    for (const pattern of thinkPatterns) {
      text = text.replace(pattern, '')
    }

    // 如果有多个破折号分隔的部分，取最后一个有意义的部分
    if (text.includes('-')) {
      const parts = text.split('-').filter(p => p.trim().length > 0)

      // 移除常见的填充词
      const filteredParts = parts.filter(part => {
        const lower = part.toLowerCase().trim()
        return !['think', 'answer', 'final', 'therefore', 'so', 'the'].includes(lower) &&
               lower.length > 1
      })

      if (filteredParts.length > 0) {
        // 优先选择包含中文或较长的部分
        const meaningfulPart = filteredParts.find(p => /[\u4e00-\u9fa5]/.test(p) && p.length > 3) ||
                               filteredParts[filteredParts.length - 1]
        text = meaningfulPart
      }
    }

    // 移除前导/尾随的特殊字符
    text = text.replace(/^[-_\s]+|[-_\s]+$/g, '')

    // 限制长度
    const maxChars = chars + 10
    text = text.slice(0, maxChars)

    const filename = await changeCase({ text, _case })
    return filename
  } catch (err) {
    console.log(`🔴 Model error: ${err.message} (${relativeFilePath})`)
  }
}
