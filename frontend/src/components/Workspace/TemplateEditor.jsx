import React, { useState, useEffect } from 'react';
import { Card, Space, Button, Input, message, Spin, Form, Select, Tag, Tooltip } from 'antd';
import { updateTemplate, createTemplate, getByName, getPublicTemplateInfo } from '../../api/template';
import useAuthStore from '../../store/authStores';
import CodeEditor from './CodeEditor';
import { GlobalOutlined, StarFilled, StarOutlined } from '@ant-design/icons';
import { starTemplate, unstarTemplate } from '../../api/star';
const { Option } = Select;

const TemplateEditor = ({ templateData, isNew = false, isPublic = false, onSuccess }) => {
  const { token } = useAuthStore();
  const [content, setContent] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('common');
  const [loading, setLoading] = useState(!isNew);
  const [starsCount, setStarsCount] = useState(0);
  const [starredByUser, setStarredByUser] = useState(false);
  const [starLoading, setStarLoading] = useState(false);

  useEffect(() => {
    if (!isNew) {
      loadTemplateData();
    } else {
      setName('Новый шаблон');
      setContent('# Шаблон документации\n\nОписание...');
    }
  }, [templateData]);

  const loadTemplateData = async () => {
    try {
      setLoading(true);
      let data;
      
      if (isPublic) {
        data = await getPublicTemplateInfo(token, templateData.name);
        if (data) {
          setStarsCount(data.stars);
          setStarredByUser(data.starred_by_user);
        }
      } else {
        data = await getByName(token, templateData.name);
      }
      
      if (!data) throw new Error('Шаблон не найден');
      
      setContent(data.content || '');
      setName(data.name || '');
      setCategory(data.category || 'common');
    } catch (error) {
      message.error(error.message || 'Ошибка загрузки шаблона');
    } finally {
      setLoading(false);
    }
  };

  const handleStarToggle = async () => {
    if (!token) {
      message.warning('Необходимо авторизоваться, чтобы ставить звезды');
      return;
    }

    try {
      setStarLoading(true);
      if (starredByUser) {
        await unstarTemplate(token, templateData.name);
        setStarsCount(prev => prev - 1);
        message.success('Звезда удалена');
      } else {
        await starTemplate(token, templateData.name);
        setStarsCount(prev => prev + 1);
        message.success('Шаблон отмечен звездой');
      }
      setStarredByUser(!starredByUser);
    } catch (error) {
      message.error(error.message || 'Ошибка при обновлении звезды');
    } finally {
      setStarLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const template = {
        name,
        content,
        category
      };

      if (isNew) {
        await createTemplate(token, template);
        message.success('Шаблон создан!');
        if (onSuccess) onSuccess();
      } else if (!isPublic) {
        await updateTemplate(token, template);
        message.success('Шаблон обновлен!');
        if (onSuccess) onSuccess();
      } else {
        message.info('Публичные шаблоны нельзя редактировать');
      }
    } catch (error) {
      message.error(error.message || 'Ошибка сохранения шаблона');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }} />;
  }

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Название шаблона"
            style={{ flex: 1 }}
            readOnly={isPublic && !isNew}
          />
          {isPublic && (
            <Tag icon={<GlobalOutlined />} color="blue" style={{ marginLeft: 8 }}>
              Публичный
            </Tag>
          )}
        </div>
      }
      extra={
        <Space>
          {isPublic && (
            <Tooltip title={starredByUser ? "Удалить звезду" : "Добавить в избранное"}>
              <Button 
                icon={starredByUser ? <StarFilled /> : <StarOutlined />} 
                onClick={handleStarToggle}
                loading={starLoading}
                style={{ color: starredByUser ? '#faad14' : undefined }}
              >
                {starsCount}
              </Button>
            </Tooltip>
          )}
          {(!isPublic || isNew) && (
            <Button type="primary" onClick={handleSave} loading={loading}>
              Сохранить
            </Button>
          )}
        </Space>
      }
    >
      <Form layout="vertical">
        <Form.Item label="Содержимое шаблона">
          <CodeEditor 
            value={content}
            onChange={setContent}
            language="markdown"
            height="60vh"
            readOnly={isPublic && !isNew}
          />
        </Form.Item>
      </Form>
    </Card>
  );
};

export default TemplateEditor;