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
// import BuySuppliesModal from "./BuySuppliesModal";
import { Link } from "react-router-dom";
import AddNotificationModal from "../../components/AddNotification";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { filterNofifications } from "../../services/notificationApi";

const { RangePicker } = DatePicker;

const Notifications = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: null,
    keyword: "",
  });
  const user = useSelector((state) => state.auth.login?.currentUser);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    if (user && user.data.token) {
      try {
        const decode = jwtDecode(user.data.token);
        setUserId(decode.nameid);
        console.log("UserId extracted:", decode.nameid);
        fetchData(pagination.current, pagination.pageSize, uid);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, [user]);

  useEffect(() => {
    if (userId) fetchData(pagination.current, pagination.pageSize);
  }, [userId]);

  const fetchData = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const { keyword, dateRange } = filters;
      const fromDate = dateRange ? dateRange[0].format("YYYY-MM-DD") : null;
      const toDate = dateRange ? dateRange[1].format("YYYY-MM-DD") : null;

      let res = await filterNofifications(
        userId,
        keyword,
        "",
        fromDate,
        toDate,
        page,
        pageSize
      );
      if (res && res.status === 200) {
        let { items, totalCount } = res.data.data;
        console.log(res.data.data);

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

  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      width: 60,
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      render: (text, record) => (
        <Link to={`/notification-detail/${record.id}`}>{text}</Link> // ✅ THAY ĐOẠN NÀY
      ),
    },
    {
      title: "Nội dung",
      dataIndex: "content",
    },
    {
      title: "Ngày gửi",
      dataIndex: "createdAt",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "---",
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
      // Gọi API thêm mới ở đây
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

    Modal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} dòng này không?`,
      onOk: () => {
        const newData = dataSource.filter(
          (item) => !selectedRowKeys.includes(item.key)
        );
        setDataSource(newData);
        setSelectedRowKeys([]);
      },
    });
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const handleSearch = () => {
    fetchData(pagination.current, pagination.pageSize);
  };

  const handleReset = () => {
    setFilters({
      dateRange: null,
      keyword: "",
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
        <h1 style={{ margin: 0 }}>Thông báo</h1>
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
              <label>Nội dung</label>
              <Input
                placeholder="Nội dung"
                value={filters.keyword}
                onChange={(e) => handleFilterChange("keyword", e.target.value)}
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
        pagination={{ pageSize: 10 }}
        bordered
      />

      {/* Modal */}
      <AddNotificationModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialValues={editingData}
      />
    </div>
  );
};

export default Notifications;
