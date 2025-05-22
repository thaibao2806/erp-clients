export const getAuthHeader = (accessToken) => {
    return {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    };
};