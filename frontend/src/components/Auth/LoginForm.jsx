import React, { useState } from "react";
import { Button, Form, Input, Typography, Space } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { login } from "../../api/auth";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

export default function LoginForm({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await login(values.username, values.password);
      
      if (response && response.access_token) {
        onSuccess(response.access_token);
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Form onFinish={handleSubmit} layout="vertical">
        <Form.Item
          name="username"
          rules={[{ required: true, message: "Введите имя пользователя" }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Имя пользователя" size="large" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: "Введите пароль" }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Пароль"
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
          >
            Войти
          </Button>
        </Form.Item>

        <Space>
          <Text type="secondary">Нет аккаунта?</Text>
          <Button type="link" onClick={() => handleRegisterClick()}>
            Зарегистрироваться
          </Button>
        </Space>
      </Form>
    </motion.div>
  );
}