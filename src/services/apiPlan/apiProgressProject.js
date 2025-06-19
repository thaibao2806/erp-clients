import { addTaskProgress, deleteTaskProgress, filterTaskProgress, getTaskProgress, getTaskProgressByID, updateTaskProgress, url } from "../../config/config"
import axiosInstance from "../axiosInstance"

const getProjectProgress = () => {
    axiosInstance.get(url + getTaskProgress)
}

const createProjectProgress = (taskName, voucherNo, voucherDate, department, status, note, details) => {
    return axiosInstance.post(url + addTaskProgress, {taskName, voucherNo, voucherDate, department, status, note, details} )
}

const getProjectProgressByID = (id) => {
    return axiosInstance.get(url + getTaskProgressByID + `${id}`)
}

const updateProjectProgress = (id,taskName, voucherNo, voucherDate, department, status, note, details ) => {
    return axiosInstance.put(url + updateTaskProgress + `${id}`, {taskName, voucherNo, voucherDate, department, status, note, details})
}

const deleteProjectProgress = (id) => {
    return axiosInstance.delete(url + deleteTaskProgress + `${id}`)
}

const filterProjectProgress = (taskName, voucherNo, department, status, fromDate, toDate,currentUserName,  page, pageSize) => {
    return axiosInstance.post(url + filterTaskProgress , {taskName, voucherNo, department, status, fromDate, toDate,currentUserName,  page, pageSize})
}

export {
    getProjectProgress,
    createProjectProgress,
    getProjectProgressByID,
    updateProjectProgress,
    deleteProjectProgress,
    filterProjectProgress
}