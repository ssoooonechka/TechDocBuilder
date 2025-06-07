const API_URL = "http://localhost:8000/api/v1/convertor";


export const convertSqlToMarkdown = async (sql) => {
    try {
      const response = await fetch(`${API_URL}/sql_to_markdown`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Conversion failed');
      }
  
      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Network error');
    }
  };