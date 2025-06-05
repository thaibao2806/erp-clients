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
import ReceptionMinutesModal from "./ReceptionMinutesModal";
import { Link } from "react-router-dom";
import {
  deleteReceivingReport,
  filterReceivingReport,
} from "../../../services/apiPlan/apiReceptionMinute";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const ReceptionMinutes = () => {
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
    vehicleName: "",
    receivingDate: null,
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
        <Link to={`/pl/bien-ban/bien-ban-tiep-nhan-chi-tiet/${record.key}`}>
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
      title: "Thời gian tiếp nhận",
      dataIndex: "receivingDate",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "---",
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
      const { dateRange, vehicleName, documentNumber, receivingDate } = filters;
      console.log(filters);
      const fromDate = dateRange ? dateRange[0].format("YYYY-MM-DD") : null;
      const toDate = dateRange ? dateRange[1].format("YYYY-MM-DD") : null;

      let res = await filterReceivingReport(
        documentNumber,
        vehicleName,
        receivingDate,
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
            selectedRowKeys.map((id) => deleteReceivingReport(id))
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
      vehicleName: "",
      receivingDate: null,
    });
    fetchData(1, pagination.pageSize);
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
        <h1 style={{ margin: 0 }}>Biên bản tiếp nhận</h1>
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
          <Tooltip title="In">
            <Button icon={<PrinterOutlined />} />
          </Tooltip>
          <Tooltip title="Xuất excel">
            <Button icon={<FileExcelOutlined />} />
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
              <label>Thời gian tiếp nhận</label>
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Chọn ngày"
                format="DD/MM/YYYY"
                value={
                  filters.receivingDate ? dayjs(filters.receivingDate) : null
                }
                onChange={(date) =>
                  handleFilterChange(
                    "receivingDate",
                    date ? date.format("YYYY-MM-DDTHH:mm:ss") : null
                  )
                }
              />
            </Col>
            {/* <Col span={8}>
              <label>Nơi nhận</label>
              <Input
                placeholder="Nơi nhận"
                value={filters.tenChamCong}
                onChange={(e) => handleFilterChange("tenChamCong", e.target.value)}
              />
            </Col>
            <Col span={8}>
              <label>Nơi chạy</label>
              <Input
                placeholder="Nơi chạy"
                value={filters.tenChamCong}
                onChange={(e) => handleFilterChange("tenChamCong", e.target.value)}
              />
            </Col> */}
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
        pagination={{ pageSize: 5 }}
        bordered
      />

      {/* Modal */}
      <ReceptionMinutesModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialValues={editingData}
      />
    </div>
  );
};

export default ReceptionMinutes;
