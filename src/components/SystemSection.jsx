import React from "react";
import { Row, Col, Button } from "antd";

const SystemSection = ({ systemInfo, onAddFollower }) => {
  return (
    <Row gutter={24}>
      {/* Thông tin hệ thống bên trái */}
      <Col span={12}>
        <div style={{ fontWeight: "bold", marginBottom: 8 }}>Thông tin hệ thống</div>
        <div>
          <Row gutter={8}>
            <Col span={8}>Người tạo:</Col>
            <Col span={16}>{systemInfo.createdBy}</Col>
          </Row>
          <Row gutter={8}>
            <Col span={8}>Ngày tạo:</Col>
            <Col span={16}>{systemInfo.createdAt}</Col>
          </Row>
          <Row gutter={8}>
            <Col span={8}>Người sửa:</Col>
            <Col span={16}>{systemInfo.updatedBy}</Col>
          </Row>
          <Row gutter={8}>
            <Col span={8}>Ngày sửa:</Col>
            <Col span={16}>{systemInfo.updatedAt}</Col>
          </Row>
        </div>
      </Col>

      {/* Danh sách người theo dõi bên phải */}
      <Col span={12}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontWeight: "bold", marginRight: 8 }}>Danh sách người theo dõi</div>
          <Button shape="circle" type="primary" size="small" onClick={onAddFollower}>+</Button>
        </div>
        <input
          style={{
            width: "100%",
            border: "1px solid #d9d9d9",
            borderRadius: 4,
            padding: "4px 8px",
          }}
          placeholder="Nhập người theo dõi..."
        />
      </Col>
    </Row>
  );
};

export default SystemSection;
