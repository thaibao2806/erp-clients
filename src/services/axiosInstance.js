import axios from "axios";
import { url } from "../config/config";
import { store } from "../redux/store";
import { isTokenValid } from "../utils/isTokenValid";
import { logOut } from "../redux/authSlice";


const axiosInstance  = axios.create({
    baseURL: url,
    timeout: 1000000,
})

export const handleLogout = () => {
    store.dispatch(logOut(null)); 
    window.location.href = '/login';
};

axiosInstance.interceptors.request.use((config) => {
    const currentUser = store.getState().auth.login.currentUser;
    const token = currentUser?.data?.token;

    if (!isTokenValid(token)) {
        handleLogout();
        return Promise.reject(new Error('Access token expired'));
    }

    if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers["ngrok-skip-browser-warning"] = "69420";
        return config;
        
},
    (error) => Promise.reject(error))

export default axiosInstance;