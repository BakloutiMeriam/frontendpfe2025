import { createSlice } from "@reduxjs/toolkit";

// authSlice.js ou reducer correspondant
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("token") || null,
    photo: localStorage.getItem("photo") || null, // 🔹 Stocke la photo
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
      if (action.payload.photo) {
        state.photo = action.payload.photo;
        localStorage.setItem("photo", action.payload.photo);
      }
    },
    setToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.photo = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("photo"); // 🔹 Supprime aussi la photo
    },
  },
});
export const { setUser, setToken, logout } = authSlice.actions;
export default authSlice.reducer;
