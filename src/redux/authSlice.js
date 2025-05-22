import {createSlice} from "@reduxjs/toolkit"

const authSlice = createSlice({
    name: "auth",
    initialState: {
        login: {
            currentUser: null,
            isFetching: false,
            error: false,
            msg: null
        },
        register: {
            isFetching: false,
            error: false,
            success: false,
            msg: null
        },
    },
    reducers: {
        loginStart: (state) => {
            state.login.isFetching = true
        },
        loginSuccess: (state, action) => {
            state.login.isFetching = false
            state.login.currentUser = action.payload;
            state.login.error = false
            state.login.msg = null
        },
        loginFailed: (state, action) => {
            state.login.isFetching = false
            state.login.error = true
            state.login.msg = action.payload
        },
        logOut: (state, action) => {
            state.login.currentUser = action.payload;
        },
        registerStart: (state) => {
            state.register.isFetching = true
        },
        registerSuccess: (state) => {
            state.register.isFetching = false
            state.register.success = true;
            state.register.error = false
            state.register.msg = null
        },
        registerFailed: (state, action) => {
            state.register.isFetching = false
            state.register.success = false;
            state.register.error = true
            state.register.msg = action.payload
        },
        updateToken: (state, action) => {
        // Cập nhật token trong Redux store
            state.login.currentUser.data.accessToken = action.payload;
        },
        
    }
}) 

export const {
    loginStart,
    loginSuccess,
    loginFailed,
    registerFailed,
    registerStart,
    registerSuccess,
    logOut,
    updateToken
} = authSlice.actions

export default authSlice.reducer