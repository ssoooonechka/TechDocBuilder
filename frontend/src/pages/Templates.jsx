import React, { useState, useEffect, useCallback } from 'react';
import { 
  Layout, 
  Tabs, 
  Button, 
  Form, 
  Input, 
  Select, 
  Switch, 
  message, 
  Typography, 
  Space,
  Card,
  Grid,
  Badge
} from 'antd';
import { 
  CodeOutlined, 
  EyeOutlined, 
  SplitCellsOutlined, 
  SaveOutlined,
  LoadingOutlined,
  PlusOutlined,
  EditOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import { fetchMyTemplates, createTemplate, updateTemplate, getByName } from '../api/template';
import useAuthStore from '../store/authStores';

const { Content } = Layout;
const { Option } = Select;
const { Text } = Typography;
const { useBreakpoint } = Grid;

marked.setOptions({
  highlight: function(code, lang) {
    if (hljs.getLanguage(lang)) {
      return hljs.highlight(lang, code).value;
    }
    return hljs.highlightAuto(code).value;
  },
  langPrefix: 'hljs language-',
});

export const TemplateEditor = ({ onSave }) => {
  const { md } = useBreakpoint();
  const [mode, setMode] = useState(md ? 'split' : 'code');
  const [content, setContent] = useState('');
  const [name, setName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const { token } = useAuthStore();

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
    <div style={{ 
      border: '1px solid #d9d9d9',
      borderRadius: 8,
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <Input.TextArea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{
          width: '100%',
          height: '500px',
          fontSize: 14,
          lineHeight: 1.6,
          padding: 16,
          border: 'none',
          resize: 'none',
          fontFamily: '"Fira Code", monospace',
          background: '#fafafa'
        }}
        placeholder="Введите Markdown-содержимое шаблона..."
      />
    </div>
  );

  const renderPreview = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        padding: 24,
        height: '500px',
        overflowY: 'auto',
        background: '#fff',
        border: '1px solid #f0f0f0',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
      className="markdown-preview"
      dangerouslySetInnerHTML={{ __html: marked(content) }}
    />
  );

  return (
    <Card 
      title={
        <Space>
          <Badge color="#13c2c2" />
          <Text strong style={{ fontSize: 18 }}>Новый шаблон</Text>
        </Space>
      } 
      style={{ marginBottom: 24, borderRadius: 12, borderBottom: 0, padding: '0 24px', paddingTop: 24 }}
    >
      <Form layout="vertical">
        <div style={{ 
          display: 'flex', 
          gap: 24, 
          marginBottom: 24,
          flexDirection: md ? 'row' : 'column'
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

export const TemplateUpdater = ({ templates, onUpdate }) => {
  const { md } = useBreakpoint();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [updatedContent, setUpdatedContent] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [mode, setMode] = useState(md ? 'split' : 'code');
  const { token } = useAuthStore();

  const handleTemplateLoad = useCallback(async (name) => {
    setTemplateLoading(true);
    try {
      const data = await getByName(token, name);
      
      if (data) {
        setSelectedTemplate(data);
        setUpdatedContent(data.content || '');
        setIsPublic(data.is_public || false);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setTemplateLoading(false);
    }
  }, [token]);

  const handleUpdate = useCallback(async () => {
    if (!selectedTemplate) return;

    setLoading(true);
    try {
      const result = await updateTemplate(token, {
        old_template_name: selectedTemplate.name,
        update_data: {
          name: selectedTemplate.name,
          content: updatedContent,
          is_public: isPublic
        }
      });

      if (result) {
        message.success('Шаблон успешно обновлен!');
        onUpdate && onUpdate();
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [selectedTemplate, updatedContent, isPublic, token, onUpdate]);

  const renderEditor = () => (
    <div style={{ 
      border: '1px solid #d9d9d9',
      borderRadius: 8,
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <Input.TextArea
        value={updatedContent}
        onChange={(e) => setUpdatedContent(e.target.value)}
        rows={10}
        disabled={templateLoading}
        style={{ 
          fontFamily: '"Fira Code", monospace',
          fontSize: 14,
          lineHeight: 1.6,
          background: '#fafafa',
          color: '#333',
          padding: 16,
          border: 'none',
          resize: 'none',
          height: '500px'
        }}
      />
    </div>
  );

  const renderPreview = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        padding: 24,
        height: '500px',
        overflowY: 'auto',
        background: '#fff',
        border: '1px solid #f0f0f0',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
      className="markdown-preview"
      dangerouslySetInnerHTML={{ __html: marked(updatedContent) }}
    />
  );

  return (
    <Card 
      title={
        <Space>
          <Badge color="#722ed1" />
          <Text strong style={{ fontSize: 18 }}>Редактирование шаблона</Text>
        </Space>
      }
      style={{ marginBottom: 24, borderRadius: 12, borderBottom: 0, padding: '0 24px', paddingTop: 24 }}
    >
      <Form layout="vertical">
        <div style={{ 
          display: 'flex', 
          gap: 24, 
          marginBottom: 24,
          flexDirection: md ? 'row' : 'column'
        }}>
          <div style={{ flex: md ? 3 : 1 }}>
            <Form.Item label="Выберите шаблон">
              <Select
                placeholder="Выберите шаблон для редактирования"
                onChange={(name) => handleTemplateLoad(name)}
                loading={templateLoading}
                style={{ width: '100%' }}
                size="large"
                optionLabelProp="label"
              >
                {templates.map(name => (
                  <Option 
                    key={name} 
                    value={name}
                    label={name}
                  >
                    <Text strong>{name}</Text>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          
          {selectedTemplate && (
            <div style={{ flex: 1 }}>
              <Form.Item label="Публичный шаблон">
                <Switch 
                  checked={isPublic}
                  onChange={setIsPublic}
                  disabled={templateLoading}
                  checkedChildren="Да"
                  unCheckedChildren="Нет"
                />
              </Form.Item>
            </div>
          )}
        </div>

        {selectedTemplate && (
          <>
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
                  background: mode === 'code' ? '#722ed1' : undefined,
                  borderColor: mode === 'code' ? '#722ed1' : undefined
                }}
              />
              <Button 
                type={mode === 'preview' ? 'primary' : 'default'}
                icon={<EyeOutlined />}
                onClick={() => setMode('preview')}
                style={{
                  background: mode === 'preview' ? '#722ed1' : undefined,
                  borderColor: mode === 'preview' ? '#722ed1' : undefined
                }}
              />
              <Button 
                type={mode === 'split' ? 'primary' : 'default'}
                icon={<SplitCellsOutlined />}
                onClick={() => setMode('split')}
                style={{
                  background: mode === 'split' ? '#722ed1' : undefined,
                  borderColor: mode === 'split' ? '#722ed1' : undefined
                }}/>
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

            <div style={{ textAlign: 'right' }}>
              <Button 
                type="primary" 
                onClick={handleUpdate}
                disabled={!selectedTemplate || templateLoading}
                loading={loading}
                icon={<SaveOutlined />}
                size="large"
                style={{ 
                  minWidth: 200,
                  background: '#722ed1',
                  borderColor: '#722ed1',
                  height: 48,
                  fontSize: 16
                }}
              >
                {loading ? 'Обновление...' : 'Обновить шаблон'}
              </Button>
            </div>
          </>
        )}
      </Form>
    </Card>
  );
};

export default function TemplateManager() {
  const screens = useBreakpoint();
  const [templates, setTemplates] = useState([]);
  const [activeTab, setActiveTab] = useState('create');
  const [loading, setLoading] = useState(false);
  const { token } = useAuthStore();

  const loadTemplates = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const data = await fetchMyTemplates(token);
      setTemplates(data || []);
    } catch (error) {
      message.error('Ошибка загрузки шаблонов');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const tabItems = [
    {
      key: 'create',
      label: (
        <Space>
          <PlusOutlined />
          <Text>Создать шаблон</Text>
        </Space>
      ),
      children: <TemplateEditor onSave={loadTemplates} />
    },
    {
      key: 'update',
      label: (
        <Space>
          <EditOutlined />
          <Text>Редактировать шаблон</Text>
        </Space>
      ),
      children: <TemplateUpdater templates={templates} onUpdate={loadTemplates} />
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Content style={{ 
        padding: screens.md ? '24px 24px 0' : '16px 16px 0', 
        maxWidth: 1200, 
        margin: '0 auto', 
        width: '100%'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            style={{ 
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              marginBottom: 24,
              border: 'none'
            }}
          >
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              tabBarStyle={{ 
                margin: 0,
                padding: screens.md ? '0 24px' : '0 16px',
                background: '#fff',
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12
              }}
              size="large"
              items={tabItems}
            />
          </Card>
        </motion.div>
      </Content>
    </Layout>
  );
}