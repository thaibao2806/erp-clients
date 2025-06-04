import { getNumbering } from "../config/config"
import axiosInstance from "./axiosInstance"

const getDocumentNumber = (prefix) => {
    return axiosInstance.get(getNumbering + `${prefix}`)
}

export {
    getDocumentNumber
}