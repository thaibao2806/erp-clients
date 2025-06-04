import { addPlan, deletePlan, filterPlan, getPlan, getPlanByID, updatePlan } from "../../config/config"
import axiosInstance from "../axiosInstance"

const getAllPlan = () => {
    return axiosInstance.get(getPlan)
}

const createPlan = (department, documentNumber, planContent, documentDate, receiver, note, details) => {
    return axiosInstance.post(addPlan, {department, documentNumber, planContent, documentDate, receiver, note, details})
}

const getPlansByID = (id) => {
    return axiosInstance.get(getPlanByID + `${id}`)
}

const updatePlans = (id,department, documentNumber, planContent, documentDate, receiver, note, details ) => {
    return axiosInstance.put(updatePlan + `${id}`, {department, documentNumber, planContent, documentDate, receiver, note, details})
}

const deletePlans = (id) => {
    return axiosInstance.delete(deletePlan + `${id}`)
}

const filterPlans = (department, documentNumber, planContent, receiver, fromDate, toDate,currentUserName, page, pageSize) => {
    return axiosInstance.post(filterPlan, {department, documentNumber, planContent, receiver, fromDate, toDate,currentUserName, page, pageSize})
}

export {
    getAllPlan,
    createPlan,
    getPlansByID,
    updatePlans,
    deletePlans,
    filterPlans
}