import { createContext, useState } from "react";
import UserService from "../services/UserService";

export const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  const register = async (formData) => {
    try {
      const data = await UserService.register(formData);
      setUser(data);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <ProfileContext.Provider value={{ user, error, register }}>
      {children}
    </ProfileContext.Provider>
  );
};
