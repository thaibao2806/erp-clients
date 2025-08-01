import { createAssignment, deleteAssignment, exportExcelAssignment, filterAssignment, getAllAssignment, getAssignById, updateAssignment, url } from "../../config/config"
import axiosInstance from "../axiosInstance"

const addAssignmentSlip = (documentNumber, productName, documentDate, department, managementUnit, note, details) => {
    return axiosInstance.post(createAssignment, {documentNumber, productName, documentDate, department, managementUnit, note, details})
}

const getAssignmentSlipById = (id) => {
    return axiosInstance.get(getAssignById + `${id}`)
}

const getAllAssignmentSlip = () => {
    return axiosInstance.get(getAllAssignment)
}

const updateAssignmentSlip = (id, documentNumber, productName, documentDate,department, managementUnit, note, details) => {
    return axiosInstance.put(updateAssignment + `${id}`, {documentNumber, productName, documentDate,department, managementUnit, note, details})
}

const deleteAssignmetSlip = (id) => {
    return axiosInstance.delete(deleteAssignment + `${id}`)
}

const fillterAssignmentSlip = (documentNumber, productName, department, managementUnit, fromDate, toDate,currentUserName, page, pageSize) => {
    return axiosInstance.post(filterAssignment, {documentNumber, productName, department, managementUnit, fromDate, toDate,currentUserName, page, pageSize})
}

const exportExcel = (id) => {
    return axiosInstance.get(url + exportExcelAssignment + `${id}`, {
        responseType: "blob"
    })
}

export {
    addAssignmentSlip,
    getAssignmentSlipById,
    getAllAssignmentSlip,
    updateAssignmentSlip,
    deleteAssignmetSlip,
    fillterAssignmentSlip,
    exportExcel
}