import React, { useEffect, useState } from "react";
import { Modal, Select, InputNumber, Form, notification } from "antd";
import { moduleData } from "../data/modules"; // Đường dẫn đến file chứa moduleData
import { useSelector } from "react-redux";
import {
  createApproveSetting,
  getApprovalSetting,
} from "../services/apiApproveSetting";
import { v4 as uuidv4 } from "uuid";
const { Option } = Select;

const ApprovalSettingModal = ({ open, onClose }) => {
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedPage, setSelectedPage] = useState(null);
  const [approverCount, setApproverCount] = useState(1);
  const user = useSelector((state) => state.auth.login?.currentUser);
  

  useEffect(() => {
    if (selectedModule || selectedPage) {
      getApproval();
    }
  }, [selectedModule, selectedPage]);

  const getApproval = async () => {
    try {
      let res = await getApprovalSetting(selectedModule, selectedPage);
      if (res && res.status === 200) {
        setApproverCount(res.data.data.approvalNumber);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleModuleChange = (moduleKey) => {
    setSelectedModule(moduleKey);
    setSelectedPage(null);
  };

  const handleOk = async () => {
    let id = uuidv4();
    try {
      let res = await createApproveSetting(
        id,
        selectedModule,
        selectedPage,
        approverCount,
        user.data.userName,
        new Date().toISOString(),
        user.data.userName,
        new Date().toISOString()
      );

      if (res && res.status === 200) {
        notification.success({
          message: "Thành công",
          description: "Đã thiết lập thành công!",
          placement: "topRight",
        });
      }
      onClose();
    } catch (error) {
      if (error && error.status) {
        notification.error({
          message: "Lỗi",
          description: "Có lỗi xảy ra. Vui lòng thử lại!",
          placement: "topRight",
        });
      }
    }
  };

  const pages =
    selectedModule && moduleData[selectedModule]?.pages
      ? moduleData[selectedModule].pages.flatMap((page) =>
          page.children ? page.children : page
        )
      : [];

  return (
    <Modal
      title="Thiết lập xét duyệt"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
    >
      <Form layout="vertical">
        <Form.Item label="Chọn module">
          <Select
            value={selectedModule}
            onChange={handleModuleChange}
            placeholder="Chọn module"
          >
            {Object.keys(moduleData).map((key) => (
              <Option key={key} value={key}>
                {moduleData[key].name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Chọn trang">
          <Select
            value={selectedPage}
            onChange={setSelectedPage}
            placeholder="Chọn trang"
            disabled={!selectedModule}
          >
            {pages.map((page) => (
              <Option key={page.key} value={page.key}>
                {page.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Số lượng người xét duyệt">
          <InputNumber
            min={1}
            max={10}
            value={approverCount}
            onChange={setApproverCount}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ApprovalSettingModal;
