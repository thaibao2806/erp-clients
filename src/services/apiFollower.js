import { addFollow, getFollow } from "../config/config"
import axiosInstance from "./axiosInstance"

const addFollower = (refId, refType, followers) => {
    return axiosInstance.post(addFollow, {refId, refType, followers})
}

const getFollower = (refId, refType) => {
    return axiosInstance.get(getFollow, {
        params:{refId, refType}
    })
}

export {
    addFollower,
    getFollower
}