import { addMaterialEstimate, deleteMaterialEstimate, exportExcelMaterialEstimate, filterMaterialEstimate, getAllMaterialEstimate, getMaterialEstimateByID, updateMaterialEstimate } from "../../config/config"
import axiosInstance from "../axiosInstance"

const getMaterialEstimates = () => {
    return axiosInstance.get(getAllMaterialEstimate)
}

const createMaterialEstimates = (voucherNo, voucherDate, productName, category, estimateRound, note, details) => {
    return axiosInstance.post(addMaterialEstimate, {voucherNo, voucherDate, productName, category, estimateRound, note, details})
}

const getByIDMaterialEstimate = (id) => {
    return axiosInstance.get(getMaterialEstimateByID + `${id}`)
}

const updateJMaterialEstimates = (id, voucherNo, voucherDate, productName, category, estimateRound, note, details) => {
    return axiosInstance.put(updateMaterialEstimate + `${id}`, {voucherNo, voucherDate, productName, category, estimateRound, note, details})
}

const deleteMaterialEstimates = (id) => {
    return axiosInstance.delete(deleteMaterialEstimate + `${id}`)
}

const filterMaterialEstimates = (voucherNo, productName, category, estimateRound, fromDate, toDate, currentUserName, page, pageSize) => {
    return axiosInstance.post(filterMaterialEstimate, {voucherNo, productName, category, estimateRound, fromDate, toDate, currentUserName, page, pageSize})
}

const exportExcelME = (id) => {
    return axiosInstance.get(exportExcelMaterialEstimate + `${id}`, {
        responseType: "blob"
    })
}

export {
    filterMaterialEstimates,
    deleteMaterialEstimates,
    updateJMaterialEstimates,
    createMaterialEstimates,
    getMaterialEstimates,
    getByIDMaterialEstimate,
    exportExcelME
}