import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  Card, 
  Button, 
  Space, 
  Typography, 
  Switch, 
  message,
  Spin,
  Select,
  Badge,
  Input,
  Form,
  Tag,
  Divider,
  Popover,
  Menu,
  List,
  Avatar,
  App,
  theme
} from 'antd';
import { 
  CodeOutlined, 
  EyeOutlined, 
  SplitCellsOutlined, 
  SaveOutlined,
  CloseOutlined,
  GlobalOutlined,
  MoreOutlined,
  HistoryOutlined,
  UserOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import 'highlight.js/styles/github.css';
import 'highlight.js/styles/github-dark.css';
import useAuthStore from '../../store/authStores';
import { updateTemplate, getByName, getPublicTemplateInfo } from '../../api/template';
import CodeEditor from '../Workspace/CodeEditor';

const { Text } = Typography;
const { useToken } = theme;

export const TemplateUpdater = ({ 
  templateName,
  isPublic = false,
  onClose,
  onUpdate,
  templates,
}) => {
  const { token: antdToken } = useToken();
  const { message } = App.useApp();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [updatedContent, setUpdatedContent] = useState('');
  const [isPublicState, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [mode, setMode] = useState('split');
  const { token, user } = useAuthStore();
  const editorRef = useRef(null);
  const titleRef = useRef('');

  const handleEditorChange = (value) => {
    setUpdatedContent(value);
  };

  const loadTemplate = useCallback(async (name) => {
    setTemplateLoading(true);
    try {
      const data = isPublic 
        ? await getPublicTemplateInfo(token, name)
        : await getByName(token, name);
      
      if (data) {
        setSelectedTemplate(data);
        setUpdatedContent(data.content || '');
        setIsPublic(data.is_public || false);
        titleRef.current = data.name || '';
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setTemplateLoading(false);
    }
  }, [token, isPublic, message]);

  useEffect(() => {
    if (templateName) {
      loadTemplate(templateName);
    }
  }, [templateName, loadTemplate]);

  const handleUpdate = async () => {
    if (!selectedTemplate || isPublic) return;

    setLoading(true);
    try {
      const result = await updateTemplate(token, {
        old_template_name: selectedTemplate.name,
        update_data: {
          name: selectedTemplate.name,
          content: updatedContent,
          is_public: isPublicState
        }
      });

      if (result) {
        message.success('Шаблон успешно обновлен!');
        onUpdate && onUpdate();
        onClose && onClose();
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (e) => {
    titleRef.current = e.target.value;
  };

  const moreActionsMenu = (
    <Menu>
      <Menu.Item key="history" icon={<HistoryOutlined />}>
        История изменений
      </Menu.Item>
    </Menu>
  );

  const renderEditor = useMemo(() => (
    <CodeEditor
      ref={editorRef}
      value={updatedContent}
      onChange={handleEditorChange}
      language="markdown"
      style={{
        height: 'calc(100vh - 240px)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
      options={{
        readOnly: templateLoading || isPublic
      }}
    />
  ), [updatedContent, templateLoading, isPublic]);

  const MarkdownPreview = useMemo(() => {
    const previewStyle = {
      padding: 24,
      height: 'calc(100vh - 240px)',
      overflowY: 'auto',
      background: antdToken.colorBgContainer,
      color: antdToken.colorText,
      border: `1px solid ${antdToken.colorBorder}`,
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={previewStyle}
        className="markdown-preview"
      >
        <ReactMarkdown
          components={{
            code({node, inline, className, children, ...props}) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <div className={`hljs ${antdToken.colorBgContainer === '#ffffff' ? 'light' : 'dark'}`}>
                  <pre className={className} style={{
                    background: antdToken.colorFillAlter,
                    borderRadius: 6,
                    padding: 16,
                    overflowX: 'auto'
                  }}>
                    <code {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            a({node, ...props}) {
              return <a {...props} style={{ color: antdToken.colorPrimary }} />;
            },
            blockquote({node, ...props}) {
              return <blockquote {...props} style={{
                borderLeft: `4px solid ${antdToken.colorPrimary}`,
                margin: 0,
                paddingLeft: 16,
                color: antdToken.colorTextSecondary,
                fontStyle: 'italic'
              }} />;
            }
          }}
        >
          {updatedContent}
        </ReactMarkdown>
      </motion.div>
    );
  }, [updatedContent, antdToken]);

  const renderContent = useMemo(() => {
    switch (mode) {
      case 'code':
        return renderEditor;
      case 'preview':
        return MarkdownPreview;
      case 'split':
      default:
        return (
          <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 240px)' }}>
            <div style={{ flex: 1 }}>{renderEditor}</div>
            <div style={{ flex: 1 }}>{MarkdownPreview}</div>
          </div>
        );
    }
  }, [mode, renderEditor, MarkdownPreview]);

  if (templateLoading) {
    return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }} />;
  }

  if (!selectedTemplate) {
    return <Text type="secondary">Шаблон не найден</Text>;
  }

  return (
    <Card 
      title={
        <Input
          defaultValue={titleRef.current}
          onChange={isPublic ? undefined : handleTitleChange}
          placeholder="Название шаблона"
          style={{ 
            fontSize: 16,
            border: 'none',
            padding: 0,
            width: '100%'
          }}
          readOnly={isPublic}
        />
      }
      extra={
        <Space>
          {isPublic && <Tag icon={<GlobalOutlined />} color="blue">Публичный</Tag>}
          
          <Space size={4}>
            <Button 
              type={mode === 'code' ? 'primary' : 'text'}
              icon={<CodeOutlined />}
              onClick={() => setMode('code')}
            />
            <Button 
              type={mode === 'split' ? 'primary' : 'text'}
              icon={<SplitCellsOutlined />}
              onClick={() => setMode('split')}
            />
            <Button 
              type={mode === 'preview' ? 'primary' : 'text'}
              icon={<EyeOutlined />}
              onClick={() => setMode('preview')}
            />
          </Space>

          <Divider type="vertical" />

          <Popover 
            content={moreActionsMenu} 
            trigger="click" 
            placement="bottomRight"
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Popover>

          {onClose && (
            <Button 
              icon={<CloseOutlined />} 
              onClick={onClose}
            />
          )}
        </Space>
      }
      style={{ 
        height: '100vh',
        border: 'none',
        borderRadius: 0 
      }}
    >
      {templates ? (
        <Form layout="vertical">
          <Form.Item label="Выберите шаблон">
            <Select
              placeholder="Выберите шаблон для редактирования"
              onChange={loadTemplate}
              loading={templateLoading}
              style={{ width: '100%' }}
              size="large"
              value={selectedTemplate?.name}
            >
              {templates.map(template => (
                <Select.Option key={template.name} value={template.name}>
                  <Space>
                    <Avatar size="small" icon={<UserOutlined />} />
                    <Text>{template.name}</Text>
                    {template.is_public && <Tag icon={<GlobalOutlined />} color="blue">Публичный</Tag>}
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      ) : null}

      {!isPublic && (
        <Form.Item label="Публичный шаблон" style={{ marginBottom: 16 }}>
          <Switch 
            checked={isPublicState}
            onChange={setIsPublic}
            disabled={loading}
            checkedChildren="Да"
            unCheckedChildren="Нет"
          />
        </Form.Item>
      )}

      {renderContent}

      {!isPublic && (
        <div style={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24,
          zIndex: 1
        }}>
          <Button 
            type="primary" 
            onClick={handleUpdate}
            loading={loading}
            icon={<SaveOutlined />}
            size="large"
            style={{ 
              background: '#722ed1',
              borderColor: '#722ed1',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
          >
            {loading ? 'Обновление...' : 'Обновить шаблон'}
          </Button>
        </div>
      )}
    </Card>
  );
};