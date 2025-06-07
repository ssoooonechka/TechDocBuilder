import React, { useState, useEffect } from 'react';
import { 
  Tabs, Button, Layout, message, 
  Card, Input, Popover, Badge,
  Typography, Space, Divider,
  List, Col, Row
} from 'antd';
import {
  PlusOutlined, FileOutlined,SearchOutlined,
  ThunderboltOutlined, RocketOutlined, ApiOutlined,
  BookOutlined, CodeOutlined
} from '@ant-design/icons';
import useAuthStore from '../../store/authStores';
import useThemeStore from '../../store/themeStore';
import { fetchUserRooms } from '../../api/room';
import './Workspace.css';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

const Workspace = () => {
  const { token, user } = useAuthStore();
  const { darkMode } = useThemeStore();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResources, setShowResources] = useState(false);
  const [activeResourceTab, setActiveResourceTab] = useState('my-docs');
  const [activeKey, setActiveKey] = useState('');
  const [panes, setPanes] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const roomsData = await fetchUserRooms(token);
      setRooms(Array.isArray(roomsData) ? roomsData : []);
    } catch (error) {
      message.error('Ошибка загрузки комнат: ' + (error.message || error));
    } finally {
      setLoading(false);
    }
  };

  const handleNewDocument = () => {
    navigate('/workspace/new');
  };

  const openRoom = (room) => {
    if (!room?.room_uuid) return;
    navigate(`/workspace/${room.room_uuid}`);
  };

  const onEdit = (targetKey, action) => {
    if (action === 'remove') {
      setPanes(panes.filter(pane => pane.key !== targetKey));
    }
  };

  const filteredRooms = rooms.filter(room => 
    room?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resourcesContent = (
    <div className="resources-popover" style={{ 
      backgroundColor: darkMode ? '#1f1f1f' : '#fff',
      color: darkMode ? '#e0e0e0' : '#333'
    }}>
      <Input
        placeholder="Поиск документов и шаблонов..."
        prefix={<SearchOutlined />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: 16 }}
      />
  
      <Tabs 
        activeKey={activeResourceTab}
        onChange={setActiveResourceTab}
        size="small"
        tabBarStyle={{ margin: 0 }}
      >
        <TabPane 
          tab={
            <span style={{ color: darkMode ? '#e0e0e0' : undefined }}>
              <FileOutlined /> Мои документы
              <Badge count={filteredRooms.length} style={{ marginLeft: 8 }} />
            </span>
          } 
          key="my-docs"
        >
          <div className="resources-list">
            {filteredRooms.map(room => (
              <Card 
                key={room.room_uuid}
                hoverable
                onClick={() => openRoom(room)}
                className="resource-card"
                style={{ 
                  backgroundColor: darkMode ? '#141414' : '#fafafa',
                  borderColor: darkMode ? '#333' : '#f0f0f0'
                }}
              >
                <FileOutlined style={{ marginRight: 8 }} />
                <span style={{ color: darkMode ? '#e0e0e0' : undefined }}>
                  {room.name || 'Без названия'}
                </span>
              </Card>
            ))}
          </div>
        </TabPane>
      </Tabs>
    </div>
  );

  const renderWelcomeContent = () => (
    <div style={{ 
      padding: '40px 24px',
      textAlign: 'center',
      maxWidth: 1200,
      margin: '0 auto'
    }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2} style={{ color: darkMode ? '#e0e0e0' : undefined }}>
          <RocketOutlined /> Добро пожаловать в рабочее пространство
        </Title>
        
        <Text type="secondary" style={{ fontSize: 16 }}>
          Создайте новый документ или выберите существующий, чтобы начать работу
        </Text>

        <Divider />

        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} sm={12} md={8}>
            <Card 
              hoverable 
              style={{ 
                backgroundColor: darkMode ? '#1f1f1f' : '#fff',
                borderColor: darkMode ? '#333' : '#f0f0f0'
              }}
            >
              <Space direction="vertical" size="middle">
                <ThunderboltOutlined style={{ fontSize: 32, color: '#13c2c2' }} />
                <Title level={4} style={{ margin: 0, color: darkMode ? '#e0e0e0' : undefined }}>
                  Быстрый старт
                </Title>
                <Text type="secondary">
                  Используйте шаблоны для быстрого создания документов
                </Text>
                <Button 
                  type="primary" 
                  shape="round" 
                  icon={<PlusOutlined />}
                  onClick={handleNewDocument}
                >
                  Новый документ
                </Button>
              </Space>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card 
              hoverable 
              style={{ 
                backgroundColor: darkMode ? '#1f1f1f' : '#fff',
                borderColor: darkMode ? '#333' : '#f0f0f0'
              }}
            >
              <Space direction="vertical" size="middle">
                <BookOutlined style={{ fontSize: 32, color: '#13c2c2' }} />
                <Title level={4} style={{ margin: 0, color: darkMode ? '#e0e0e0' : undefined }}>
                  Документация
                </Title>
                <Text type="secondary">
                  Изучите руководства и лучшие практики
                </Text>
                <Button 
                  type="default" 
                  shape="round" 
                  icon={<BookOutlined />}
                >
                  Открыть руководство
                </Button>
              </Space>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card 
              hoverable 
              style={{ 
                backgroundColor: darkMode ? '#1f1f1f' : '#fff',
                borderColor: darkMode ? '#333' : '#f0f0f0'
              }}
            >
              <Space direction="vertical" size="middle">
                <ApiOutlined style={{ fontSize: 32, color: '#13c2c2' }} />
                <Title level={4} style={{ margin: 0, color: darkMode ? '#e0e0e0' : undefined }}>
                  Интеграции
                </Title>
                <Text type="secondary">
                  Подключите внешние сервисы и API
                </Text>
                <Button 
                  type="default" 
                  shape="round" 
                  icon={<CodeOutlined />}
                >
                  Настроить интеграции
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>

        <Divider />

        <Title level={3} style={{ color: darkMode ? '#e0e0e0' : undefined }}>
          Недавние документы
        </Title>
        
        {filteredRooms.length > 0 ? (
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
            dataSource={filteredRooms.slice(0, 3)}
            renderItem={room => (
              <List.Item>
                <Card 
                  hoverable
                  onClick={() => openRoom(room)}
                  style={{ 
                    backgroundColor: darkMode ? '#1f1f1f' : '#fff',
                    borderColor: darkMode ? '#333' : '#f0f0f0'
                  }}
                >
                  <FileOutlined style={{ marginRight: 8 }} />
                  <Text strong style={{ color: darkMode ? '#e0e0e0' : undefined }}>
                    {room.name || 'Без названия'}
                  </Text>
                </Card>
              </List.Item>
            )}
          />
        ) : (
          <Text type="secondary">У вас пока нет документов</Text>
        )}
      </Space>
    </div>
  );

  return (
    <Layout className="modern-workspace" style={{ 
      minHeight: '100vh',
      backgroundColor: darkMode ? '#141414' : '#f5f5f5'
    }}>
      <div className="workspace-header" style={{
        padding: '0 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 64,
        backgroundColor: darkMode ? '#1f1f1f' : '#fff',
        borderBottom: `1px solid ${darkMode ? '#333' : '#f0f0f0'}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Popover
          content={resourcesContent}
          title={<span style={{ color: darkMode ? '#e0e0e0' : undefined }}>Ресурсы</span>}
          trigger="click"
          placement="bottomRight"
          open={showResources}
          onOpenChange={setShowResources}
          overlayClassName="resources-popover-container"
        >
          <Button
            icon={<SearchOutlined />}
            type="link"
            style={{ color: darkMode ? '#e0e0e0' : undefined }}
          >
            Ресурсы
          </Button>
        </Popover>

          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleNewDocument}
          >
            Новый документ
          </Button>
        </div>
      </div>

      <Content
        style={{
          padding: '24px',
          overflow: 'auto',
          backgroundColor: darkMode ? '#141414' : '#f5f5f5'
        }}
      >
        {panes.length > 0 ? (
          <Tabs
            activeKey={activeKey}
            onChange={setActiveKey}
            type="editable-card"
            onEdit={onEdit}
            hideAdd
          >
            {panes.map(pane => (
              <TabPane 
                tab={
                  <span style={{ color: darkMode ? '#e0e0e0' : undefined }}>
                    <FileOutlined />
                    {pane.title}
                  </span>
                }
                key={pane.key}
                closable
              >
                {pane.content}
              </TabPane>
            ))}
          </Tabs>
        ) : (
          renderWelcomeContent()
        )}
      </Content>
    </Layout>
  );
};

export default Workspace;