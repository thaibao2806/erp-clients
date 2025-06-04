import { addTestRunPlan, deleteTestRunPlan, filterTestRunPlan, getTestRunPlan, getTestRunPlanByID, updateTestRunPlan } from "../../config/config"
import axiosInstance from "../axiosInstance"

const getAllTestRunPlan = () => {
    return axiosInstance.get(getTestRunPlan)
}

const createTestRunPlan = (documentNumber, managingDepartment, vehicleName, documentDate, receivingLocation, runLocation, runSchedule, runTime, details) => {
    return axiosInstance.post(addTestRunPlan, {documentNumber, managingDepartment, vehicleName, documentDate, receivingLocation, runLocation, runSchedule, runTime, details})
}

const getTestRunPlans = (id) => {
    return axiosInstance.get(getTestRunPlanByID + `${id}`)
}

const updateTestRunPlans = (id, documentNumber, managingDepartment, vehicleName, documentDate, receivingLocation, runLocation, runSchedule, runTime, details) => {
    return axiosInstance.put(updateTestRunPlan + `${id}`, {documentNumber, managingDepartment, vehicleName, documentDate, receivingLocation, runLocation, runSchedule, runTime, details})
}

const deleteTestRunPlans = (id) => {
    return axiosInstance.delete(deleteTestRunPlan + `${id}`)
}

const filterTestRunPlans = (documentNumber, managingDepartment, vehicleName, receivingLocation, runLocation, runSchedule, fromDate, toDate,currentUserName, page, pageSize) => {
    return axiosInstance.post(filterTestRunPlan, {documentNumber, managingDepartment, vehicleName, receivingLocation, runLocation, runSchedule, fromDate, toDate,currentUserName, page, pageSize})
}

export {
    getAllTestRunPlan,
    createTestRunPlan,
    getTestRunPlans,
    updateTestRunPlans,
    deleteTestRunPlans,
    filterTestRunPlans
}