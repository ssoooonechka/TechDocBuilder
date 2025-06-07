import { message } from "antd";

const API_URL = "http://localhost:8000/api/v1/auth";

export const login = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (response.ok) return data;
    throw new Error(data.message || "Login failed");
  } catch (error) {
    message.error(error.message);
    return null;
  }
};

export const register = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (response.ok) return data;
    throw new Error(data.message || "Registration failed");
  } catch (error) {
    message.error(error.message);
    return null;
  }
};
