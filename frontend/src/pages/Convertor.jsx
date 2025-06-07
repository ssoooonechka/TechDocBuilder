import React, { useState } from 'react';
import { 
  Button, 
  Card, 
  Input, 
  Space, 
  Typography, 
  message,
  Tabs,
  Badge,
  Divider
} from 'antd';
import { 
  CodeOutlined, 
  SwapOutlined,
  CopyOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { convertSqlToMarkdown } from '../api/convertor';
import useThemeStore from '../store/themeStore';

const { Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

export const SqlToMarkdownConverter = () => {
  const [sqlInput, setSqlInput] = useState('');
  const [markdownOutput, setMarkdownOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const { darkMode } = useThemeStore();

  const handleConvert = async () => {
    if (!sqlInput.trim()) {
      message.error('Введите SQL код для конвертации');
      return;
    }

    setLoading(true);
    try {
      const result = await convertSqlToMarkdown(sqlInput);
      setMarkdownOutput(result.markdown);
      message.success('Успешно сконвертировано!');
    } catch (error) {
      message.error(error.message);
      setMarkdownOutput('');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    message.success('Скопировано в буфер обмена!');
  };

  const exampleSql = `CREATE TABLE IF NOT EXISTS users
(
    id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    name character varying COLLATE pg_catalog."default" NOT NULL,
    car_id integer NOT NULL,
    phone_number character varying COLLATE pg_catalog."default" NOT NULL,
)`;

  const cardStyle = {
    marginBottom: 24,
    borderRadius: 12,
    padding: '0 24px',
    paddingTop: 24,
    backgroundColor: darkMode ? '#1f1f1f' : '#fff',
    borderColor: darkMode ? '#333' : '#f0f0f0'
  };

  const textAreaStyle = {
    fontFamily: '"Fira Code", monospace',
    backgroundColor: darkMode ? '#141414' : '#fff',
    color: darkMode ? '#e0e0e0' : '#333',
    borderColor: darkMode ? '#333' : '#d9d9d9'
  };

  const exampleBlockStyle = {
    border: `1px solid ${darkMode ? '#333' : '#d9d9d9'}`,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    backgroundColor: darkMode ? '#141414' : '#fafafa'
  };

  const resultBlockStyle = {
    border: `1px solid ${darkMode ? '#333' : '#f0f0f0'}`,
    borderRadius: 8,
    padding: 16,
    backgroundColor: darkMode ? '#141414' : '#fff',
    position: 'relative'
  };

  return (
    <Card 
      title={
        <Space>
          <Badge color="#13c2c2" />
          <Text strong style={{ fontSize: 18, color: darkMode ? '#e0e0e0' : undefined }}>
            SQL to Markdown Converter
          </Text>
        </Space>
      } 
      style={cardStyle}
    >
      <Tabs 
        defaultActiveKey="1"
        tabBarStyle={{
          color: darkMode ? '#e0e0e0' : undefined
        }}
      >
        <TabPane tab={<span style={{ color: darkMode ? '#e0e0e0' : undefined }}>Конвертер</span>} key="1">
          <div style={{ marginBottom: 24 }}>
            <TextArea
              value={sqlInput}
              onChange={(e) => setSqlInput(e.target.value)}
              placeholder="Введите SQL определение таблицы..."
              autoSize={{ minRows: 10, maxRows: 15 }}
              style={textAreaStyle}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <Button 
              type="primary" 
              icon={<SwapOutlined />}
              onClick={handleConvert}
              loading={loading}
              style={{ 
                background: '#13c2c2',
                borderColor: '#13c2c2',
                height: 40,
                width: 200
              }}
            >
              Конвертировать
            </Button>
          </div>

          {markdownOutput && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Divider orientation="left">
                <Text strong style={{ color: darkMode ? '#e0e0e0' : undefined }}>
                  Результат (Markdown таблица)
                </Text>
              </Divider>
              <div style={resultBlockStyle}>
                <Button 
                  icon={<CopyOutlined />}
                  onClick={handleCopy}
                  style={{ 
                    position: 'absolute', 
                    right: 8, 
                    top: 8,
                    color: darkMode ? '#e0e0e0' : undefined
                  }}
                />
                <pre style={{ 
                  margin: 0, 
                  whiteSpace: 'pre-wrap',
                  color: darkMode ? '#e0e0e0' : '#333'
                }}>
                  {markdownOutput}
                </pre>
              </div>
            </motion.div>
          )}
        </TabPane>
        <TabPane tab={<span style={{ color: darkMode ? '#e0e0e0' : undefined }}>Пример</span>} key="2">
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ color: darkMode ? '#e0e0e0' : undefined }}>
              Пример SQL ввода:
            </Text>
          </div>
          <div style={exampleBlockStyle}>
            <pre style={{ 
              margin: 0,
              color: darkMode ? '#e0e0e0' : '#333'
            }}>
              {exampleSql}
            </pre>
          </div>
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ color: darkMode ? '#e0e0e0' : undefined }}>
              Пример Markdown вывода:
            </Text>
          </div>
          <div style={exampleBlockStyle}>
            <pre style={{ 
              margin: 0,
              color: darkMode ? '#e0e0e0' : '#333'
            }}>{`# users


| Поле         | Тип       | Свойства |
|--------------|-----------|----------|
| id           | INTEGER   | NOT NULL |
| name         | CHARACTER | NOT NULL |
| car_id       | INTEGER   | NOT NULL |
| phone_number | CHARACTER | NOT NULL |`}</pre>
          </div>
        </TabPane>
      </Tabs>
    </Card>
  );
};