import React from 'react';
import { 
  Card, Row, Col, Button, Typography, 
  Space, Divider, Badge, List, Avatar 
} from 'antd';
import { 
  TeamOutlined, FileTextOutlined, DatabaseOutlined, 
  RocketOutlined, EditOutlined, ThunderboltOutlined,
  CodeOutlined, CloudOutlined, LockOutlined, 
  ApiOutlined, HistoryOutlined, StarOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStores';
import useThemeStore from '../store/themeStore';

const { Title, Text, Paragraph } = Typography;

const featureCards = [
  {
    title: "Совместное редактирование",
    icon: <TeamOutlined style={{ fontSize: 24 }} />,
    description: "Редактируйте документы в реальном времени с коллегами",
    color: "#1890ff",
    path: "/workspace"
  },
  {
    title: "Шаблоны документации",
    icon: <FileTextOutlined style={{ fontSize: 24 }} />,
    description: "Готовые структуры для API, БД, архитектуры",
    color: "#722ed1",
    path: "/templates"
  },
  {
    title: "SQL → Markdown конвертер",
    icon: <DatabaseOutlined style={{ fontSize: 24 }} />,
    description: "Автоматическое преобразование запросов в таблицы",
    color: "#13c2c2",
    path: "/converter"
  },
  {
    title: "API документация",
    icon: <ApiOutlined style={{ fontSize: 24 }} />,
    description: "Генерация документации из OpenAPI/Swagger",
    color: "#fa8c16",
    path: "/api-docs"
  },
  {
    title: "Версионность",
    icon: <HistoryOutlined style={{ fontSize: 24 }} />,
    description: "История изменений и контроль версий",
    color: "#52c41a",
    path: "/versioning"
  },
  {
    title: "Безопасность",
    icon: <LockOutlined style={{ fontSize: 24 }} />,
    description: "Гибкие настройки доступа к документам",
    color: "#f5222d",
    path: "/security"
  }
];

const recentTemplates = [
  { name: "API Specification", lastEdited: "2 часа назад", icon: <ApiOutlined /> },
  { name: "Database Schema", lastEdited: "Вчера", icon: <DatabaseOutlined /> },
  { name: "Миграции SQL", lastEdited: "3 дня назад", icon: <CodeOutlined /> },
  { name: "Архитектура системы", lastEdited: "Неделю назад", icon: <CloudOutlined /> },
  { name: "Руководство разработчика", lastEdited: "2 недели назад", icon: <FileTextOutlined /> },
  { name: "Технические требования", lastEdited: "Месяц назад", icon: <StarOutlined /> }
];

const testimonials = [
  {
    name: "Алексей Петров",
    role: "Tech Lead",
    text: "Сервис сократил время создания документации на 60%",
    avatar: "A"
  },
  {
    name: "Мария Иванова",
    role: "Product Manager",
    text: "Лучший инструмент для совместной работы над техдокументацией",
    avatar: "M"
  },
  {
    name: "Дмитрий Сидоров",
    role: "Backend Developer",
    text: "Конвертер SQL экономит часы ручной работы",
    avatar: "D"
  }
];

export default function HomePage() {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { darkMode } = useThemeStore();

  const cardStyle = {
    borderTop: '3px solid',
    height: '100%',
    backgroundColor: darkMode ? '#1f1f1f' : '#fff',
    position: 'relative',
    overflow: 'hidden'
  };

  const containerStyle = {
    padding: '24px',
    maxWidth: 1200,
    margin: '0 auto',
    backgroundColor: darkMode ? '#141414' : '#fff',
    minHeight: '100vh'
  };

  const sectionStyle = {
    backgroundColor: darkMode ? '#1f1f1f' : '#f6f7f9',
    border: 'none',
    background: darkMode 
      ? 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)' 
      : 'linear-gradient(135deg, #f6f7f9 0%, #e9ebee 100%)'
  };

  return (
    <div style={containerStyle}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Space direction="vertical" size="large" style={{ textAlign: 'center', width: '100%', marginBottom: 48 }}>
          <Title level={2} style={{ marginBottom: 0, color: darkMode ? '#e0e0e0' : undefined }}>
            <RocketOutlined style={{ color: '#1890ff', marginRight: 12 }} />
            TechDoc Builder
          </Title>
          <Text type={darkMode ? "secondary" : undefined} style={{ fontSize: 18 }}>
            Современная платформа для технической документации
          </Text>
          <Space>
            <Button 
              type="primary" 
              size="large" 
              icon={<EditOutlined />}
              onClick={() => navigate(token ? '/editor' : '/login')}
            >
              Начать документ
            </Button>
            <Button 
              size="large" 
              icon={<ThunderboltOutlined />}
              onClick={() => navigate('/converter')}
            >
              SQL Конвертер
            </Button>
          </Space>
        </Space>
      </motion.div>

      <Divider orientation="left" style={{ color: darkMode ? '#e0e0e0' : undefined }}>
        Основные возможности
      </Divider>
      <Row gutter={[24, 24]} style={{ marginBottom: 48 }}>
        {featureCards.map((feature, index) => (
          <Col xs={24} sm={12} lg={8} key={index}>
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                hoverable
                style={{ 
                  ...cardStyle,
                  borderTopColor: feature.color
                }}
                onClick={() => navigate(feature.path)}
              >
                <Space direction="vertical" size="middle">
                  <Badge 
                    count={feature.icon} 
                    color={feature.color} 
                    style={{ 
                      backgroundColor: 'transparent',
                      color: feature.color
                    }}
                  />
                  <Title level={4} style={{ marginBottom: 8, color: darkMode ? '#e0e0e0' : undefined }}>
                    {feature.title}
                  </Title>
                  <Text type={darkMode ? "secondary" : undefined}>{feature.description}</Text>
                </Space>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      <Divider orientation="left" style={{ color: darkMode ? '#e0e0e0' : undefined }}>
        Популярные шаблоны
      </Divider>
      <Row gutter={[24, 24]} style={{ marginBottom: 48 }}>
        {recentTemplates.map((template, index) => (
          <Col xs={24} md={8} key={index}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                hoverable
                style={cardStyle}
                onClick={() => navigate(`/template/${template.name.toLowerCase().replace(/\s+/g, '-')}`)}
              >
                <Space direction="vertical">
                  <Space>
                    {template.icon}
                    <Text strong style={{ color: darkMode ? '#e0e0e0' : undefined }}>
                      {template.name}
                    </Text>
                  </Space>
                  <Text type={darkMode ? "secondary" : undefined} style={{ fontSize: 12 }}>
                    Изменен: {template.lastEdited}
                  </Text>
                </Space>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      <Divider orientation="left" style={{ color: darkMode ? '#e0e0e0' : undefined }}>
        Отзывы наших пользователей
      </Divider>
      <Row gutter={[24, 24]} style={{ marginBottom: 48 }}>
        {testimonials.map((item, index) => (
          <Col xs={24} md={8} key={index}>
            <Card style={cardStyle}>
              <Space direction="vertical" size="middle">
                <Avatar size="large" style={{ backgroundColor: '#1890ff' }}>
                  {item.avatar}
                </Avatar>
                <Text strong style={{ color: darkMode ? '#e0e0e0' : undefined }}>
                  {item.name}
                </Text>
                <Text type={darkMode ? "secondary" : undefined} italic>
                  {item.role}
                </Text>
                <Text style={{ color: darkMode ? '#e0e0e0' : undefined }}>
                  "{item.text}"
                </Text>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card style={sectionStyle}>
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <Title level={3} style={{ color: darkMode ? '#e0e0e0' : undefined }}>
              Готовы начать?
            </Title>
            <Paragraph style={{ 
              marginBottom: 24,
              color: darkMode ? '#e0e0e0' : undefined 
            }}>
              Создавайте, сотрудничайте и публикуйте техническую документацию профессионального уровня
            </Paragraph>
            <Button 
              type="primary" 
              size="large"
              onClick={() => navigate(token ? '/editor/new' : '/register')}
            >
              {token ? 'Создать документ' : 'Зарегистрироваться'}
            </Button>
          </div>
        </Card>
      </motion.div>

      <Divider />
      <div style={{ textAlign: 'center', marginTop: 48 }}>
        <Text type={darkMode ? "secondary" : undefined}>
          © {new Date().getFullYear()} TechDoc Builder. Все права защищены.
        </Text>
      </div>
    </div>
  );
}