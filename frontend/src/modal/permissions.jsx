import { Modal, Radio, message } from 'antd';
import { useState } from 'react'

export const InvitePermissionsModal = ({ visible, onCancel, onCreate }) => {
  const [permissions, setPermissions] = useState('read_write');

  const handleCreate = () => {
    if (!permissions) {
      message.error('Выберите права доступа');
      return;
    }
    onCreate(permissions);
  };

  return (
    <Modal
      open={visible}
      title="Выберите права доступа"
      onOk={handleCreate}
      onCancel={onCancel}
      okText="Создать ссылку"
      cancelText="Отмена"
    >
      <Radio.Group 
        onChange={(e) => setPermissions(e.target.value)}
        value={permissions}
      >
        <Radio value="read_write">Редактирование</Radio>
        <Radio value="read_only">Только просмотр</Radio>
      </Radio.Group>
    </Modal>
  );
};