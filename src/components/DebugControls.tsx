import React from 'react';

interface DebugControlsProps {
  debugMode: boolean;
  onToggleDebug: () => void;
  onShowPlugins: () => void;
}

const DebugControls: React.FC<DebugControlsProps> = ({ 
  debugMode, 
  onToggleDebug,
  onShowPlugins
}) => {
  return (
    <div className="debug-controls">
      <div className={`debug-indicator ${debugMode ? 'debug-on' : 'debug-off'}`}>
        <span className="debug-status"></span>
        <span>调试{debugMode ? '开启' : '关闭'}</span>
      </div>
      
      <button className="debug-button" onClick={onToggleDebug}>
        {debugMode ? '关闭调试' : '开启调试'}
      </button>
      
      <button className="debug-button plugins" onClick={onShowPlugins}>
        查看插件
      </button>
    </div>
  );
};

export default DebugControls;