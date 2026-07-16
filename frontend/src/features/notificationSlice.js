import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    unread: 0,
  },
  reducers: {
    setNotifications: (state, action) => {
      state.items = action.payload;
      state.unread = action.payload.filter((n) => !n.isRead).length;
    },
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      state.unread += 1;
    },
    markAllRead: (state) => {
      state.items = state.items.map((n) => ({ ...n, isRead: true }));
      state.unread = 0;
    },
  },
});

export const { setNotifications, addNotification, markAllRead } = notificationSlice.actions;
export default notificationSlice.reducer;