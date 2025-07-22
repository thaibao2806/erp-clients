import { addEmployee, deleteEmployee, filterEmployee, getAllEmployee, getEmployeeById, updateEmployee } from "../../config/config"
import axiosInstance from "../axiosInstance"

const getAllEmployees = () => {
    return axiosInstance.get(getAllEmployee)
}

const getEmployeeByID = (id) => {
    return axiosInstance.get(getEmployeeById + `${id}`)
}

const createEmployee = (fullName, gender, dateOfBirth, phoneNumber, email, department,position,  rank, identityNumber, issueDate, taxCode, laborType, startDate, endDate, status, address) => {
    return axiosInstance.post(addEmployee, {fullName, gender, dateOfBirth, phoneNumber, email, department,position,rank, identityNumber, issueDate, taxCode, laborType, startDate, endDate, status, address})
}

const updateEmployees = (id, fullName, gender, dateOfBirth, phoneNumber, email, department,position,  rank, identityNumber, issueDate, taxCode, laborType, startDate, endDate, status, address) => {
    return axiosInstance.put(updateEmployee + `${id}`, {fullName, gender, dateOfBirth, phoneNumber, email, department,position,  rank, identityNumber, issueDate, taxCode, laborType, startDate, endDate, status, address})
}

const deleteEmployees = (id) => {
    return axiosInstance.delete(deleteEmployee + `${id}`)
}

const filterEmployees = (fullName, gender, department, identityNumber, laborType, status, currentUserName, page, pageSize) => {
    return axiosInstance.post(filterEmployee, {fullName, gender, department, identityNumber, laborType, status, currentUserName, page, pageSize})
}

export {
    getAllEmployees,
    getEmployeeByID,
    createEmployee,
    updateEmployees,
    deleteEmployees,
    filterEmployees
}