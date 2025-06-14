import { addAssetRepair, deleteAssetRepair, filterAssetRepair, getAssetRepair, getAssetRepairByID, updateAssetRepair, url } from "../../config/config"
import axiosInstance from "../axiosInstance"

const getAllRepair = () => {
    return axiosInstance.get(url+ getAssetRepair)
}

const createRepair = (voucherNo, voucherDate, assetName, assetType, department, note, details) => {
    return axiosInstance.post(url + addAssetRepair, {voucherNo, voucherDate, assetName, assetType, department, note, details})
}

const getRepairByID = (id) => {
    return axiosInstance.get(url + getAssetRepairByID + `${id}`)
}

const updateRepair = (id, voucherNo, voucherDate, assetName, assetType, department, note, details) => {
    return axiosInstance.put(url + updateAssetRepair + `${id}`, {voucherNo, voucherDate, assetName, assetType, department, note, details})
}

const deleteRepair = (id) => {
    return axiosInstance.delete(url + deleteAssetRepair + `${id}`)
}

const filterRepair = (voucherNo, assetName, assetType, department, fromDate, toDate, currentUserName, page, pageSize) => {
    return axiosInstance.post(url + filterAssetRepair, {voucherNo, assetName, assetType, department, fromDate, toDate, currentUserName, page, pageSize})
}

export {
    getAllRepair,
    createRepair,
    getRepairByID,
    updateRepair,
    deleteRepair,
    filterRepair
}