import React from 'react';
import { Tabs, Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import EditorPanel from '../components/Room/RoomEditor/EditorPanel';
import TemplateSelector from '../components/Room/RoomEditor/TemplateSelector';

import useWorkspaceStore from '../store/workspaceStore';

const RoomsMode = () => {
  const { rooms, setActiveRoom, addOpenedRoom } = useWorkspaceStore();
  
  const handleAddRoom = () => {
  };

  return (
    <div className="rooms-mode">
      {rooms.openedRooms.length > 0 ? (
        <>
          <Tabs
            activeKey={rooms.activeRoom}
            onChange={setActiveRoom}
            type="editable-card"
            onEdit={(key, action) => action === 'add' ? handleAddRoom() : removeRoom(key)}
            items={rooms.openedRooms.map(roomId => ({
              key: roomId,
              label: `Комната ${roomId}`,
              children: <RoomEditor roomId={roomId} />
            }))}
          />
        </>
      ) : (
        <div className="empty-state">
          <RoomSelector onSelect={addOpenedRoom} />
        </div>
      )}
    </div>
  );
};

export default RoomsMode;