import axios from "axios";
 //import {  toast } from "react-toastify";

import { logOut, loginFailed, loginStart, loginSuccess, registerFailed, registerStart, registerSuccess} from "./authSlice";
import {  login, url } from "../config/config";

export const loginUser  = async(user, dispatch, navigate) => {
    dispatch(loginStart())
    try {
    const res = await axios.post( url + login, user, {
        headers: {"ngrok-skip-browser-warning": "69420"}
    });
    console.log(res)
    // navigate("/admin/dashboard");
    if(res && res.status === 200) {
        if (res.data.status === "LOGIN_FAILED") {
        dispatch(loginFailed("Account does not exist"));
        return "Account does not exist";
      } else if (res.data.status === "Password not match") {
        dispatch(loginFailed("Incorrect password"));
        return "Incorrect password";
        } else {
            dispatch(loginSuccess(res.data));
            //toast.success("Login success")
            if(res.data.data.department === "DDSX")
            {
                navigate("/pm/cong-viec");
            }else if (res.data.data.department === "KHKD"){
                navigate("/pl/task");
            }else if (res.data.data.department === "KTVTCN"){
                navigate("/tm/task");
            }else if (res.data.data.department === "TC"){
                navigate("/fn/task");
            }else if (res.data.data.department === "CTHC"){
                navigate("/pt/task");
            } else {
                navigate("/calendar");
            }
            return null
        }
    }
    return null; // Trả về null khi không có lỗi
} catch (error) {
    dispatch(loginFailed(error.message));
    return error.response.data; // Trả về thông báo lỗi khi có lỗi
}
}

// export const loginAdmin  = async(user, dispatch, navigate) => {
//     dispatch(loginStart())
//     try {
//     const res = await axios.post( url + loginAdmins, user);
//     console.log(res)
//     // navigate("/admin/dashboard");
//     if(res && res.status === 200) {
//         if (res.data.msgCode === "LOGIN_FAILED") {
//         dispatch(loginFailed("Account does not exist"));
//         return "Account does not exist";
//       } else if (res.data.msgCode === "Password not match") {
//         dispatch(loginFailed("Incorrect password"));
//         return "Incorrect password";
//         } else {
//             dispatch(loginSuccess(res.data));
//             toast.success("Login success")
//             navigate("/system/admin/");
//             return null
//         }
//     }
//     return null; // Trả về null khi không có lỗi
// } catch (error) {
//     dispatch(loginFailed(error.response.data?.message));
//     return error.response.data.message; // Trả về thông báo lỗi khi có lỗi
// }
// }

// export const registerUser  = async(user, dispatch, navigate) => {
//     dispatch(registerStart())
//     try {
//     let res = await axios.post(url + registerOTP, user);
//     if(res && res.status === 200) {
//         if(res.data.msgCode === "REGISTER_FAILED" && res.data.msgDesc === "Email was exist") {
//             dispatch(registerFailed("Email already exists"))
//             return "Email already exists"
//         } else {
//             dispatch(registerSuccess());
//             toast.success("Register success")
//             navigate("/verify-account");
//             return null;
//         }
//     }
//     return null // Trả về null khi không có lỗi
// } catch (error) {
//     dispatch(registerFailed(error.response.data.message));
//     return error.response.data.message; // Trả về thông báo lỗi khi có lỗi
// }
// }

// export const createUser  = async(user, dispatch) => {
//     dispatch(registerStart())
//     try {
//     let res = await axios.post(url + createUsers, user);
//     if(res && res.status === 200) {
//         if(res.data.msgCode === "REGISTER_FAILED" && res.data.msgDesc === "Email was exist") {
//             dispatch(registerFailed("Email already exists"))
//             return "Email already exists"
//         } else {
//             dispatch(registerSuccess());
//             toast.success("Create success")
//             return null;
//         }
//     }
//     return null // Trả về null khi không có lỗi
// } catch (error) {
//     dispatch(registerFailed(error.response.data.message));
//     return error.response.data.message; // Trả về thông báo lỗi khi có lỗi
// }
// }

// export const logOutAdmin = (dispatch, navigate) => {
//     dispatch(logOut(null))
//     toast.success("Logout success")
//     navigate("/system/admin/login")
// }

export const logOutUser = (dispatch, navigate) => {
    dispatch(logOut(null))
    //toast.success("Logout success")
    navigate("/login")
}