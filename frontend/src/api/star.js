const API_URL = 'http://localhost:8000/api/v1/star';

export const starTemplate = async (token, templateName) => {
    try {
        const response = await fetch(`${API_URL}/${templateName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify({ access_token: token })
        });
        return response.status === 200;
    } catch (error) {
        console.error('Error starring template:', error);
        throw error;
    }
};

export const unstarTemplate = async (token, templateName) => {
    try {
        const response = await fetch(`${API_URL}/${templateName}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify({ access_token: token })
        });
        return response.status === 200;
    } catch (error) {
        console.error('Error unstarring template:', error);
        throw error;
    }
};