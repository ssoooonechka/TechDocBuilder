import { useState } from 'react';
import { Modal, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { createRoom } from '../api/room';
import useAuthStore from '../store/authStores';

const CreateRoomModal = ({ visible, onCancel }) => {
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);

  const { token } = useAuthStore();

  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!roomName.trim()) {
      message.warning('Введите название комнаты');
      return;
    }

    try {
      setLoading(true);
      const roomData = {
        name: roomName
      }

      const newRoom = await createRoom(token, roomData);
      navigate(`/workspace/${newRoom.room_uuid}`);
    } catch (error) {
      message.error('Ошибка при создании комнаты');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Создать новую комнату"
      open={visible}
      onOk={handleCreate}
      confirmLoading={loading}
      onCancel={onCancel}
      okText="Создать"
      cancelText="Отмена"
    >
      <Input
        placeholder="Введите название комнаты"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        onPressEnter={handleCreate}
      />
    </Modal>
  );
};

export default CreateRoomModal;