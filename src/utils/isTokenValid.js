import {jwtDecode} from 'jwt-decode';

export const isTokenValid = (token) => {
    if (!token) return false;

    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000; // JWT exp là giây
        return decoded.exp > currentTime;
    } catch (error) {
        console.error("Token decode error:", error);
        return false;
    }
};
