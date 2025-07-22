import { addJobRequirement, deleteJobRequirement, exportExcelJobRequirement, filterJobRequirement, getAllJobRequirement, getJobRequirementByID, updateJobRequirement } from "../../config/config"
import axiosInstance from "../axiosInstance"

const getJobRequirements = () => {
    return axiosInstance.get(getAllJobRequirement)
}

const createJobRequirements = (voucherNo, voucherDate, productName, repairOrderCode, department, managementUnit, details) => {
    return axiosInstance.post(addJobRequirement, {voucherNo, voucherDate, productName, repairOrderCode, department, managementUnit, details})
}

const getByIDJobRequirement = (id) => {
    return axiosInstance.get(getJobRequirementByID + `${id}`)
}

const updateJobRequirements = (id, voucherNo, voucherDate, productName, repairOrderCode, department, managementUnit, details) => {
    return axiosInstance.put(updateJobRequirement + `${id}`, {voucherNo, voucherDate, productName, repairOrderCode, department, managementUnit, details})
}

const deleteJobRequirements = (id) => {
    return axiosInstance.delete(deleteJobRequirement + `${id}`)
}

const filterJobRequirements = (voucherNo, productName, repairOrderCode, department, managementUnit, fromDate, toDate, currentUserName, page, pageSize) => {
    return axiosInstance.post(filterJobRequirement, {voucherNo, productName, repairOrderCode, department, managementUnit, fromDate, toDate, currentUserName, page, pageSize})
}

const exportExcelJR = (id) => {
    return axiosInstance.get(exportExcelJobRequirement + `${id}`, {
        responseType: "blob"
    })
}

export {
    filterJobRequirements,
    deleteJobRequirements,
    updateJobRequirements,
    createJobRequirements,
    getJobRequirements,
    getByIDJobRequirement,
    exportExcelJR
}