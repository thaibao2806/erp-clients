import axios from "axios";
import { forgotPassword, url,resetPassword, changePassword, getUserById, updateAccounts, getAllAccount } from "../config/config";
import { getAuthHeader } from "../utils/authHeader";
import axiosInstance from "./axiosInstance";

const checkMailOTP = (email) => {
    return axios.post(url + forgotPassword, {email}, {
      headers: {
        "ngrok-skip-browser-warning": "69420"
      }
    })
}

const resetPasswords = (email, otp, newPassword) => {
    return axios.post(url + resetPassword, {email, otp, newPassword},{
      headers: {
        "ngrok-skip-browser-warning": "69420"
      }
    })
}

const changePasswords = (currentPassword, newPassword, accessToken) => {
    return axios.post(url + changePassword, {currentPassword, newPassword}, getAuthHeader(accessToken),{
      headers: {
        "ngrok-skip-browser-warning": "69420"
      }
    })
}

const getAccount = (id) => {
    return axiosInstance.get(getUserById + `${id}`,{
      headers: {
        "ngrok-skip-browser-warning": "69420"
      }
    })
}

const updateAccount = (apk, userName, fullName, email, phoneNumber, address, dateOfBirth, department) => {
    return axiosInstance.put(updateAccounts, {apk, userName, fullName, email, phoneNumber, address, dateOfBirth, department},{
      headers: {
        "ngrok-skip-browser-warning": "69420"
      }
    })
}

const getAllUser = () => {
    return axiosInstance.get(getAllAccount, {
      headers: {
        "ngrok-skip-browser-warning": "69420"
      }
    })
}

const getAvatar = async (userId) => {
  return await axiosInstance.get(`/api/v1/Auth/${userId}/avatar`, { responseType: "blob" },{
      headers: {
        "ngrok-skip-browser-warning": "69420"
      }
    });
};

const uploadAvatar = async (formData) => {
  return await axiosInstance.post(`/api/v1/Auth/upload-avatar`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      "ngrok-skip-browser-warning": "69420"
    },
  });
};

export {
    checkMailOTP,
    resetPasswords,
    changePasswords,
    getAccount,
    updateAccount,
    getAllUser,
    getAvatar,
    uploadAvatar
}