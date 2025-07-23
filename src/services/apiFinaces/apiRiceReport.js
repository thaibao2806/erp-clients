import { addRiceReport, deleteRiceReport, filterRiceReport, getAllRiceReport, getRiceReportByID, updateRiceReport } from "../../config/config"
import axiosInstance from "../axiosInstance"

const getRiceReport = () => {
    return axiosInstance.get(getAllRiceReport)
}

const createRiceReport = (voucherNo, voucherDate, slKT, slCT, slTC, slKH, totalSL, chefId) => {
    return axiosInstance.post(addRiceReport, {voucherNo, voucherDate, slKT, slCT, slTC, slKH, totalSL, chefId})
}

const getRiceReportById = (id) => {
    return axiosInstance.get(getRiceReportByID + `${id}`)
}

const updateRiceReportByID = (id, voucherNo, voucherDate, slKT, slCT, slTC, slKH, totalSL, chefId) => {
    return axiosInstance.put(updateRiceReport + `${id}`, {voucherNo, voucherDate, slKT, slCT, slTC, slKH, totalSL, chefId})
}

const deleteRiceReportByID = (id) => {
    return axiosInstance.delete(deleteRiceReport + `${id}`)
}

const filterRiceReports = (voucherNo, voucherDate, slKT, slCT, slTC, slKH, totalSL, fromDate,toDate, currentUserName, page,pageSize ) => {
    return axiosInstance.post(filterRiceReport, {voucherNo, voucherDate, slKT, slCT, slTC, slKH, totalSL, fromDate,toDate, currentUserName, page,pageSize})
}

export {
    getRiceReport,
    createRiceReport,
    getRiceReportById,
    updateRiceReportByID,
    deleteRiceReportByID,
    filterRiceReports
}