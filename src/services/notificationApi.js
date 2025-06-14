import { url } from "../config/config";
import axiosInstance from "./axiosInstance";

export const fetchUnreadNotifications = async (userId) => {
  const res = await axiosInstance.get(url + `/api/notification/unread/${userId}`);
  return res.data;
};

export const markNotificationAsRead = async (id) => {
  return axiosInstance.put(url + `/api/notification/read/${id}`);
};

export const getAllNotification = () => {
  return axiosInstance.get(url + "/api/Notification/user")
}