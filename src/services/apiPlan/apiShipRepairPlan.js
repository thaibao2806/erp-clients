import { addshipRepairPlan, deleteshipRepairPlan, filtershipRepairPlan, getshipRepairPlanByID, updateshipRepairPlan } from "../../config/config"
import axiosInstance from "../axiosInstance"

const createShipRepairPlan = (id, voucherNo, shipName, managementUnit, arrivalDate, inspectionDate, dockDate, surveyDate, launchDate, departureDate, handoverDate, note, createdBy, createdAt, updatedBy, updatedAt) => {
    return axiosInstance.post(addshipRepairPlan, {id, voucherNo, shipName, managementUnit, arrivalDate, inspectionDate, dockDate, surveyDate, launchDate, departureDate, handoverDate, note, createdBy, createdAt, updatedBy, updatedAt})
}

const getShipRepairPlanByID = (id) => {
    return axiosInstance.get(getshipRepairPlanByID + `${id}`)
}

const updateShipRepairPlan = (id, voucherNo, shipName, managementUnit, arrivalDate, inspectionDate, dockDate, surveyDate, launchDate, departureDate, handoverDate, note, createdBy, createdAt, updatedBy, updatedAt) => {
    return axiosInstance.put(updateshipRepairPlan + `${id}`, {id, voucherNo, shipName, managementUnit, arrivalDate, inspectionDate, dockDate, surveyDate, launchDate, departureDate, handoverDate, note, createdBy, createdAt, updatedBy, updatedAt})
}

const filterShipRepairPlan = (voucherNo, shipName, fromDate, toDate, currentUserName, page, pageSize) => {
    return axiosInstance.post(filtershipRepairPlan, {voucherNo, shipName, fromDate, toDate,currentUserName, page, pageSize})
}

const deleteShipRepairPlan = (id) => {
    return axiosInstance.delete(deleteshipRepairPlan + `${id}`)
}

export {
    createShipRepairPlan,
    getShipRepairPlanByID,
    updateShipRepairPlan,
    filterShipRepairPlan,
    deleteShipRepairPlan,
}