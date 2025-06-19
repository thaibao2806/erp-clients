import { addPurchaseProposal, deletePurcharProposal, filterPurcharProposal, getPurchaseProposal, getPurchaseProposalByID, updatePurcharProposal, url } from "../../config/config"
import axiosInstance from "../axiosInstance"

const getBuySupplies = () => {
    return axiosInstance.get(url + getPurchaseProposal)
}

const createBuySupplies = (voucherNo,voucherDate, proposalName,proposalType,divionID, note,details) => {
    return axiosInstance.post(url + addPurchaseProposal, {voucherNo,voucherDate, proposalName,proposalType,divionID, note,details})
}

const getBuySuppliesByID = (id) => {
    return axiosInstance.get(url + getPurchaseProposalByID + `${id}`)
}

const updateBuySupplies = (id, voucherNo,voucherDate, proposalName,proposalType,divionID, note,details) => {
    return axiosInstance.put(url + updatePurcharProposal + `${id}`, {voucherNo,voucherDate, proposalName,proposalType,divionID, note,details})
}

const deleteBuySupplies = (id) => {
    return axiosInstance.delete(url + deletePurcharProposal + `${id}`)
}

const filterBuySupplies = (voucherNo, proposalName, proposalType, divionID, fromDate, toDate, currentUserName, page, pageSize) => {
    return axiosInstance.post(url + filterPurcharProposal, {voucherNo, proposalName, proposalType, divionID, fromDate, toDate, currentUserName, page, pageSize})
}

export {
    getBuySupplies,
    createBuySupplies,
    getBuySuppliesByID,
    updateBuySupplies,
    deleteBuySupplies,
    filterBuySupplies
}