import { addTimeKeeping, deleteTimeKeeping, filterTimeKeeping, getAllTimeKeeping, getTimeKeepingByID, updateTimeKeeping } from "../../config/config"
import axiosInstance from "../axiosInstance"

const getTimeKeeping = () => {
    return axiosInstance.get(getAllTimeKeeping)
}

const createTimeKeeping = (voucherNo, voucherDate, month, note, details) => {
    return axiosInstance.post(addTimeKeeping, {voucherNo, voucherDate, month, note, details})
}

const getTimeKeepingById = (id) => {
    return axiosInstance.get(getTimeKeepingByID + `${id}`)
}

const updateTimeKeepingByID = (id, voucherNo, voucherDate, month, note, details) => {
    return axiosInstance.put(updateTimeKeeping + `${id}`, {voucherNo, voucherDate, month, note, details})
}

const deleteTimeKeepingByID = (id) => {
    return axiosInstance.delete(deleteTimeKeeping + `${id}`)
}

const filterTimeKeepings = (voucherNo, voucherDate, month, note, fromDate, toDate, currentUserName, page, pageSize) => {
    return axiosInstance.post(filterTimeKeeping, {voucherNo, voucherDate, month, note, fromDate, toDate, currentUserName, page, pageSize})
}

export {
    getTimeKeeping,
    createTimeKeeping,
    getTimeKeepingById,
    updateTimeKeepingByID,
    deleteTimeKeepingByID,
    filterTimeKeepings
}