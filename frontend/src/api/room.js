import { message } from 'antd';

const API_URL = 'http://localhost:8000/api/v1/room';

export const createRoom = async (access_token, roomData) => {
  try {
    const response = await fetch(`${API_URL}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify({
        access_token: access_token,
        data: roomData
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка создания комнаты');
    }
    
    const data = await response.json();
    message.success('Комната успешно создана!');
    return data;
  } catch (error) {
    message.error(error.message);
    return null;
  }
};

export const updateRoom = async (access_token, room_uuid, updateData) => {
  try {
    const response = await fetch(`${API_URL}/update`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify({
        room_uuid: room_uuid,
        access_token: access_token,
        update_data: updateData
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка обновления комнаты');
    }
    
    const data = await response.json();
    message.success('Комната успешно обновлена!');
    return data;
  } catch (error) {
    message.error(error.message);
    return null;
  }
};

export const getRoomInfo = async (access_token, room_uuid) => {
  try {
    const response = await fetch(`${API_URL}/info/${room_uuid}?access_token=${access_token}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка получения информации о комнате');
    }
    
    return await response.json();
  } catch (error) {
    message.error(error.message);
    return null;
  }
};

export const fetchUserRooms = async (access_token) => {
  try {
    const response = await fetch(
      `${API_URL}/my?access_token=${access_token}`,
      {
        headers: {
          'accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка загрузки комнат');
    }
    
    const data = await response.json();    
    return data;
  } catch (error) {
    message.error(error.message);
    return { 
      rooms: []
    };
  }
};

export const createInviteLink = async (access_token, room_uuid, permissions) => {
  try {
    const response = await fetch(`${API_URL}/invite_link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify({
        access_token: access_token,
        room_uuid: room_uuid,
        permissions: permissions
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка создания ссылки-приглашения');
    }
    
    const data = await response.json();
    message.success('Ссылка-приглашение создана!');
    return data;
  } catch (error) {
    message.error(error.message);
    return null;
  }
};

export const connectToRoom = async (access_token, invite_link, room_password) => {
  try {
    const response = await fetch(`${API_URL}/connect/${invite_link}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify({
        access_token: access_token,
        room_password: room_password
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка подключения к комнате');
    }
    
    const data = await response.json();
    message.success('Успешное подключение к комнате!');
    return data;
  } catch (error) {
    message.error(error.message);
    return null;
  }
};



export const connectToRoomByInvite = async (token, inviteLink, roomPassword) => {
  const response = await fetch(`${API_URL}/connect/${inviteLink}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      access_token: token,
      room_password: roomPassword,
    }),
  });

  if (!response.ok) {
    throw new Error('Ошибка подключения');
  }
  
  const data = await response.json();
  localStorage.setItem('room_permissions', data.permissions);
  return data.room_uuid;
};


export const checkRoomAccess = async (token, roomId) => {
  try {
    const response = await fetch(`${API_URL}/access`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify({
        access_token: token,
        room_uuid: roomId
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка создания комнаты');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    message.error(error.message);
    return null;
  }
};


export const removeInvitedUser = async (access_token, room_uuid, username) => {
  try {
    const response = await fetch(`${API_URL}/invited`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify({
        access_token,
        room_uuid,
        username
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка удаления пользователя');
    }
    
    return await response.json();
  } catch (error) {
    message.error(error.message);
    return null;
  }
};