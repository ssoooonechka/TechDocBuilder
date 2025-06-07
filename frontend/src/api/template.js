import { message } from 'antd';

const API_URL = 'http://localhost:8000/api/v1/template';

export const fetchMyTemplates = async (access_token) => {
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
      throw new Error(errorData.message || 'Ошибка загрузки шаблонов');
    }
    
    const data = await response.json();    
    return data;
  } catch (error) {
    message.error(error.message);
    return { 
      templates: [],
    };
  }
};
export const fetchPublicTemplates = async (access_token) => {
  try {
    const response = await fetch(
      `${API_URL}/public?access_token=${access_token}`,
      {
        headers: {
          'accept': 'application/json'
        }
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка загрузки шаблонов');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    message.error(error.message);
    return { 
      templates: [],
    };
  }
};

export const createTemplate = async (access_token, templateData) => {
  try {
    const response = await fetch(`${API_URL}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify({
        access_token: access_token,
        data: templateData
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка создания шаблона');
    }
    
    const data = await response.json();
    message.success('Шаблон успешно создан!');
    return data;
  } catch (error) {
    message.error(error.message);
    return null;
  }
};

export const updateTemplate = async (access_token, updateData) => {
  try {
    const response = await fetch(`${API_URL}/update`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify({
        access_token: access_token,
        ...updateData
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка обновления шаблона');
    }
    
    const data = await response.json();
    message.success('Шаблон успешно обновлен!');
    return data;
  } catch (error) {
    message.error(error.message);
    return null;
  }
};


export const getByName = async (access_token, template_name) => {
  try {
    const response = await fetch(`${API_URL}/owner_template?template_name=${template_name}&access_token=${access_token}`, {
      method: 'GET',
    });
    
    const data = await response.json();
    
    if (!response.ok) throw new Error(data.message || 'Шаблон не найден');
    
    return data;
  } catch (error) {
    message.error(error.message);
    return null;
  }
};


export const getPublicTemplateInfo = async (access_token, template_name) => {
  try {
    const response = await fetch(`${API_URL}/public_template?template_name=${template_name}&access_token=${access_token}`, {
      method: 'GET',
    });
    
    const data = await response.json();
    
    if (!response.ok) throw new Error(data.message || 'Шаблон не найден');
    
    return data;
  } catch (error) {
    message.error(error.message);
    return null;
  }
};