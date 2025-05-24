import { createBoard, createCard, deleteBoard, deleteCard, getBoard, getCardInBoard, moveCard } from "../config/config"
import axiosInstance from "./axiosInstance"

const addBoards = (name) => {
    return axiosInstance.post(createBoard, {name})
}

const getAllBoard = () => {
    return axiosInstance.get(getBoard)
}

const deleteBoards = (id) => {
    return axiosInstance.delete(deleteBoard + `${id}`)
}

const addCard = (title, label, deadline, status, boardId) => {
    return axiosInstance.post(createCard, {title, label, deadline, status, boardId})
}

const getCard = (boardId) => {
    return axiosInstance.get(getCardInBoard + `${boardId}`)
}

const deleteCards = (id) => {
    return axiosInstance.delete(deleteCard + `${id}`)
}

const moveCardToBoard = (cardId, newBoardId) => {
    return axiosInstance.put(moveCard + `${cardId}/move/${newBoardId}`)
}

export {
    addBoards,
    getAllBoard,
    deleteBoards,
    addCard,
    getCard,
    deleteCards,
    moveCardToBoard
}