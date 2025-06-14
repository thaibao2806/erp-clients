import { addWareHouse, deleteWareHouse, filterWareHouse, getWareHouse, getWareHouseByID, updateWareHouse, url } from "../../config/config"
import axiosInstance from "../axiosInstance"

const getAllWareHouse = () => {
    return axiosInstance.get(url + getWareHouse)
}

const addWareHousePC = (division, voucherNo, voucherDate, typeOfSupplies,details) => {
    return axiosInstance.post(url + addWareHouse, {division, voucherNo, voucherDate, typeOfSupplies ,details})
}

const getWareHousePCIByID = (id) => {
    return axiosInstance.get(url  + getWareHouseByID + `${id}`)
}

const updateWareHousePC = (id, division, voucherNo, voucherDate, typeOfSupplies,details) => {
    return axiosInstance.put(url + updateWareHouse + `${id}`, {division, voucherNo, voucherDate, typeOfSupplies,details} )
}

const deleteWareHousePC = (id) => {
    return axiosInstance.delete(url + deleteWareHouse + `${id}`)
}

const filterWareHousePC = (division, voucherNo, voucherDate, typeOfSupplies, fromDate, toDate, currentUserName, page, pageSize) => {
    return axiosInstance.post(url + filterWareHouse, {division, voucherNo, voucherDate, typeOfSupplies, fromDate, toDate, currentUserName, page, pageSize})
}

export {
    getAllWareHouse,
    addWareHousePC,
    getWareHousePCIByID,
    updateWareHousePC,
    deleteWareHousePC,
    filterWareHousePC
}