import { addEquipmentInventory, deleteEquipmentInventory, filterEquipmentInventory, getEquipmentInventory, getEquipmentInventoryById, updateEquipmentInventoryId, url } from "../../config/config"
import axiosInstance from "../axiosInstance"

const getAllEquipmentInventory = () => {
    return axiosInstance.get(url + getEquipmentInventory)
}

const createEquipmentInventory = (divisionID, voucherNo, voucherDate, department, details) => {
    return axiosInstance.post(url + addEquipmentInventory, {divisionID, voucherNo, voucherDate, department, details})
}

const getEquipmentInventoryByID = (id) => {
    return axiosInstance.get(url + getEquipmentInventoryById + `${id}`)
} 

const updateEquipmentInventory = (id, divisionID, voucherNo, voucherDate, department, details) => {
    return axiosInstance.put(url + updateEquipmentInventoryId + `${id}`, {divisionID, voucherNo, voucherDate, department, details})
}

const deleteEquipmentInventoryID = (id) => {
    return axiosInstance.delete(url + deleteEquipmentInventory + `${id}`)
}

const filterEquipmentInventories = (divisionID, voucherNo,  department, fromDate, toDate, currentUserName, page, pageSize) => {
    return axiosInstance.post(url + filterEquipmentInventory, {divisionID, voucherNo,  department, fromDate, toDate, currentUserName, page, pageSize})
}

export {
    getAllEquipmentInventory,
    deleteEquipmentInventoryID,
    updateEquipmentInventory,
    getEquipmentInventoryByID,
    createEquipmentInventory,
    filterEquipmentInventories
}