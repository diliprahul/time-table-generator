// src/api/notificationApi.js
import api from "./index";

export const getNotifications = () => api.request("/notifications/all");
export const addNotification = (notification) =>
  api.request("/notifications/add", { method: "POST", body: JSON.stringify(notification) });
export const deleteNotification = (id) =>
  api.request(`/notifications/${id}`, { method: "DELETE" });
export const deleteAllNotifications = () =>
  api.request("/notifications/all", { method: "DELETE" });
