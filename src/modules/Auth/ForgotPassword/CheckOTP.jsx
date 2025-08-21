import React, { useState, useEffect } from "react";
import { Button, Input, Checkbox, message, Select } from "antd";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next"; // Import hook useTranslation
import loginBg from "../../../assets/images/login/login.jpg";
import Bg from "../../../assets/images/login/bg.jpg";
import { useNavigate } from "react-router-dom";
import { checkMailOTP } from "../../../services/apiAuth";
import { notification } from "antd";

const CheckOTP = () => {
  const { t, i18n } = useTranslation(); // Hàm `t` để lấy giá trị dịch, `i18n` để thay đổi ngôn ngữ
  const [rememberMe, setRememberMe] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [email, setEmail] = useState();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  // Hàm để kiểm tra email
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Hàm xử lý submit
  const handleSubmit = async () => {
    setErrors({ email: "" });

    if (!email) {
      setErrors((prev) => ({
        ...prev,
        email: "Cần nhập email",
      }));
      return;
    } else if (!validateEmail(email)) {
      setErrors((prev) => ({
        ...prev,
        email: "Email không đúng định dạng",
      }));
      return;
    }

    setLoading(true);
    try {
      let res = await checkMailOTP(email);
      if (res && res.status === 200) {
        notification.success({
          message: "Thành công",
          description:
            "Đã gửi mã xác thực đến email của bạn. Nếu không tìm thấy vui lòng kiểm tra thư rác.",
          placement: "topRight",
        });
        setLoading(false);
        navigate("/forgot-password");
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
              e.preventDefault(); // ngăn reload trang
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
              Quên mật khẩu
            </h2>

            {/* Ô nhập email */}
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={"Nhập email"}
              style={{
                marginBottom: "20px",
                height: "50px",
                fontSize: "16px",
                borderColor: errors.email ? "red" : "",
              }}
            />
            {errors.email && (
              <div
                style={{ color: "red", fontSize: "12px", marginBottom: "10px" }}
              >
                {errors.email}
              </div>
            )}

            {/* Nút gửi mã */}
            <Button
              type="primary"
              block
              htmlType="submit"   // 👈 thêm dòng này
              style={{
                height: "50px",
                fontSize: "18px",
              }}
              loading={loading}
              disabled={loading}
            >
              Gửi mã
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckOTP;
