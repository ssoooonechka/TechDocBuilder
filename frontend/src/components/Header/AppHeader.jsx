import React from 'react';
import { 
  Layout, 
  Menu, 
  Button, 
  Typography, 
  Space, 
  Avatar, 
  Dropdown, 
  Switch,
  Divider,
  theme
} from 'antd';
import { 
  RocketOutlined, 
  EditOutlined, 
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/authStores';
import useThemeStore from '../../store/themeStore';
const { Header } = Layout;
const { Text, Title } = Typography;
const { useToken } = theme;

const AppHeader = () => {
  const { token } = useToken();
  const navigate = useNavigate();
  const { token: authToken, user, logout } = useAuthStore();
  const { darkMode, toggleTheme } = useThemeStore();

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Профиль',
      onClick: () => navigate('/profile')
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Выйти',
      danger: true,
      onClick: () => {
        logout();
        navigate('/');
      }
    }
  ];

  const navItems = [
    {
      key: 'editor',
      label: (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          Редактор
        </motion.div>
      ),
      onClick: () => navigate('/workspace')
    },
    {
      key: 'templates',
      label: (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          Шаблоны
        </motion.div>
      ),
      onClick: () => navigate('/templates')
    },
    {
      key: 'sql-converter',
      label: (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          SQL Конвертер
        </motion.div>
      ),
      onClick: () => navigate('/convertor')
    }
  ];

  return (
    <Header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      width: '100%',
      padding: '0 24px',
      background: token.colorBgContainer,
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 64,
      borderBottom: `1px solid ${token.colorBorderSecondary}`
    }}>
      <Space size="large">
      <motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  onClick={() => navigate('/')}
  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
>
  <Space size="small">
    <div style={{
      width: 40,
      height: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorPrimaryBgHover} 100%)`
    }}>
      <ThunderboltOutlined style={{
        fontSize: 24,
        color: token.colorPrimary
      }} />
    </div>
    <Title level={4} style={{
      margin: 0,
      fontWeight: 600,
      backgroundImage: `linear-gradient(90deg, ${token.colorPrimary} 0%, #722ed1 100%)`,
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      color: 'transparent',
      lineHeight: '1.2'
    }}>
      TechDoc Builder
    </Title>
  </Space>
</motion.div>

        <Menu
          mode="horizontal"
          style={{ 
            borderBottom: 'none',
            background: 'transparent',
            fontWeight: 500
          }}
          items={navItems}
        />
      </Space>

      <Space size="middle">
        {authToken ? (
          <>
            <Switch
              checked={darkMode}
              onChange={toggleTheme}
              checkedChildren="🌙"
              unCheckedChildren="☀️"
            />

            <Dropdown 
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow={{ pointAtCenter: true }}
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Space style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: 8 }} className="hover-effect">
                  <Avatar 
                    size="default" 
                    icon={<UserOutlined />} 
                    src={user?.avatar}
                    style={{ 
                      backgroundColor: token.colorPrimary,
                      color: '#fff'
                    }}
                  />
                  <Text strong style={{ color: token.colorText }}>
                    {user?.username || 'Пользователь'}
                  </Text>
                </Space>
              </motion.div>
            </Dropdown>
          </>
        ) : (
          <>
            <Button 
              type="text" 
              onClick={() => navigate('/login')}
              style={{ fontWeight: 500 }}
            >
              Войти
            </Button>
            <Divider type="vertical" style={{ height: 24, margin: '0 8px' }} />
            <Button 
              type="primary" 
              onClick={() => navigate('/register')}
              icon={<EditOutlined />}
              style={{ 
                fontWeight: 500,
                background: `linear-gradient(90deg, ${token.colorPrimary} 0%, #722ed1 100%)`,
                border: 'none'
              }}
            >
              Начать бесплатно
            </Button>
          </>
        )}
      </Space>

      <style jsx global>{`
        .hover-effect:hover {
          background: ${token.colorFillTertiary} !important;
          transition: all 0.2s ease;
        }
        .ant-menu-item {
          border-radius: 8px !important;
          margin: 0 4px !important;
        }
        .ant-menu-item:hover {
          background: ${token.colorFillTertiary} !important;
        }
      `}</style>
    </Header>
  );
};

export default AppHeader;