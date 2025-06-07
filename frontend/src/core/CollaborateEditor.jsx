import React, { useEffect, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { Spin } from 'antd';

const CollaborativeEditor = ({ roomId, isOwner, initialContent, onContentChange }) => {
  const [content, setContent] = useState(initialContent);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setContent(initialContent);
    setIsLoading(false);
  }, [initialContent]);

  const handleEditorChange = (value) => {
    if (value === undefined) return;
    setContent(value);
    onContentChange(value);
  };

  if (isLoading) {
    return <Spin />;
  }

  return (
    <MonacoEditor
      height="80vh"
      language="markdown"
      theme="vs-dark"
      value={content}
      onChange={handleEditorChange}
      options={{
        readOnly: !isOwner,
        minimap: { enabled: true },
        fontSize: 14,
        wordWrap: 'on',
      }}
    />
  );
};

export default CollaborativeEditor;