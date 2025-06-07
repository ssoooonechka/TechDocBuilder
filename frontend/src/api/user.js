import { message } from "antd";

const API_URL = "http://localhost:8000/api/v1/user";


export const setOnline = async (access_token) => {
  try {
    const response = await fetch(`${API_URL}/update`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_token: access_token,
        update_data: {
          is_online: true
        }
      }
      ),
    });
    const data = await response.json();
    if (response.ok) return true;
    throw new Error(data.message || "Update failed");
  } catch (error) {
    message.error(error.message);
    return false;
  }
};


export const setOffline = async (access_token) => {
  try {
    const response = await fetch(`${API_URL}/update`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_token: access_token,
        update_data: {
          is_online: false
        }
      }
      ),
    });
    const data = await response.json();
    if (response.ok) return true;
    throw new Error(data.message || "Update failed");
  } catch (error) {
    message.error(error.message);
    return false;
  }
};


export const getUser = async (access_token) => {
  try {
    const response = await fetch(`${API_URL}/profile_info?access_token=${access_token}`, {
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