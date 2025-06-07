import { Modal, Input, Tag, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

export const InviteModal = ({ visible, onClose, invite, roomName }) => (
  <Modal
    open={visible}
    onCancel={onClose}
    footer={null}
    title={`Приглашение в комнату: ${roomName}`}
  >
    {invite ? (
      <div>
        <p><strong>Ссылка:</strong></p>
        <Input 
          value={`${window.location.origin}/invite/${invite.invite_link}`} 
          addonAfter={<CopyOutlined onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/invite/${invite.invite_link}`);
            message.success('Скопировано!');
          }} />} 
          readOnly 
        />
        <p style={{ marginTop: 16 }}>
          <strong>Пароль:</strong> <code>{invite.room_password}</code>
        </p>
        <p style={{ marginTop: 16 }}>
          <strong>Права доступа:</strong>
          <Tag color={invite.permissions === 'read_write' ? 'green' : 'blue'}>
            {invite.permissions === 'read_write' 
              ? 'Редактирование' 
              : 'Только просмотр'}
          </Tag>
        </p>
      </div>
    ) : (
      <p>Не удалось сгенерировать ссылку</p>
    )}
  </Modal>
);
