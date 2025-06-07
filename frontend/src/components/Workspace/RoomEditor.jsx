import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Card, Button, Input, Spin, 
  Avatar, Badge, Popover, Menu, Space, Tooltip, 
  List, Typography, Divider, message, theme
} from 'antd';
import { 
  EyeOutlined, CodeOutlined, ColumnWidthOutlined, 
  SaveOutlined, TeamOutlined,
  MoreOutlined, HistoryOutlined, ShareAltOutlined,
  WarningOutlined, UserOutlined, CheckOutlined, DownloadOutlined
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import useAuthStore from '../../store/authStores';
import CodeEditor from './CodeEditor';
import { getRoomInfo, updateRoom, createInviteLink, removeInvitedUser } from '../../api/room';
import { useCollaborativeDoc } from '../../core/collaboration';
import { InviteModal } from '../../modal/link';
import { InvitePermissionsModal } from '../../modal/permissions';
import * as Y from 'yjs';

const { Text } = Typography;

const RoomEditor = ({ isOwnerFromAccessCheck }) => {
  const { token: { colorBgContainer, colorText, colorPrimary } } = theme.useToken();
  const [isOwner, setIsOwner] = useState(isOwnerFromAccessCheck);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const permissions = localStorage.getItem('room_permissions');
  const editorRef = useRef(null);

  const connectionStatusText = {
    connecting: 'Подключение...',
    connected: 'Подключено',
    disconnected: 'Отключено'
  };
  
  const [messageApi, contextHolder] = message.useMessage();
  const { roomId } = useParams();
  const { token, user } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [roomData, setRoomData] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [activeUsers, setActiveUsers] = useState([]);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const titleRef = useRef('');

  const [viewMode, setViewMode] = useState('split');
  const [collaborators, setCollaborators] = useState([]);
  const [inviteInfo, setInviteInfo] = useState(null);


  console.log('Room owner ID:', roomData?.owner_id);
  console.log('Current user ID:', user?.id);
  console.log('Permissions from access check:', isOwnerFromAccessCheck);
  console.log('Calculated isOwner:', isOwner);
  
  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    let isMounted = true;

    const loadRoom = async () => {
      try {
        setLoading(true);
        
        if (isOwner) {
          console.log("Загружаем данные для владельца");
          const data = await getRoomInfo(token, roomId);
          if (!isMounted) return;
          
          if (!data) {
            throw new Error('Комната не найдена');
          }
          
          setRoomData(data);
          setTitle(data.name || '');
          titleRef.current = data.name || '';
          setContent(data.content || '');
          setCollaborators(data.collaborators || []);
        } else {
          console.log("Загружаем данные для приглашенного");
          setRoomData({ room_uuid: roomId });
          setTitle('Совместный документ');
          setContent('');
        }
      } catch (error) {
        if (isMounted) {
          messageApi.error(error.message);
          setRoomData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadRoom();

    return () => {
      isMounted = false;
    };
  }, [roomId, token, messageApi, isOwner]);

  const { ydoc, ytext, provider, isConnected } = useCollaborativeDoc(
    roomId,
    token,
    true
  );

  useEffect(() => {
    if (!ytext || !isConnected) return;

    if (content !== ytext.toString()) {
      setContent(ytext.toString());
    }
  }, [ytext, isConnected]);

  useEffect(() => {
    if (!provider?.awareness) return;
    
    provider.awareness.setLocalStateField('user', {
      name: user?.username || "Anonymous",
      color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
      avatar: user?.avatar,
      isOwner,
      id: user?.id
    });
  }, [provider, isOwner, user]);

  useEffect(() => {
    if (!provider || !ytext) return;

    const observer = () => {
      const newContent = ytext.toString();
      if (content !== newContent) {
        setContent(newContent);
      }
    };

    if (isOwner && content && ytext.toString() === '') {
      ytext.insert(0, content);
    }

    ytext.observe(observer);

    const handleStatusChange = ({ status }) => {
      setConnectionStatus(status);
      if (status === 'connected') {
        messageApi.success('Подключено к совместному редактированию');
      }
    };

        const handleAwarenessChange = () => {
      const states = Array.from(provider.awareness.getStates().values());
      const users = states
        .filter(state => state.user)
        .map(state => ({
          ...state.user,
          color: state.user.color || `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
          isOwner: state.user.id === roomData?.owner_id
        }));
      setActiveUsers(users);
    };

    const handleError = (error) => {
      messageApi.error('Ошибка соединения: ' + error.message);
      setConnectionStatus('disconnected');
    };

    provider.on('status', handleStatusChange);
    provider.on('error', handleError);
    
    if (provider.awareness) {
      provider.awareness.setLocalStateField('user', {
        name: user?.username || "Anonymous",
        color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
        avatar: user?.avatar,
        isOwner,
        id: user?.id
      });
      provider.awareness.on('change', handleAwarenessChange);
      handleAwarenessChange();
    }

    return () => {
      ytext.unobserve(observer);
      provider.off('status', handleStatusChange);
      provider.off('error', handleError);
      if (provider.awareness) {
        provider.awareness.off('change', handleAwarenessChange);
      }
    };
  }, [provider, ytext, content, user, messageApi, isOwner, roomData]);

  const handleContentChange = useCallback((newValue) => {  
    if (permissions === 'read_only') {
      return;
    }

    if (!ytext || !isConnected) return;
    if (!ytext || !isConnected) return;

    setContent(newValue);
    
    Y.transact(ydoc, () => {
      const current = ytext.toString();
      if (current !== newValue) {
        ytext.delete(0, current.length);
        ytext.insert(0, newValue);
      }
    });
  }, [ytext, ydoc, isConnected]);


  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    titleRef.current = newTitle;
  };

  const handleCreateInviteLink = async (permissions) => {
    if (!roomData) return;
    
    try {
      const data = await createInviteLink(
        token, 
        roomData.room_uuid, 
        permissions
      );
      setInviteInfo(data);
    } catch (error) {
      messageApi.error('Ошибка создания ссылки: ' + error.message);
    } finally {
      setShowPermissionsModal(false);
    }
  };

const handleRemoveUser = async (userToRemove) => {
  if (!isOwner) {
    messageApi.error('Только владелец может удалять пользователей');
    return;
  }

  try {
    await removeInvitedUser(token, roomId, userToRemove.name);
    
    setActiveUsers(prevUsers => 
      prevUsers.filter(user => user.name !== userToRemove.name)
    );
    
    setCollaborators(prev => 
      prev.filter(c => c.name !== userToRemove.name)
    );

    messageApi.success('Пользователь успешно удален');
  } catch (error) {
    messageApi.error(error.message || 'Ошибка удаления пользователя');
  }
};

  const handleSave = async () => {
    if (!roomData || !isOwner) return;
    
    try {
      setLoading(true);
      await updateRoom(token, roomData.room_uuid, {
        name: titleRef.current,
        content: content,
      });
      messageApi.success('Изменения сохранены');
    } catch (error) {
      messageApi.error(error.message || 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  const moreActionsMenu = (
    <Menu>
      <Menu.Item 
          key="download" 
          icon={<DownloadOutlined />}
          onClick={handleDownload}
        >
          Скачать как .md
      </Menu.Item>
      {isOwner && (
        <Menu.Item 
          key="invite" 
          icon={<ShareAltOutlined />}
          onClick={() => setShowPermissionsModal(true)}
        >
          Пригласить
        </Menu.Item>
      )}
    </Menu>
  );

  const renderEditorContent = useMemo(() => {
    const editorStyle = {
      height: 'calc(100vh - 180px)',
      overflow: 'hidden',
      backgroundColor: colorBgContainer,
      color: colorText
    };

    const previewStyle = {
      padding: 24,
      height: 'calc(100vh - 180px)',
      overflow: 'auto',
      backgroundColor: colorBgContainer,
      color: colorText
    };

    switch (viewMode) {
      case 'code':
        return (
          <CodeEditor 
          key={viewMode}
          ref={editorRef}
          value={content}
          onChange={handleContentChange}
          language="markdown"
          style={editorStyle}
          readOnly={permissions === 'read_only'}
        />
        );
      case 'preview':
        return (
          <div style={previewStyle}>
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        );
      case 'split':
      default:
        return (
          <div style={{ display: 'flex', height: 'calc(100vh - 180px)' }}>
            <div style={{ ...editorStyle, width: '50%' }}>
            <CodeEditor 
              key={viewMode}
              ref={editorRef}
              value={content}
              onChange={handleContentChange}
              language="markdown"
              style={editorStyle}
              readOnly={permissions === 'read_only'}
            />
            </div>
            <div style={{ ...previewStyle, width: '50%' }}>
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        );
    }
  }, [viewMode, content, handleContentChange, isOwner, colorBgContainer, colorText]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Загрузка комнаты..." />
      </div>
    );
  }

  if (!roomData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Text type="danger">Не удалось загрузить комнату</Text>
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <Card
        title={
          <Input
            value={title}
            onChange={isOwner ? handleTitleChange : undefined}
            placeholder="Название документа"
            style={{ 
              fontSize: 16,
              border: 'none',
              padding: 0,
              width: '100%',
              color: colorText
            }}
            readOnly={!isOwner}
          />
        }
        style={{ 
          height: '100vh',
          border: 'none',
          backgroundColor: colorBgContainer
        }}
        extra={
          <Space size="middle">
            <Popover
              title="Подключенные пользователи"
              content={
                <List
                  size="small"
                  dataSource={activeUsers}
                  rowKey={user => user.name}
                  renderItem={user => (
                    <List.Item
                        actions={
                          isOwner && !user.isOwner ? [
                            <Button 
                              type="link" 
                              danger
                              onClick={() => handleRemoveUser(user)}
                            >
                              Удалить
                            </Button>
                          ] : []
                        }
                      >
                      <Space>
                        <Avatar 
                          src={user.avatar} 
                          size="small"
                          style={{ backgroundColor: user.color }}
                          icon={<UserOutlined />}
                        />
                        <Text>
                          {user.name} 
                          {user.isOwner && (
                            <Text type="secondary" style={{ marginLeft: 8 }}>
                              (Владелец)
                            </Text>
                          )}
                        </Text>
                        {user.name === (user?.username || "Anonymous") && (
                          <CheckOutlined style={{ color: colorPrimary }} />
                        )}
                      </Space>
                    </List.Item>
                  )}
                />
              }
              placement="bottomLeft"
              trigger="click"
            >
              <Badge 
                count={activeUsers.length} 
                size="small"
                color={connectionStatus === 'connected' ? colorPrimary : 'orange'}
              >
                <Button 
                  type="text" 
                  icon={<TeamOutlined />} 
                  style={{ color: connectionStatus === 'connected' ? colorPrimary : 'orange' }}
                />
              </Badge>
            </Popover>

            <Divider type="vertical" />

            <Space size={4}>
              <Button 
                type={viewMode === 'code' ? 'primary' : 'text'}
                icon={<CodeOutlined />}
                onClick={() => setViewMode('code')}
              />
              <Button 
                type={viewMode === 'split' ? 'primary' : 'text'}
                icon={<ColumnWidthOutlined />}
                onClick={() => setViewMode('split')}
              />
              <Button 
                type={viewMode === 'preview' ? 'primary' : 'text'}
                icon={<EyeOutlined />}
                onClick={() => setViewMode('preview')}
              />
            </Space>

            <Divider type="vertical" />

            <Popover 
              content={moreActionsMenu} 
              trigger="click" 
              placement="bottomRight"
            >
              <Button type="text" icon={<MoreOutlined />} />
            </Popover>

            <Tooltip title={connectionStatusText[connectionStatus]}>
              <Button 
                type="text" 
                icon={
                  connectionStatus === 'connected' ? 
                    <CheckOutlined style={{ color: colorPrimary }} /> : 
                    <WarningOutlined style={{ color: 'orange' }} />
                }
              />
            </Tooltip>

            {isOwner && (
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                onClick={handleSave}
                loading={loading}
              >
                Сохранить
              </Button>
            )}
          </Space>
        }
      >
        {renderEditorContent}
        
        {isOwner && (
        <>
          <InvitePermissionsModal
            visible={showPermissionsModal}
            onCancel={() => setShowPermissionsModal(false)}
            onCreate={handleCreateInviteLink}
          />
          
          <InviteModal 
            visible={!!inviteInfo}
            onClose={() => setInviteInfo(null)}
            invite={inviteInfo}
            roomName={title}
          />
        </>
      )}
      </Card>
    </>
  );
};

export default RoomEditor;