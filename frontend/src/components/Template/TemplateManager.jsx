import React, { useState, useEffect, useCallback } from 'react';
import { 
  Layout, 
  Tabs, 
  Typography, 
  Space,
  Card,
  Grid,
  message
} from 'antd';
import { 
  PlusOutlined,
  EditOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { TemplateEditor } from './TemplateEditor';
import TemplateOverview from './TemplateOverview';
import { fetchMyTemplates } from '../../api/template';
import useAuthStore from '../../store/authStores';
import useThemeStore from '../../store/themeStore'; // Импортируем хранилище тем

const { Content } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

export default function TemplateManager() {
  const screens = useBreakpoint();
  const [templates, setTemplates] = useState([]);
  const [activeTab, setActiveTab] = useState('create');
  const [loading, setLoading] = useState(false);
  const { token } = useAuthStore();
  const { darkMode } = useThemeStore(); // Получаем текущую тему

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
      key: 'overview',
      label: (
        <Space>
          <EyeOutlined />
          <Text>Обзор шаблонов</Text>
        </Space>
      ),
      children: <TemplateOverview />
    }
  ];

  return (
    <Layout style={{ 
      minHeight: '100vh', 
      background: darkMode ? '#141414' : '#f5f5f5' 
    }}>
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
              boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.05)',
              marginBottom: 24,
              border: 'none',
              backgroundColor: darkMode ? '#1f1f1f' : '#fff'
            }}
            bodyStyle={{
              padding: 0,
              backgroundColor: darkMode ? '#1f1f1f' : '#fff'
            }}
          >
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              tabBarStyle={{ 
                margin: 0,
                padding: screens.md ? '0 24px' : '0 16px',
                background: darkMode ? '#1f1f1f' : '#fff',
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12
              }}
              size="large"
              items={tabItems.map(item => ({
                ...item,
                label: (
                  <span style={{ color: darkMode ? '#e0e0e0' : undefined }}>
                    {item.label}
                  </span>
                )
              }))}
            />
          </Card>
        </motion.div>
      </Content>
    </Layout>
  );
}