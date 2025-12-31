import { addRepairPlan, deleteRepairPlan, filterRepairPlan, getRepairPlan, getRepairPlanByID, updateRepairPlan, url } from "../../config/config"
import axiosInstance from "../axiosInstance"

const createRepairPlan = (voucherNo, productName, voucherDate, managementUnit, note, details) => {
    return axiosInstance.post(addRepairPlan, {voucherNo, productName, voucherDate, managementUnit, note, details})
}

const getByIdRepairPlan = (id) => {
    return axiosInstance.get(getRepairPlanByID + `${id}`)
}

const getAllRepairPlan = () => {
    return axiosInstance.get(getRepairPlan)
}

const updateRepairPlans = (id, voucherNo, productName, voucherDate, managementUnit, note, details) => {
    return axiosInstance.put(updateRepairPlan + `${id}`, {voucherNo, productName, voucherDate, managementUnit, note, details})
}

const deleteRepairPlanByID = (id) => {
    return axiosInstance.delete(deleteRepairPlan + `${id}`)
}

const fillterRepairPlans = (voucherNo, productName, managementUnit, fromDate, toDate,currentUserName, page, pageSize) => {
    return axiosInstance.post(filterRepairPlan, {voucherNo, productName, managementUnit, fromDate, toDate,currentUserName, page, pageSize})
}

export {
    createRepairPlan,
    getByIdRepairPlan,
    getAllRepairPlan,
    updateRepairPlans,
    deleteRepairPlanByID,
    fillterRepairPlans,
}