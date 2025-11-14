import React from 'react';

const SettingsPanel = ({
  config,
  onConfigChange,
  onTest,
  onRefreshModels,
  availableModels = [],
  loadingModels = false,
  connectionStatus = null
}) => {
  const handleChange = (key, value) => {
    onConfigChange({ ...config, [key]: value });
  };

  const caseOptions = [
    'camelCase',
    'capitalCase',
    'constantCase',
    'dotCase',
    'kebabCase',
    'noCase',
    'pascalCase',
    'pascalSnakeCase',
    'pathCase',
    'sentenceCase',
    'snakeCase',
    'trainCase'
  ];

  const providerOptions = ['ollama', 'lm-studio', 'openai'];

  const languageOptions = [
    'English',
    'Chinese',
    'Spanish',
    'French',
    'German',
    'Japanese',
    'Korean',
    'Russian',
    'Portuguese',
    'Italian',
    'Arabic',
    'Turkish'
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Quick Settings</h3>

        {/* Connection Status Indicator */}
        {connectionStatus && (
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                connectionStatus === 'connected'
                  ? 'bg-green-500 animate-pulse'
                  : connectionStatus === 'disconnected'
                  ? 'bg-red-500'
                  : 'bg-yellow-500 animate-pulse'
              }`}
            />
            <span className="text-sm text-gray-600">
              {connectionStatus === 'connected' && '✅ Connected'}
              {connectionStatus === 'disconnected' && '❌ Disconnected'}
              {connectionStatus === 'connecting' && '🔄 Connecting...'}
            </span>
          </div>
        )}
      </div>

      {/* Provider & Model */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Provider
          </label>
          <select
            value={config.defaultProvider || 'ollama'}
            onChange={(e) => handleChange('defaultProvider', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {providerOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
            <span>Model</span>
            {onRefreshModels && (
              <button
                onClick={onRefreshModels}
                disabled={loadingModels}
                className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                title="Refresh model list"
              >
                {loadingModels ? '🔄 Loading...' : '🔄 Refresh'}
              </button>
            )}
          </label>
          <select
            value={config.defaultModel || ''}
            onChange={(e) => handleChange('defaultModel', e.target.value)}
            disabled={loadingModels || availableModels.length === 0}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">
              {loadingModels
                ? 'Loading models...'
                : availableModels.length === 0
                ? 'No models found'
                : 'Select a model'}
            </option>
            {availableModels.map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Base URL & API Key */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Base URL
          </label>
          <input
            type="text"
            value={config.defaultBaseURL || ''}
            onChange={(e) => handleChange('defaultBaseURL', e.target.value)}
            placeholder="http://127.0.0.1:11434"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {config.defaultProvider === 'openai' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <input
              type="password"
              value={config.defaultApiKey || ''}
              onChange={(e) => handleChange('defaultApiKey', e.target.value)}
              placeholder="sk-..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Case & Chars */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Case Style
          </label>
          <select
            value={config.defaultCase || 'kebabCase'}
            onChange={(e) => handleChange('defaultCase', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {caseOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Chars
          </label>
          <input
            type="number"
            value={config.defaultChars || 50}
            onChange={(e) => handleChange('defaultChars', parseInt(e.target.value))}
            min="10"
            max="200"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Frames
          </label>
          <input
            type="number"
            value={config.defaultFrames || 3}
            onChange={(e) => handleChange('defaultFrames', parseInt(e.target.value))}
            min="1"
            max="10"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Language */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Language
        </label>
        <select
          value={config.defaultLanguage || 'English'}
          onChange={(e) => handleChange('defaultLanguage', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {languageOptions.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* Custom Prompt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Custom Prompt
        </label>
        <textarea
          value={config.defaultCustomPrompt || ''}
          onChange={(e) => handleChange('defaultCustomPrompt', e.target.value)}
          placeholder="Add additional instructions..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Include Subdirectories */}
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={config.defaultIncludeSubdirectories || false}
          onChange={(e) => handleChange('defaultIncludeSubdirectories', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label className="ml-2 text-sm text-gray-700">
          Include subdirectories
        </label>
      </div>

      {/* Test Connection Button */}
      {onTest && (
        <button
          onClick={onTest}
          className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Test Connection
        </button>
      )}
    </div>
  );
};

export default SettingsPanel;
