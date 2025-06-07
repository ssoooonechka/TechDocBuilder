import React, { useEffect, useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { Spin, message } from 'antd';
import useAuthStore from '../../store/authStores';
import { checkRoomAccess } from '../../api/room';
import CreateRoomModal from '../../modal/createRoom';


const RoomAccessCheck = ({ children, isNew = false }) => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuthStore();
  const [accessState, setAccessState] = useState({
    loading: true,
    hasAccess: false,
    isOwner: false
  });
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setAccessState({
        loading: false,
        hasAccess: false,
        isOwner: false
      });
      return;
    }

    if (isNew) {
      setShowCreateModal(true);
      setAccessState({
        loading: false,
        hasAccess: false,
        isOwner: true
      });
      return;
    }

    const verifyAccess = async () => {
      try {
        const response = await checkRoomAccess(token, roomId);
        
        setAccessState({
          loading: false,
          hasAccess: true,
          isOwner: response.permissions === 'owner'
        });
      } catch (error) {
        console.error('Access check error:', error);
        setAccessState({
          loading: false,
          hasAccess: false,
          isOwner: false
        });
      }
    };

    verifyAccess();
  }, [roomId, token, isNew, isAuthenticated]);

  const handleCreateCancel = () => {
    setShowCreateModal(false);
    navigate('/workspace');
  };

  if (accessState.loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Проверка доступа..." />
      </div>
    );
  }

  if (!accessState.hasAccess && !showCreateModal) {
    message.warning('У вас нет доступа к этой комнате');
    return <Navigate to="/workspace" replace />;
  }

  return (
    <>
      {showCreateModal && (
        <CreateRoomModal 
          visible={showCreateModal}
          onCancel={handleCreateCancel}
        />
      )}
      {!showCreateModal && React.cloneElement(children, { 
        isOwnerFromAccessCheck: accessState.isOwner 
      })}
    </>
  );
};

export default RoomAccessCheck;