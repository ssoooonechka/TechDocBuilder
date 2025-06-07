import React, { forwardRef, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import useThemeStore from '../../store/themeStore';

const CodeEditor = forwardRef(({ 
  value, 
  onChange, 
  language = 'markdown', 
  height = '500px',
  style,
  readOnly = false
}, ref) => {
  const [isEditorReady, setIsEditorReady] = useState(false);
  const { darkMode } = useThemeStore();

  const handleEditorDidMount = (editor, monaco) => {
    setIsEditorReady(true);
    if (ref) {
      ref.current = editor;
    }
    
    editor.updateOptions({ readOnly });
    
    monaco.editor.setTheme(darkMode ? 'vs-dark' : 'vs-light');
  };

  useEffect(() => {
    if (isEditorReady && ref.current) {
      const theme = darkMode ? 'vs-dark' : 'vs-light';
      ref.current._themeService.setTheme(theme);
      
      ref.current.updateOptions({ readOnly });
    }
  }, [darkMode, isEditorReady, ref, readOnly]);

  return (
    <div style={{ 
      ...style, 
      border: '1px solid #d9d9d9', 
      borderRadius: 2,
      backgroundColor: darkMode ? '#1f1f1f' : '#ffffff',
      opacity: readOnly ? 0.8 : 1
    }}>
      <Editor
        height={height}
        language={language}
        theme={darkMode ? 'vs-dark' : 'vs-light'}
        value={value}
        onChange={readOnly ? undefined : onChange}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          wordWrap: 'on',
          automaticLayout: true,
          lineNumbers: readOnly ? 'off' : 'on',
          glyphMargin: !readOnly,
          folding: !readOnly,
          lineDecorationsWidth: readOnly ? 0 : 10,
        }}
      />
      {readOnly && (
        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          backgroundColor: 'rgba(0,0,0,0.5)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: 4,
          fontSize: 12,
          zIndex: 10
        }}>
          Только для чтения
        </div>
      )}
    </div>
  );
});

CodeEditor.displayName = 'CodeEditor';

export default CodeEditor;