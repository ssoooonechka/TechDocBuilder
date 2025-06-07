import React, { useState, useEffect } from 'react';
import { 
  Tabs, 
  Card, 
  Input, 
  Space, 
  Typography, 
  Badge, 
  Spin,
  Tag,
  Button,
  Tooltip,
  message,
  List,
  Avatar
} from 'antd';
import { 
  StarOutlined, 
  StarFilled, 
  GlobalOutlined,
  SearchOutlined,
  EditOutlined,
  EyeOutlined,
  UserOutlined
} from '@ant-design/icons';
import { fetchMyTemplates, fetchPublicTemplates, getPublicTemplateInfo } from '../../api/template';
import { starTemplate, unstarTemplate } from '../../api/star';
import useAuthStore from '../../store/authStores';
import { TemplateUpdater } from './TemplateUpdater';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { TabPane } = Tabs;
const { Text } = Typography;

const TemplateOverview = () => {
  const [myTemplates, setMyTemplates] = useState([]);
  const [publicTemplates, setPublicTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('my');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const { token, user } = useAuthStore();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const [myTpls, publicTpls] = await Promise.all([
        fetchMyTemplates(token),
        fetchPublicTemplates(token)
      ]);
      setMyTemplates(myTpls || []);
      setPublicTemplates(publicTpls || []);
    } catch (error) {
      message.error('Ошибка загрузки шаблонов');
    } finally {
      setLoading(false);
    }
  };

  const handleStarToggle = async (templateName) => {
    if (!token) {
      message.warning('Необходимо авторизоваться, чтобы ставить звезды');
      return;
    }

    try {
      const template = publicTemplates.find(t => t.name === templateName);
      if (!template) return;

      const isStarred = template.starred_by_user;
      if (isStarred) {
        await unstarTemplate(token, templateName);
        setPublicTemplates(prev => 
          prev.map(t => 
            t.name === templateName 
              ? { 
                  ...t, 
                  stars: t.stars - 1, 
                  starred_by_user: false 
                } 
              : t
          )
        );
        message.success('Звезда удалена');
      } else {
        await starTemplate(token, templateName);
        setPublicTemplates(prev => 
          prev.map(t => 
            t.name === templateName 
              ? { 
                  ...t, 
                  stars: t.stars + 1, 
                  starred_by_user: true 
                } 
              : t
          )
        );
        message.success('Шаблон отмечен звездой');
      }
    } catch (error) {
      message.error(error.message || 'Ошибка при обновлении звезды');
    }
  };

  const openTemplate = (template, isPublic = false) => {
    setSelectedTemplate({
      ...template,
      isPublic
    });
  };

  const closeTemplate = () => {
    setSelectedTemplate(null);
  };

  const filteredMyTemplates = myTemplates.filter(template => 
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPublicTemplates = publicTemplates.filter(template => 
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTemplateCard = (template, isPublic = false) => {
    const lastUpdated = dayjs(template.last_update).fromNow();
    
    return (
      <List.Item
        key={template.name}
        actions={[
          isPublic ? (
            <Tooltip title={template.starred_by_user ? "Удалить звезду" : "Добавить в избранное"}>
              <Button 
                type="text" 
                icon={template.starred_by_user ? <StarFilled /> : <StarOutlined />} 
                onClick={(e) => {
                  e.stopPropagation();
                  handleStarToggle(template.name);
                }}
                style={{ color: template.starred_by_user ? '#faad14' : undefined }}
              >
                {template.stars || 0}
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title="Редактировать">
              <EditOutlined onClick={(e) => {
                e.stopPropagation();
                openTemplate(template);
              }} />
            </Tooltip>
          ),
          <Tooltip title="Просмотреть">
            <EyeOutlined onClick={(e) => {
              e.stopPropagation();
              openTemplate(template, isPublic);
            }} />
          </Tooltip>
        ]}
        onClick={() => openTemplate(template, isPublic)}
        style={{ 
          padding: '16px 24px',
          borderBottom: '1px solid #f0f0f0',
          cursor: 'pointer',
          transition: 'background 0.3s',
          ':hover': {
            background: '#fafafa'
          }
        }}
      >
        <List.Item.Meta
          avatar={<Avatar icon={<UserOutlined />} />}
          title={
            <Space>
              <Text strong>{template.name}</Text>
              {isPublic && <Tag icon={<GlobalOutlined />} color="blue">Публичный</Tag>}
            </Space>
          }
          description={
            <Space direction="vertical" size={0}>
              <Text type="secondary">Обновлено {lastUpdated}</Text>
              {isPublic && template.starred_by_user && (
                <Tag color="gold">В избранном</Tag>
              )}
            </Space>
          }
        />
      </List.Item>
    );
  };

  if (selectedTemplate) {
    return (
      <div>
        <Button 
          onClick={closeTemplate}
          style={{ marginBottom: 16 }}
        >
          Назад к списку
        </Button>
        
        <TemplateUpdater 
          templateName={selectedTemplate.name} 
          isPublic={selectedTemplate.isPublic}
          onClose={closeTemplate}
          onUpdate={loadTemplates}
        />
      </div>
    );
  }

  return (
    <Card
      title={
        <Space>
          <Badge color="#1677ff" />
          <Text strong style={{ fontSize: 18 }}>Обзор шаблонов</Text>
        </Space>
      }
      style={{ borderRadius: 12, borderBottom: 0, padding: '0 24px', paddingTop: 24 }}
    >
      <Input
        placeholder="Поиск шаблонов..."
        prefix={<SearchOutlined />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: 24 }}
      />

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane
          tab={
            <Space>
              <StarOutlined />
              <Text>Мои шаблоны</Text>
              <Badge count={filteredMyTemplates.length} />
            </Space>
          }
          key="my"
        >
          {loading ? (
            <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }} />
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={filteredMyTemplates}
              renderItem={template => renderTemplateCard(template)}
              locale={{ emptyText: 'У вас пока нет шаблонов' }}
              style={{ maxHeight: '60vh', overflowY: 'auto' }}
            />
          )}
        </TabPane>

        <TabPane
          tab={
            <Space>
              <GlobalOutlined />
              <Text>Все шаблоны</Text>
              <Badge count={filteredPublicTemplates.length} />
            </Space>
          }
          key="public"
        >
          {loading ? (
            <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }} />
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={filteredPublicTemplates}
              renderItem={template => renderTemplateCard(template, true)}
              locale={{ emptyText: 'Нет доступных публичных шаблонов' }}
              style={{ maxHeight: '60vh', overflowY: 'auto' }}
            />
          )}
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default TemplateOverview;