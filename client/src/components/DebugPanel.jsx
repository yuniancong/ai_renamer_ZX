import React, { useState, useEffect, useRef } from 'react';

const DebugPanel = ({ isOpen, onToggle }) => {
  const [logs, setLogs] = useState([]);
  const logsEndRef = useRef(null);
  const originalConsole = useRef({});

  useEffect(() => {
    // 拦截 console.log, console.error, console.warn
    originalConsole.current = {
      log: console.log,
      error: console.error,
      warn: console.warn
    };

    const addLog = (type, args) => {
      const timestamp = new Date().toLocaleTimeString();
      const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');

      setLogs(prev => [...prev, { type, message, timestamp }].slice(-100)); // 保留最近 100 条
    };

    console.log = (...args) => {
      originalConsole.current.log(...args);
      addLog('log', args);
    };

    console.error = (...args) => {
      originalConsole.current.error(...args);
      addLog('error', args);
    };

    console.warn = (...args) => {
      originalConsole.current.warn(...args);
      addLog('warn', args);
    };

    return () => {
      // 恢复原始 console
      console.log = originalConsole.current.log;
      console.error = originalConsole.current.error;
      console.warn = originalConsole.current.warn;
    };
  }, []);

  useEffect(() => {
    // 自动滚动到底部
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const clearLogs = () => {
    setLogs([]);
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'error':
        return 'text-red-600';
      case 'warn':
        return 'text-yellow-600';
      default:
        return 'text-gray-700';
    }
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warn':
        return '⚠️';
      default:
        return '📝';
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        title="Show Debug Logs"
      >
        🐛 Debug Logs ({logs.length})
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 w-full md:w-2/3 lg:w-1/2 h-96 bg-white border-t-2 border-gray-300 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-white">
        <div className="flex items-center space-x-2">
          <span className="text-lg">🐛</span>
          <h3 className="font-semibold">Debug Logs</h3>
          <span className="text-sm text-gray-300">({logs.length} entries)</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearLogs}
            className="px-3 py-1 text-sm bg-red-600 rounded hover:bg-red-700 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={onToggle}
            className="px-3 py-1 text-sm bg-gray-600 rounded hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Logs Container */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 font-mono text-sm">
        {logs.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No logs yet. Logs will appear here when you interact with the app.
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className={`mb-2 p-2 rounded ${
                log.type === 'error'
                  ? 'bg-red-50 border-l-4 border-red-500'
                  : log.type === 'warn'
                  ? 'bg-yellow-50 border-l-4 border-yellow-500'
                  : 'bg-white border-l-4 border-blue-500'
              }`}
            >
              <div className="flex items-start space-x-2">
                <span>{getLogIcon(log.type)}</span>
                <span className="text-gray-500 text-xs">{log.timestamp}</span>
                <pre className={`flex-1 whitespace-pre-wrap break-words ${getLogColor(log.type)}`}>
                  {log.message}
                </pre>
              </div>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-100 border-t border-gray-300 text-xs text-gray-600">
        💡 Tip: Check console logs for detailed backend responses. Press F12 to open browser DevTools.
      </div>
    </div>
  );
};

export default DebugPanel;
