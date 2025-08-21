import React, { useState, useEffect } from "react";
import { Button, Input, Checkbox, message, Select, notification } from "antd";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next"; // Import hook useTranslation
import loginBg from "../../../assets/images/login/login.jpg";
import Bg from "../../../assets/images/login/bg.jpg";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { changePasswords } from "../../../services/apiAuth";

const ChangePassword = () => {
  const { t, i18n } = useTranslation(); // Hàm `t` để lấy giá trị dịch, `i18n` để thay đổi ngôn ngữ
  const [rememberMe, setRememberMe] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currnetPassword, setCurrnetPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({
    currnetPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.login?.currentUser);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsMobile(true); // Nếu màn hình nhỏ hơn hoặc bằng 768px
      } else {
        setIsMobile(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Gọi hàm ngay lập tức để xác định kích thước ban đầu

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Hàm để kiểm tra mật khẩu
  const validatePassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return regex.test(password);
  };

  // Hàm xử lý submit
  const handleSubmit = async () => {
    setErrors({ currnetPassword: "", newPassword: "" });

    if (!currnetPassword) {
      setErrors((prev) => ({
        ...prev,
        currnetPassword: t("validation.passwordRequired"),
      }));
      return;
    } else if (!validatePassword(currnetPassword)) {
      setErrors((prev) => ({
        ...prev,
        currnetPassword: t("validation.passwordStrength"),
      }));
      return;
    }

    if (!newPassword) {
      setErrors((prev) => ({
        ...prev,
        newPassword: t("validation.passwordRequired"),
      }));
      return;
    } else if (!validatePassword(newPassword)) {
      setErrors((prev) => ({
        ...prev,
        newPassword: t("validation.passwordStrength"),
      }));
      return;
    }

    setLoading(true);
    console.log(user);
    try {
      let res = await changePasswords(
        currnetPassword,
        newPassword,
        user.data.token
      );
      if (res && res.status === 200) {
        setLoading(false);
        notification.success({
          message: "Thành công",
          description: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại",
          placement: "topRight",
        });
        navigate("/login");
      }
    } catch (error) {
      if (error.status) {
        setLoading(false);
        setErrors((prev) => ({
          ...prev,
          email: error.response.data,
        }));
        return;
      }
    }
  };

  // Thay đổi ngôn ngữ
  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundImage: `url(${Bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "80%",
          height: "60%",
          maxWidth: "850px",
          display: "flex",
          justifyContent: "space-between",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          flexDirection: "row",
          flexWrap: "wrap", // Cho phép các phần tử bọc khi màn hình nhỏ
        }}
      >
        {/* Bên trái: Hình ảnh, chỉ hiển thị nếu không phải là mobile */}
        {!isMobile && (
          <div
            style={{
              flex: 1,
              backgroundColor: "#FFFFFF",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "300px",
              backgroundImage: `url(${loginBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}

        {/* Bên phải: Form đăng nhập */}
        {/* Bên phải: Form đổi mật khẩu */}
        <div
          style={{
            flex: 1,
            padding: "30px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            backgroundColor: "#FFFFFF",
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <h2
              style={{
                textAlign: "center",
                color: "#1E3A8A",
                fontSize: "36px",
                fontWeight: "bold",
                marginBottom: "30px",
              }}
            >
              Đổi mật khẩu
            </h2>

            {/* Mật khẩu hiện tại */}
            <Input.Password
              value={currnetPassword}
              onChange={(e) => setCurrnetPassword(e.target.value)}
              placeholder="Mật khẩu hiện tại"
              iconRender={(visible) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
              style={{
                marginBottom: "20px",
                height: "50px",
                fontSize: "16px",
                borderColor: errors.currnetPassword ? "red" : "",
              }}
            />
            {errors.currnetPassword && (
              <div style={{ color: "red", fontSize: "12px" }}>
                {errors.currnetPassword}
              </div>
            )}

            {/* Mật khẩu mới */}
            <Input.Password
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mật khẩu mới"
              iconRender={(visible) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
              style={{
                marginBottom: "20px",
                height: "50px",
                fontSize: "16px",
                borderColor: errors.newPassword ? "red" : "",
              }}
            />
            {errors.newPassword && (
              <div style={{ color: "red", fontSize: "12px" }}>
                {errors.newPassword}
              </div>
            )}

            {/* Xác nhận mật khẩu mới */}
            <Input.Password
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Xác nhận mật khẩu mới"
              iconRender={(visible) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
              style={{
                marginBottom: "20px",
                height: "50px",
                fontSize: "16px",
              }}
            />

            {/* Nút Đổi mật khẩu */}
            <Button
              type="primary"
              block
              htmlType="submit"   // 👈 để Enter submit form
              style={{
                height: "50px",
                fontSize: "18px",
              }}
              loading={loading}
              disabled={loading}
            >
              Đổi mật khẩu
            </Button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ChangePassword;
