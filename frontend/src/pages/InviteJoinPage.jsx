import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Input, Button, Card, message, Typography , Spin } from 'antd';
import { connectToRoomByInvite } from '../api/room';
import useAuthStore from '../store/authStores';

const {Title } = Typography;


const InviteJoinPage = () => {
  const { inviteToken } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    try {
      setLoading(true);
      const room_uuid = await connectToRoomByInvite(token, inviteToken, password);
      console.log(room_uuid);
      
      
      if (!room_uuid) {
        throw new Error('Неверная ссылка или пароль');
      }

      message.success('Доступ предоставлен!');
      navigate(`/workspace/${room_uuid}`);
    } catch (error) {
      message.error(error.message || 'Ошибка подключения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Card style={{ width: 400 }}>
        <Title level={3}>Подключение к документу</Title>
        <Input.Password 
          placeholder="Введите пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <Button 
          type="primary" 
          block 
          onClick={handleConnect}
          loading={loading}
        >
          Подключиться
        </Button>
      </Card>
    </div>
  );
};

export default InviteJoinPage;
