import React from 'react';
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom'; // Sử dụng Link để điều hướng

const NotFoundPage = () => (
  <Result
    status="404"
    title="404"
    subTitle="Xin lỗi, trang bạn truy cập không tồn tại."
    //extra={<Button type="primary"><Link to={login}>Về Trang Chủ</Link></Button>}
  />
);

export default NotFoundPage;