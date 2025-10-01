
import { addInventoryTransaction, deleteInventoryTransaction, filterInventoryTransaction, getAllInventoryTransaction, getInventoryTransactionByID, getStockOnHand, updateInventoryTransaction } from "../../config/config"
import axiosInstance from "../axiosInstance"

const getImportAnExportWareHouse = () => {
    return axiosInstance.get(getAllInventoryTransaction)
}

const createImportAnExportWareHouse = (id, transactionNo, transactionDate, transactionType, warehouseCode, partner, address, note, details) => {
    return axiosInstance.post(addInventoryTransaction, {id, transactionNo, transactionDate, transactionType, warehouseCode, partner, address, note, details})
}

const getByIDImportAnExportWareHouse = (id) => {
    return axiosInstance.get(getInventoryTransactionByID + `${id}`)
}

const updateImportAnExportWareHouse = (id, transactionNo, transactionDate, transactionType, warehouseCode, partner, address, note, details) => {
    return axiosInstance.put(updateInventoryTransaction + `${id}`, {id, transactionNo, transactionDate, transactionType, warehouseCode, partner, address, note, details})
}

const deleteImportAnExportWareHouse = (id) => {
    return axiosInstance.delete(deleteInventoryTransaction + `${id}`)
}

const filterImportAnExportWareHouse = (transactionNo, transactionType, warehouseCode, fromDate, toDate, currentUserName, page, pageSize) => {
    return axiosInstance.post(filterInventoryTransaction, {transactionNo, transactionType, warehouseCode, fromDate, toDate, currentUserName, page, pageSize})
}

const getStockOnHandReport = (warehouseCode, year, month) => {
    return axiosInstance.get(getStockOnHand, {
        params: {warehouseCode, year, month}
    })
}

export {
    getImportAnExportWareHouse,
    createImportAnExportWareHouse,
    getByIDImportAnExportWareHouse,
    filterImportAnExportWareHouse,
    deleteImportAnExportWareHouse,
    updateImportAnExportWareHouse,
    getStockOnHandReport
}