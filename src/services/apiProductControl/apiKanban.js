import { addKBB, addTask, deleteKBB, deleteTaskKB, getAllKB, getTaskID, getTaskKB, updateStatusTask } from "../../config/config"
import axiosInstance from "../axiosInstance"

const getBoard = () => {
    return axiosInstance.get(getAllKB)
}

const createBoard = (dto) => {
    return axiosInstance.post(addKBB, dto)
}

const deleteBoard = (id) => {
    return axiosInstance.delete(deleteKBB + `${id}`)
}

const getTask = () => {
    return axiosInstance.get(getTaskKB)
}

const getTaskByID = (id) => {
    return axiosInstance.get(getTaskID + `${id}`)
}

const deleteTask = (id) => {
    return axiosInstance.delete(deleteTaskKB + `${id}`)
}

const createTask = (dto) => {
    return axiosInstance.post(addTask, dto)
}

const updateStatusKB = (id, status) => {
    return axiosInstance.patch(updateStatusTask + `${id}/status`, { status })
}

export {
    getBoard,
    createBoard,
    deleteBoard,
    getTask,
    getTaskByID,
    deleteTask,
    createTask,
    updateStatusKB
}