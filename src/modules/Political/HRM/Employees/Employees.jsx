import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Input,
  DatePicker,
  Row,
  Col,
  Space,
  Tooltip,
  Modal,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  PrinterOutlined,
  FileExcelOutlined,
  ImportOutlined,
} from "@ant-design/icons";
import EmployeeModal from "./EmployeeModal";
import { Link } from "react-router-dom";
// import {
//   deleteAssignmetSlip,
//   exportExcel,
//   fillterAssignmentSlip,
// } from "../../../services/apiPlan/apiAssignmentSlip";
import { saveAs } from "file-saver";
import {
  deleteEmployees,
  filterEmployees,
} from "../../../../services/apiPolitical/apiEmployee";

const { RangePicker } = DatePicker;

const Employees = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchData(pagination.current, pagination.pageSize);
  }, []);

  const fetchData = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const {
        fullName,
        gender,
        department,
        identityNumber,
        laborType,
        status,
      } = filters;
      let res = await filterEmployees(
        fullName,
        gender,
        department,
        identityNumber,
        laborType,
        status,
        "",
        page,
        pageSize
      );
      if (res && res.status === 200) {
        let { items, totalCount } = res.data.data;

        // Thêm STT và key
        let dataWithStt = items.map((item, index) => ({
          ...item,
          key: item.id,
          stt: (page - 1) * pageSize + index + 1,
        }));

        setDataSource(dataWithStt);
        setPagination({ current: page, pageSize, total: totalCount });
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
    } finally {
      setLoading(false);
    }
  };

  const [filters, setFilters] = useState({
    fullName: "",
    gender: "",
    department: "",
    identityNumber: "",
    laborType: "",
    status: "",
  });

  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      width: 60,
    },
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      render: (text, record) => (
        <Link to={`/pt/nhan-su/ho-so-nhan-vien-chi-tiet/${record.id}`}>
          {text}
        </Link> // ✅ THAY ĐOẠN NÀY
      ),
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
    },
    {
      title: "SĐT",
      dataIndex: "phoneNumber",
    },
    {
      title: "Chức vụ",
      dataIndex: "position",
    },
    {
      title: "Loại lao động",
      dataIndex: "laborType",
    },
    {
      title: "Ngày vào làm",
      dataIndex: "startDate",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "---",
    },
    {
      title: "Trạng thái làm",
      dataIndex: "status",
    },
  ];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

  const handleAdd = () => {
    setEditingData(null); // không có dữ liệu -> thêm mới
    setModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingData(record); // truyền dữ liệu -> chỉnh sửa
    setModalOpen(true);
  };

  const handleSubmit = (values) => {
    if (editingData) {
      console.log("Cập nhật:", values);
      // Gọi API update ở đây
    } else {
      fetchData(pagination.current, pagination.pageSize);
    }
    setModalOpen(false);
  };

  // Xử lý chọn dòng
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => {
      setSelectedRowKeys(selectedKeys);
    },
  };

  // Xử lý nút xóa
  const handleDelete = () => {
    if (selectedRowKeys.length === 0) {
      Modal.warning({
        title: "Chưa chọn dòng nào",
        content: "Vui lòng chọn ít nhất một dòng để xóa.",
      });
      return;
    }

    const selectedRows = dataSource.filter((item) =>
      selectedRowKeys.includes(item.key)
    );

    const approvedRows = selectedRows.filter(
      (item) => item.approvalStatus === "approved"
    );

    if (approvedRows.length > 0) {
      Modal.warning({
        title: "Không thể xóa phiếu đã duyệt",
        content: `Có ${approvedRows.length} phiếu đã được duyệt. Vui lòng bỏ chọn chúng trước khi xóa.`,
      });
      return;
    }

    Modal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} dòng này không?`,
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setLoading(true); // bật loading cho Table

          // Gọi API xóa từng ID
          await Promise.all(selectedRowKeys.map((id) => deleteEmployees(id)));

          // Sau khi xóa thành công, cập nhật lại danh sách
          const remainingData = dataSource.filter(
            (item) => !selectedRowKeys.includes(item.key)
          );

          setDataSource(remainingData);
          setSelectedRowKeys([]);
          Modal.success({
            title: "Xóa thành công",
            content: `${selectedRowKeys.length} dòng đã được xóa.`,
          });
        } catch (error) {
          console.error("Lỗi khi xóa:", error);
          Modal.error({
            title: "Lỗi",
            content: "Đã xảy ra lỗi khi xóa. Vui lòng thử lại.",
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleExportExcel = async () => {
    if (selectedRowKeys.length === 0) {
      Modal.warning({
        title: "Chưa chọn dòng nào",
        content: "Vui lòng chọn ít nhất một dòng để xóa.",
      });
      return;
    }
    try {
      for (const id of selectedRowKeys) {
        const matchedItem = dataSource.find((item) => item.id === id);
        const fileName = matchedItem?.documentNumber
          ? `PhieuGiaoViec_${matchedItem.documentNumber}.xlsx`
          : `PhieuGiaoViec_${id}.xlsx`;
        try {
          let res = await exportExcel(id);
          const blob = new Blob([res.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });

          saveAs(blob, fileName);
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      Modal.error({
        title: "Lỗi xuất file",
        content: "Đã xảy ra lỗi khi xuất một hoặc nhiều phiếu.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const handleSearch = () => {
    fetchData(1, pagination.pageSize); // luôn reset về trang 1
  };

  const handleReset = () => {
    setFilters({
      fullName: "",
      gender: "",
      department: "",
      identityNumber: "",
      laborType: "",
      status: "",
    });
    fetchData(pagination.current, pagination.pageSize);
  };

  return (
    <div style={{ padding: 5 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h1 style={{ margin: 0 }}>Hồ sơ nhân viên</h1>
        <Space>
          <Tooltip title="Tìm kiếm">
            <Button
              icon={<SearchOutlined />}
              onClick={() => setShowFilters(!showFilters)}
            />
          </Tooltip>
          <Tooltip title="Thêm">
            <Button onClick={handleAdd} icon={<PlusOutlined />} />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={handleDelete}
              disabled={selectedRowKeys.length === 0}
            />
          </Tooltip>
          <Tooltip title="Xuất excel">
            <Button icon={<FileExcelOutlined />} onClick={handleExportExcel} />
          </Tooltip>
          <Tooltip title="Import file">
            <Button icon={<ImportOutlined />} />
          </Tooltip>
        </Space>
      </div>

      {/* Bộ lọc tìm kiếm */}
      {showFilters && (
        <div
          style={{
            background: "#fafafa",
            padding: 16,
            marginBottom: 20,
            borderRadius: 8,
            border: "1px solid #eee",
          }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <label>Họ và tên</label>
              <Input
                placeholder="Họ và tên"
                value={filters.fullName}
                onChange={(e) => handleFilterChange("fullName", e.target.value)}
              />
            </Col>
            <Col span={8}>
              <label>Giới tính</label>
              <Input
                placeholder="Giới tính"
                value={filters.gender}
                onChange={(e) => handleFilterChange("gender", e.target.value)}
              />
            </Col>
            <Col span={8}>
              <label>CCCD</label>
              <Input
                placeholder="CCCD"
                value={filters.department}
                onChange={(e) =>
                  handleFilterChange("department", e.target.value)
                }
              />
            </Col>
            <Col span={8}>
              <label>Loại lao động</label>
              <Input
                placeholder="Loại lao động"
                value={filters.laborType}
                onChange={(e) =>
                  handleFilterChange("laborType", e.target.value)
                }
              />
            </Col>
            <Col span={8}>
              <label>Trạng thái</label>
              <Input
                placeholder="Trạng thái"
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              />
            </Col>
            <Col span={8}>
              <label>Chức vụ</label>
              <Input
                placeholder="Chức vụ"
                value={filters.department}
                onChange={(e) =>
                  handleFilterChange("department", e.target.value)
                }
              />
            </Col>
          </Row>
          <div style={{ marginTop: 16, textAlign: "right" }}>
            <Button
              type="primary"
              onClick={handleSearch}
              style={{ marginRight: 8 }}
            >
              Lọc
            </Button>
            <Button onClick={handleReset}>Hủy</Button>
          </div>
        </div>
      )}

      {/* Bảng dữ liệu */}
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        onChange={(pagination) => {
          fetchData(pagination.current, pagination.pageSize);
        }}
        bordered
      />

      {/* Modal */}
      <EmployeeModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialValues={editingData}
      />
    </div>
  );
};

export default Employees;
