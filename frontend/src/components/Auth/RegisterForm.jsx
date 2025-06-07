import React, { useState } from "react";
import { Button, Form, Input, Typography, Space, message } from "antd";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { register } from "../../api/auth";
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

export default function RegisterForm({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await register({
        username: values.username,
        mail: values.email,
        password: values.password
      });
      
      if (response?.access_token) {
        message.success("Регистрация успешна!");
        onSuccess(response.access_token);
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  // Регулярное выражение для валидации email
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item
          name="username"
          rules={[{ 
            required: true, 
            message: "Введите имя пользователя" 
          }]}
        >
          <Input 
            prefix={<UserOutlined />} 
            placeholder="Имя пользователя" 
            size="large" 
          />
        </Form.Item>

        {/* Добавленное поле для email */}
        <Form.Item
          name="email"
          rules={[
            { 
              required: true, 
              message: "Введите адрес электронной почты" 
            },
            { 
              pattern: emailRegex,
              message: "Введите корректный email адрес"
            }
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="Email"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: "Введите пароль" },
            { min: 6, message: "Пароль должен быть не менее 6 символов" },
            {
              pattern: /^(?=.*[a-zA-Z])(?=.*\d)./,
              message: "Пароль должен содержать буквы и цифры"
            }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Пароль"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: "Подтвердите пароль" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Пароли не совпадают'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Подтвердите пароль"
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
            Зарегистрироваться
          </Button>
        </Form.Item>

        <Space>
          <Text type="secondary">Уже есть аккаунт?</Text>
          <Button type="link" onClick={() => onSuccess("login")}>
            Войти
          </Button>
        </Space>
      </Form>
    </motion.div>
  );
}