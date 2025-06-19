import { addReceiving, deleteReceiving, exportExcelReceiving, filterReceiving, getReceivingByID, updateReceiving } from "../../config/config"
import axiosInstance from "../axiosInstance"

const createReceivingReport = (id, documentNumber, vehicleName, receivingDate, documentDate, companyRepresentative, companyRepresentativePosition, shipRepresentative1, shipRepresentative1Position, shipRepresentative2, shipRepresentative2Position, createdBy, createdAt, updatedBy, updatedAt) => {
    return axiosInstance.post(addReceiving, {id, documentNumber, vehicleName, receivingDate, documentDate, companyRepresentative, companyRepresentativePosition, shipRepresentative1, shipRepresentative1Position, shipRepresentative2, shipRepresentative2Position, createdBy, createdAt, updatedBy, updatedAt})
}

const getReceivingReportByID = (id) => {
    return axiosInstance.get(getReceivingByID + `${id}`)
}

const updateReceivingReport = (id, documentNumber, vehicleName, receivingDate, documentDate, companyRepresentative, companyRepresentativePosition, shipRepresentative1, shipRepresentative1Position, shipRepresentative2, shipRepresentative2Position, createdBy, createdAt, updatedBy, updatedAt) => {
    return axiosInstance.put(updateReceiving + `${id}`, {id, documentNumber, vehicleName, receivingDate, documentDate, companyRepresentative, companyRepresentativePosition, shipRepresentative1, shipRepresentative1Position, shipRepresentative2, shipRepresentative2Position, createdBy, createdAt, updatedBy, updatedAt})
}

const filterReceivingReport = (documentNumber, vehicleName, receivingDate, fromDate, toDate, currentUserName, page, pageSize) => {
    return axiosInstance.post(filterReceiving, {documentNumber, vehicleName, receivingDate, fromDate, toDate,currentUserName, page, pageSize})
}

const deleteReceivingReport = (id) => {
    return axiosInstance.delete(deleteReceiving + `${id}`)
}

const exportExcel = (id) => {
    return axiosInstance.get(exportExcelReceiving + `${id}`, {
        responseType: "blob"
    })
}

export {
    createReceivingReport,
    getReceivingReportByID,
    updateReceivingReport,
    filterReceivingReport,
    deleteReceivingReport,
    exportExcel
}