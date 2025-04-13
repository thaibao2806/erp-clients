import React, { useState } from 'react';
import { Modal, Select, InputNumber, Form } from 'antd';
import { moduleData } from '../data/modules'; // Đường dẫn đến file chứa moduleData

const { Option } = Select;

const ApprovalSettingModal = ({ open, onClose }) => {
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedPage, setSelectedPage] = useState(null);
  const [approverCount, setApproverCount] = useState(1);

  const handleModuleChange = (moduleKey) => {
    setSelectedModule(moduleKey);
    setSelectedPage(null); // Reset trang khi chọn module khác
  };

  const handleOk = () => {
    console.log('Module:', selectedModule);
    console.log('Page:', selectedPage);
    console.log('Approver Count:', approverCount);
    onClose(); // Đóng modal sau khi xử lý
  };

  const pages =
    selectedModule && moduleData[selectedModule]?.pages
      ? moduleData[selectedModule].pages.flatMap((page) =>
          page.children ? page.children : page
        )
      : [];

  return (
    <Modal title="Thiết lập xét duyệt" open={open} onOk={handleOk} onCancel={onClose}>
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
          <InputNumber min={1} max={10} value={approverCount} onChange={setApproverCount} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ApprovalSettingModal;
