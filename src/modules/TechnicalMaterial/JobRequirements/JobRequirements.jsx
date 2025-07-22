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
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import {
  deleteAssignmetSlip,
  exportExcel,
  fillterAssignmentSlip,
} from "../../../services/apiPlan/apiAssignmentSlip";
import { saveAs } from "file-saver";
import JobRequirementsModal from "./JobRequirementsModal";
import {
  deleteJobRequirements,
  exportExcelJR,
  filterJobRequirements,
} from "../../../services/apiTechnicalMaterial/apiJobRequirement";

const { RangePicker } = DatePicker;

const JobRequirements = () => {
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
        voucherNo,
        productName,
        managementUnit,
        department,
        dateRange,
        repairOrderCode,
      } = filters;
      const fromDate = dateRange ? dateRange[0].format("YYYY-MM-DD") : null;
      const toDate = dateRange ? dateRange[1].format("YYYY-MM-DD") : null;

      let res = await filterJobRequirements(
        voucherNo,
        productName,
        repairOrderCode,
        department,
        managementUnit,
        fromDate,
        toDate,
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
    dateRange: null,
    documentNumber: "",
    productName: "",
    managementUnit: "",
    department: "",
    repairOrderCode: "",
  });

  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      width: 60,
    },
    {
      title: "Số chứng từ",
      dataIndex: "voucherNo",
      render: (text, record) => (
        <Link to={`/tm/yeu-cau-cong-viec-chi-tiet/${record.id}`}>{text}</Link> // ✅ THAY ĐOẠN NÀY
      ),
    },
    {
      title: "Ngày chứng từ",
      dataIndex: "voucherDate",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "---",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
    },
    {
      title: "Đơn vị quản lý sd",
      dataIndex: "managementUnit",
    },
    {
      title: "Bộ phận",
      dataIndex: "department",
    },
    {
      title: "Lệnh sửa chữa",
      dataIndex: "repairOrderCode",
    },
    {
      title: "Trạng thái duyệt",
      dataIndex: "approvalStatus",
      render: (status) => {
        if (status === "approved") return "Đã duyệt";
        if (status === "rejected") return "Từ chối";
        if (status === "pending") return "Chờ duyệt";
      },
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
          await Promise.all(
            selectedRowKeys.map((id) => deleteJobRequirements(id))
          );

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
        const fileName = matchedItem?.voucherNo
          ? `PhieuGiaoViec_${matchedItem.voucherNo}.xlsx`
          : `PhieuGiaoViec_${id}.xlsx`;
        try {
          let res = await exportExcelJR(id);
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
      dateRange: null,
      documentNumber: "",
      productName: "",
      managementUnit: "",
      department: "",
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
        <h1 style={{ margin: 0 }}>Phiếu yêu cầu công việc</h1>
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
          <Tooltip title="In">
            <Button icon={<PrinterOutlined />} disabled />
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
              <label>Thời gian</label>
              <RangePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                value={filters.dateRange}
                onChange={(value) => handleFilterChange("dateRange", value)}
              />
            </Col>
            <Col span={8}>
              <label>Số chứng từ</label>
              <Input
                placeholder="Số chứng từ"
                value={filters.voucherNo}
                onChange={(e) =>
                  handleFilterChange("voucherNo", e.target.value)
                }
              />
            </Col>
            <Col span={8}>
              <label>Tên sản phẩm</label>
              <Input
                placeholder="Tên sản phẩm"
                value={filters.productName}
                onChange={(e) =>
                  handleFilterChange("productName", e.target.value)
                }
              />
            </Col>
            <Col span={8}>
              <label>Đơn vị quản lý sử dụng</label>
              <Input
                placeholder="Đơn vị quản lý"
                value={filters.managementUnit}
                onChange={(e) =>
                  handleFilterChange("managementUnit", e.target.value)
                }
              />
            </Col>
            <Col span={8}>
              <label>Bộ phận</label>
              <Input
                placeholder="Bộ phận"
                value={filters.department}
                onChange={(e) =>
                  handleFilterChange("department", e.target.value)
                }
              />
            </Col>
            <Col span={8}>
              <label>Lệnh sửa chữa</label>
              <Input
                placeholder="Lệnh sửa chữa"
                value={filters.repairOrderCode}
                onChange={(e) =>
                  handleFilterChange("repairOrderCode", e.target.value)
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
      <JobRequirementsModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialValues={editingData}
      />
    </div>
  );
};

export default JobRequirements;
