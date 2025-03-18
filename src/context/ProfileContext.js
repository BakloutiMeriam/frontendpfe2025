import { createContext, useState } from "react";
import UserService from "../services/UserService";

export const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [user] = useState(null);
  const [error, setError] = useState("");

  const register = async (formData) => {
    try {
      const userData = await UserService.register(formData);
      return userData;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  return (
    <ProfileContext.Provider value={{ user, error, register }}>
      {children}
    </ProfileContext.Provider>
  );
};
