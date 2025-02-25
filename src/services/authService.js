import axios from "axios";

const API_URL = "http://localhost:3000/api/auth";

export const forgotPassword = async (email) => {
  const response = await axios.post(`${API_URL}/forgot-password`, { email });
  return response.data;
};

export const resetPassword = async (email, resetCode, newPassword) => {
  const response = await axios.post(`${API_URL}/reset-password`, {
    email,
    resetCode,
    newPassword,
  });
  return response.data;
};
