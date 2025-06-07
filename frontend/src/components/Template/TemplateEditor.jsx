import React, { useState, useCallback, useRef } from 'react';
import { 
  Button, 
  Form, 
  Input, 
  Switch, 
  message, 
  Typography, 
  Space,
  Card,
  Badge,
  Divider
} from 'antd';
import { 
  CodeOutlined, 
  EyeOutlined, 
  SplitCellsOutlined, 
  SaveOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import useAuthStore from '../../store/authStores';
import useThemeStore from '../../store/themeStore';
import { createTemplate } from '../../api/template';
import CodeEditor from '../Workspace/CodeEditor';

const { Text } = Typography;

export const TemplateEditor = ({ onSave }) => {
  const [mode, setMode] = useState('split');
  const [content, setContent] = useState('');
  const [name, setName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const { token } = useAuthStore();
  const { darkMode } = useThemeStore(); // Получаем текущую тему
  const editorRef = useRef(null);

  const handleEditorChange = (value) => {
    setContent(value);
  };

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      message.error('Введите название шаблона');
      return;
    }

    setLoading(true);
    try {
      const result = await createTemplate(token, {
        name: name,
        content: content,
        is_public: isPublic
      });

      if (result) {
        message.success('Шаблон успешно создан!');
        setName('');
        setContent('');
        onSave && onSave();
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [name, content, isPublic, token, onSave]);

  const renderEditor = () => (
    <CodeEditor
      ref={editorRef}
      value={content}
      onChange={handleEditorChange}
      language="markdown"
      style={{
        height: '500px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    />
  );

  const renderPreview = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        padding: 24,
        height: '500px',
        overflowY: 'auto',
        background: darkMode ? '#1f1f1f' : '#fff',
        border: '1px solid #f0f0f0',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        color: darkMode ? '#e0e0e0' : '#333'
      }}
      className="markdown-preview"
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </motion.div>
  );

  return (
    <Card 
      title={
        <Space>
          <Badge color="#13c2c2" />
          <Text strong style={{ fontSize: 18 }}>Новый шаблон</Text>
        </Space>
      } 
      style={{ 
        marginBottom: 24, 
        borderRadius: 12, 
        borderBottom: 0, 
        padding: '0 24px', 
        paddingTop: 24,
        backgroundColor: darkMode ? '#1f1f1f' : '#fff'
      }}
    >
      <Form layout="vertical">
        <div style={{ 
          display: 'flex', 
          gap: 24, 
          marginBottom: 24,
          flexDirection: 'row'
        }}>
          <div style={{ flex: 2 }}>
            <Form.Item label="Название шаблона" required>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Например: API Documentation" 
                size="large"
              />
            </Form.Item>
          </div>
          
          <div style={{ flex: 1 }}>
            <Form.Item label="Публичный шаблон">
              <Switch 
                checked={isPublic}
                onChange={setIsPublic}
                checkedChildren="Да"
                unCheckedChildren="Нет"
                size="default"
                style={{ marginLeft: 8 }}
              />
            </Form.Item>
          </div>
        </div>

        <Divider style={{ margin: '16px 0', borderColor: darkMode ? '#333' : '#f0f0f0' }} />

        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          marginBottom: 16,
          gap: 8
        }}>
          <Button 
            type={mode === 'code' ? 'primary' : 'default'}
            icon={<CodeOutlined />}
            onClick={() => setMode('code')}
            style={{
              background: mode === 'code' ? '#13c2c2' : undefined,
              borderColor: mode === 'code' ? '#13c2c2' : undefined
            }}
          />
          <Button 
            type={mode === 'preview' ? 'primary' : 'default'}
            icon={<EyeOutlined />}
            onClick={() => setMode('preview')}
            style={{
              background: mode === 'preview' ? '#13c2c2' : undefined,
              borderColor: mode === 'preview' ? '#13c2c2' : undefined
            }}
          />
          <Button 
            type={mode === 'split' ? 'primary' : 'default'}
            icon={<SplitCellsOutlined />}
            onClick={() => setMode('split')}
            style={{
              background: mode === 'split' ? '#13c2c2' : undefined,
              borderColor: mode === 'split' ? '#13c2c2' : undefined
            }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          {mode === 'code' && renderEditor()}
          {mode === 'preview' && renderPreview()}
          {mode === 'split' && (
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>{renderEditor()}</div>
              <div style={{ flex: 1 }}>{renderPreview()}</div>
            </div>
          )}
        </div>

        <Divider style={{ margin: '16px 0', borderColor: darkMode ? '#333' : '#f0f0f0' }} />

        <div style={{ textAlign: 'right' }}>
          <Button 
            type="primary" 
            onClick={handleSave}
            icon={loading ? <LoadingOutlined /> : <SaveOutlined />}
            size="large"
            loading={loading}
            disabled={loading}
            style={{ 
              minWidth: 200,
              background: '#13c2c2',
              borderColor: '#13c2c2',
              height: 48,
              fontSize: 16
            }}
          >
            {loading ? 'Сохранение...' : 'Сохранить шаблон'}
          </Button>
        </div>
      </Form>
    </Card>
  );
};