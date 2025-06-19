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
import TestRunPlanModal from "./TestRunPlanModal";
import { Link } from "react-router-dom";
import {
  deleteTestRunPlans,
  exportExcel,
  filterTestRunPlans,
} from "../../../services/apiPlan/apiTestRunPlan";
import dayjs from "dayjs";
import { saveAs } from "file-saver";

const { RangePicker } = DatePicker;

const TestRunPlan = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    dateRange: null,
    documentNumber: "",
    managingDepartment: "",
    vehicleName: "",
    receivingLocation: "",
    runLocation: "",
    runSchedule: "",
    runTime: "",
  });

  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      width: 60,
    },
    {
      title: "Số chứng từ",
      dataIndex: "documentNumber",
      render: (text, record) => (
        <Link to={`/pl/ke-hoach/ke-hoach-chay-thu-chi-tiet/${record.key}`}>
          {text}
        </Link> // ✅ THAY ĐOẠN NÀY
      ),
    },
    {
      title: "Ngày chứng từ",
      dataIndex: "documentDate",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "---",
    },
    {
      title: "Tên phương tiện",
      dataIndex: "vehicleName",
    },
    {
      title: "Đơn bị quản lý",
      dataIndex: "managingDepartment",
    },
    {
      title: "Nơi nhận",
      dataIndex: "receivingLocation",
    },
    {
      title: "Nơi chạy",
      dataIndex: "runLocation",
    },
    {
      title: "Thời gian chạy",
      dataIndex: "runTime",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "---"),
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

  useEffect(() => {
    fetchData(pagination.current, pagination.pageSize);
  }, []);

  const fetchData = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const {
        dateRange,
        managingDepartment,
        documentNumber,
        vehicleName,
        receivingLocation,
        runLocation,
      } = filters;
      let runSchedule = "";
      let runTime = "";
      const fromDate = dateRange ? dateRange[0].format("YYYY-MM-DD") : null;
      const toDate = dateRange ? dateRange[1].format("YYYY-MM-DD") : null;

      let res = await filterTestRunPlans(
        documentNumber,
        managingDepartment,
        vehicleName,
        receivingLocation,
        runLocation,
        runSchedule,
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
            selectedRowKeys.map((id) => deleteTestRunPlans(id))
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
        const fileName = matchedItem?.documentNumber
          ? `KeHoachChayThu_${matchedItem.documentNumber}.xlsx`
          : `KeHoachChayThu_${id}.xlsx`;
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
    fetchData(1, pagination.pageSize);
  };

  const handleReset = () => {
    setFilters({
      dateRange: null,
      documentNumber: "",
      managingDepartment: "",
      vehicleName: "",
      receivingLocation: "",
      runLocation: "",
      runSchedule: "",
      runTime: "",
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
        <h1 style={{ margin: 0 }}>Kế hoạch chạy thử</h1>
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
                value={filters.documentNumber}
                onChange={(e) =>
                  handleFilterChange("documentNumber", e.target.value)
                }
              />
            </Col>
            <Col span={8}>
              <label>Tên phương tiện</label>
              <Input
                placeholder="Tên phương tiện"
                value={filters.vehicleName}
                onChange={(e) =>
                  handleFilterChange("vehicleName", e.target.value)
                }
              />
            </Col>
            <Col span={8}>
              <label>Đơn vị quản lý</label>
              <Input
                placeholder="Đơn vị quản lý"
                value={filters.managingDepartment}
                onChange={(e) =>
                  handleFilterChange("managingDepartment", e.target.value)
                }
              />
            </Col>
            <Col span={8}>
              <label>Nơi nhận</label>
              <Input
                placeholder="Nơi nhận"
                value={filters.receivingLocation}
                onChange={(e) =>
                  handleFilterChange("receivingLocation", e.target.value)
                }
              />
            </Col>
            <Col span={8}>
              <label>Nơi chạy</label>
              <Input
                placeholder="Nơi chạy"
                value={filters.runLocation}
                onChange={(e) =>
                  handleFilterChange("runLocation", e.target.value)
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
      <TestRunPlanModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialValues={editingData}
      />
    </div>
  );
};

export default TestRunPlan;
