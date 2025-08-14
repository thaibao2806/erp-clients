import { addNote, deleteNote, getNote } from "../config/config"
import axiosInstance from "./axiosInstance"

const getNotes = (refId, refType) => {
    return axiosInstance.get(getNote + `?refId=${refId}&refType=${refType}`)
}

const addNotes = (id, refId, refType, content, createdBy,CreatedName, createdAt, updatedBy, updatedAt, voucherNo) => {
    return axiosInstance.post(addNote, {id, refId, refType, content, createdBy,CreatedName, createdAt, updatedBy, updatedAt}, {
        params:{voucherNo} 
    })
}

const deleteNotes = (id) => {
    return axiosInstance.delete(deleteNote + `${id}`)
}

export {
    getNotes,
    addNotes,
    deleteNotes
}