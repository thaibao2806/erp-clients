import React, { useEffect, useState } from "react";
import { Row, Col, Button, Modal, Table, Tag, notification } from "antd";
import { getAllUser } from "../services/apiAuth";
import { addFollower, getFollower } from "../services/apiFollower";

const SystemSection = ({ systemInfo, refId, refType, voucherNo }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [dataUser, setDataUser] = useState();
  const [loadingAddFollower, setLoadingAddFollower] = useState(false); // ✅

  useEffect(() => {
    getFollowers();
  }, [refId]);

  const getFollowers = async () => {
    try {
      let res = await getFollower(refId, refType);
      if (res && res.status === 200) {
        setFollowers(res.data.data);
      }
    } catch (error) {}
  };

  const getUser = async () => {
    try {
      let res = await getAllUser();
      if (res && res.status === 200) {
        const usersWithKey = res.data.data.map((user) => ({
          ...user,
          key: user.apk || user.id,
        }));
        setDataUser(usersWithKey);
      }
    } catch (error) {}
  };

  const handleAddFollower = () => {
    setIsModalOpen(true);
    getUser();
  };

  const handleModalOk = async () => {
    const selectedUsers = dataUser.filter((user) =>
      selectedRowKeys.includes(user.key)
    );

    const newFollowers = selectedUsers.filter(
      (u) => !followers.some((p) => p.key === u.key)
    );

    setLoadingAddFollower(true); // ✅ Bắt đầu loading
    try {
      let res = await addFollower(
        refId,
        refType,
        voucherNo,
        newFollowers.map((u) => ({
          userId: u.apk,
          userName: u.userName,
        }))
      );

      if (res && res.status === 200) {
        setIsModalOpen(false);
        setSelectedRowKeys([]);
        notification.success({
          message: "Thành công",
          description: "Đã gán người theo dõi.",
          placement: "topRight",
        });
        getFollowers();
      }
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
        placement: "topRight",
      });
    } finally {
      setLoadingAddFollower(false); // ✅ Kết thúc loading
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setSelectedRowKeys([]);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    getCheckboxProps: (record) => ({
      disabled: followers.some((user) => user.key === record.key),
    }),
  };

  const columns = [
    { title: "Tên người dùng", dataIndex: "userName", key: "userName" },
    { title: "Bộ phận", dataIndex: "department", key: "department" },
  ];

  return (
    <Row gutter={24}>
      <Col span={12}>
        <div style={{ fontWeight: "bold", marginBottom: 8 }}>
          Thông tin hệ thống
        </div>
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

      <Col span={12}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontWeight: "bold", marginRight: 8 }}>
            Danh sách người theo dõi
          </div>
          <Button
            shape="circle"
            type="primary"
            size="small"
            onClick={handleAddFollower}
          >
            +
          </Button>
        </div>

        <div style={{ marginBottom: 8 }}>
          {followers.map((user) => (
            <Tag key={user.key}>{user.userName}</Tag>
          ))}
        </div>
      </Col>

      <Modal
        title="Chọn người theo dõi"
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Thêm"
        cancelText="Hủy"
        width={600}
        confirmLoading={loadingAddFollower} // ✅ Hiển thị loading
      >
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={dataUser}
          pagination={false}
          rowKey="key"
        />
      </Modal>
    </Row>
  );
};

export default SystemSection;
