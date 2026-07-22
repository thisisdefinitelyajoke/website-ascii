import React from 'react';

const AsciiArt = ({ art, className, maxHeight, fontSize, fontScale = 1 }) => {
  if (!art) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 ${className || ''}`}>
        <span className="text-sm">No preview available</span>
      </div>
    );
  }

  return (
    <pre
      className={`m-0 overflow-auto leading-[1.1] ${className || ''}`}
      style={{
        fontFamily: '"Courier New", Courier, monospace',
        fontSize: fontSize || `clamp(${0.3 * fontScale}rem, ${0.8 * fontScale}vw, ${0.5 * fontScale}rem)`,
        lineHeight: '1.1',
        whiteSpace: 'pre',
        maxHeight: maxHeight || 'none',
      }}
      dangerouslySetInnerHTML={{ __html: art }}
    />
  );
};

export default AsciiArt;
