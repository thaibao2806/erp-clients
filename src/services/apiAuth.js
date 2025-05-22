import axios from "axios";
import { forgotPassword, url,resetPassword, changePassword, getUserById, updateAccounts } from "../config/config";
import { getAuthHeader } from "../utils/authHeader";
import axiosInstance from "./axiosInstance";

const checkMailOTP = (email) => {
    return axios.post(url + forgotPassword, {email})
}

const resetPasswords = (email, otp, newPassword) => {
    return axios.post(url + resetPassword, {email, otp, newPassword})
}

const changePasswords = (currentPassword, newPassword, accessToken) => {
    return axios.post(url + changePassword, {currentPassword, newPassword}, getAuthHeader(accessToken))
}

const getAccount = (id) => {
    return axiosInstance.get(getUserById + `${id}`)
}

const updateAccount = (apk, userName, fullName, email, phoneNumber, address, dateOfBirth, department) => {
    return axiosInstance.put(updateAccounts, {apk, userName, fullName, email, phoneNumber, address, dateOfBirth, department})
}

export {
    checkMailOTP,
    resetPasswords,
    changePasswords,
    getAccount,
    updateAccount
}