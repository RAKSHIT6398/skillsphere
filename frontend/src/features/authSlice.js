import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

export const login = createAsyncThunk("auth/login", async (data, { rejectWithValue }) => {
  try { return (await api.post("/auth/login", data)).data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || "Login failed"); }
});
export const register = createAsyncThunk("auth/register", async (data, { rejectWithValue }) => {
  try { return (await api.post("/auth/register", data)).data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || "Register failed"); }
});

const stored = JSON.parse(localStorage.getItem("user") || "null");

const authSlice = createSlice({
  name: "auth",
  initialState: { user: stored, token: localStorage.getItem("token"), loading: false, error: null, twoFactorRequired: false },
  reducers: {
    logout: (state) => {
      state.user = null; state.token = null;
      localStorage.removeItem("token"); localStorage.removeItem("user");
    },
    setUser: (state, action) => { state.user = action.payload; localStorage.setItem("user", JSON.stringify(action.payload)); },
    setCredentials: (state, { payload }) => {
      state.user = payload.user; state.token = payload.token;
      localStorage.setItem("token", payload.token);
      localStorage.setItem("user", JSON.stringify(payload.user));
    },
  },
  extraReducers: (b) => {
    const ok = (state, { payload }) => {
      state.loading = false;
      if (payload.twoFactorRequired) { state.twoFactorRequired = true; return; }
      state.user = payload.user; state.token = payload.token; state.twoFactorRequired = false;
      localStorage.setItem("token", payload.token);
      localStorage.setItem("user", JSON.stringify(payload.user));
    };
    const pend = (s) => { s.loading = true; s.error = null; };
    const fail = (s, a) => { s.loading = false; s.error = a.payload; };
    b.addCase(login.pending, pend).addCase(login.fulfilled, ok).addCase(login.rejected, fail)
     .addCase(register.pending, pend).addCase(register.fulfilled, ok).addCase(register.rejected, fail);
  },
});
export const { logout, setUser, setCredentials } = authSlice.actions;
export default authSlice.reducer;