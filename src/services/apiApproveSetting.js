import { createApprove, getApproveByMoudle } from "../config/config"
import axiosInstance from "./axiosInstance"

const createApproveSetting = (id, module, page, approvalNumber, createdBy, createdAt, updatedBy, updatedAt) => {
    return axiosInstance.post(createApprove, {id, module, page, approvalNumber, createdBy, createdAt, updatedBy, updatedAt})
}

const getApprovalSetting = (module, page) => {
    return axiosInstance.get(getApproveByMoudle + `${module}/${page}`)
}

export {
    createApproveSetting,
    getApprovalSetting
}