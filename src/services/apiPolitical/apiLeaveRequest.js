import { addLeaveRequest, deleteLeaveRequest, filterLeaveRequest, getAllLeaveRequest, getLeaveRequestByID, updateLeaveRequest } from "../../config/config"
import axiosInstance from "../axiosInstance"

const getLeaveRequest = () => {
    return axiosInstance.get(getAllLeaveRequest)
}

const createLeaveRequest = (fullName, department, position, leaveType, userID, startDate, endDate, totalDate, reason, address, emailOrPhone) => {
    return axiosInstance.post(addLeaveRequest, {fullName, department, position, leaveType, userID, startDate, endDate, totalDate, reason, address, emailOrPhone})
}

const getLeaveRequestById = (id) => {
    return axiosInstance.get(getLeaveRequestByID + `${id}`)
}

const updateLeaveRequestByID = (id, fullName, department, position, leaveType, userID, startDate, endDate, totalDate, reason, address, emailOrPhone) => {
    return axiosInstance.put(updateLeaveRequest + `${id}`, {fullName, department, position, leaveType, userID, startDate, endDate, totalDate, reason, address, emailOrPhone})
}

const deleteLeaveRequestByID = (id) => {
    return axiosInstance.delete(deleteLeaveRequest + `${id}`)
}

const filterLeaveRequests = (fullName, department, position, leaveType, userID, startDate,endDate, totalDate,  reason,address,emailOrPhone,currentUserName,page,pageSize) => {
    return axiosInstance.post(filterLeaveRequest, {fullName, department, position, leaveType, userID, startDate,endDate, totalDate,  reason,address,emailOrPhone,currentUserName,page,pageSize})
}

export {
    getLeaveRequest,
    createLeaveRequest,
    getLeaveRequestById,
    updateLeaveRequestByID,
    deleteLeaveRequestByID,
    filterLeaveRequests
}