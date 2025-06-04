import { addApproval, filterApproval, getApprovalByRef, getApprovalByUser, updateStatusApproval } from "../config/config"
import axiosInstance from "./axiosInstance"

const createApprovals = (refId, refType, approvers, voucherNo, linkDetail) => {
    return axiosInstance.post(addApproval, {refId, refType, approvers, voucherNo, linkDetail})
}

const getApprovalsByUserName = (userName) => {
    return axiosInstance.get(getApprovalByUser, {
        params:{userName}
    })
}

const updateStatusApprovals = (id, status, note) => {
    return axiosInstance.put(updateStatusApproval, {id, status, note})
}

const getApprovalsByRef = (refId, refType) => {
    return axiosInstance.get(getApprovalByRef, {
        params: {refId, refType}
    })
}

const filterApprovals = (refType, userName, voucherNo, status, page, pageSize) => {
    return axiosInstance.post(filterApproval, {refType, userName, voucherNo, status, page, pageSize})
}

export {
    createApprovals,
    getApprovalsByUserName,
    updateStatusApprovals,
    getApprovalsByRef,
    filterApprovals
}