import { filterNotification, sendAllUser, url } from "../config/config";
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

export const filterNofifications = (userId, keyword, isRead, fromDate, toDate, page, pageSize) => {
  return axiosInstance.get(filterNotification, {
    params: {userId, keyword, isRead, fromDate, toDate, page, pageSize}
  })
}

export const sendAllUserNotification = (title, content, link,userId, toEmail) => {
  return axiosInstance.post(sendAllUser, {title, content, link,userId, toEmail})
}