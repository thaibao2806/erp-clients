import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Select,
  Row,
  Col,
  Typography,
  Space,
  Button,
  Dropdown,
  Checkbox,
  Modal,
  Card,
  Drawer,
} from "antd";
import {
  SearchOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  SettingOutlined,
  MenuOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import {
  filterApprovals,
  updateStatusApprovals,
} from "../../services/apiApprovals";

const { Title } = Typography;
const { Option } = Select;

const Review = () => {
  const [searchVisible, setSearchVisible] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState([
    "STT",
    "voucherNo",
    "refType",
    "status",
    "note",
  ]);
  const user = useSelector((state) => state.auth.login.currentUser);
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [search, setSearch] = useState({
    voucherNo: "",
    refType: "",
    status: "pending",
  });
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [approveStatus, setApproveStatus] = useState(null);
  const [approveNote, setApproveNote] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [searchDrawerVisible, setSearchDrawerVisible] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    fetchData(pagination.current, pagination.pageSize);
  }, []);

  const fetchData = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const { voucherNo, refType, status } = search;

      let res = await filterApprovals(
        refType,
        user.data.userName,
        voucherNo,
        status,
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

  const toggleSearch = () => {
    if (isMobile) {
      setSearchDrawerVisible(!searchDrawerVisible);
    } else {
      setSearchVisible(!searchVisible);
    }
  };

  const allColumns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      render: (_, __, index) => index + 1,
      width: 70,
      align: "center",
      responsive: ["lg"],
    },
    {
      title: "Mã phiếu",
      dataIndex: "voucherNo",
      key: "voucherNo",
      render: (text, record) => (
        <a
          href={record.linkDetail}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            wordBreak: "break-word",
            fontSize: isMobile ? "12px" : "14px",
          }}
        >
          {text}
        </a>
      ),
      width: isMobile ? 120 : 150,
    },
    {
      title: "Loại",
      dataIndex: "refType",
      key: "refType",
      width: isMobile ? 80 : 120,
      responsive: ["md"],
      render: (text) => (
        <span style={{ fontSize: isMobile ? "12px" : "14px" }}>{text}</span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let statusText = "Chờ duyệt";
        let color = "#faad14";

        if (status === "approved") {
          statusText = "Đã duyệt";
          color = "#52c41a";
        } else if (status === "rejected") {
          statusText = "Từ chối";
          color = "#ff4d4f";
        }

        return (
          <span
            style={{
              color,
              fontWeight: "500",
              fontSize: isMobile ? "11px" : "14px",
              padding: isMobile ? "2px 6px" : "4px 8px",
              borderRadius: "4px",
              backgroundColor: `${color}15`,
            }}
          >
            {statusText}
          </span>
        );
      },
      width: isMobile ? 80 : 100,
    },
    {
      title: "Ý kiến",
      dataIndex: "note",
      key: "note",
      responsive: ["lg"],
      ellipsis: true,
      render: (text) => (
        <span style={{ fontSize: isMobile ? "12px" : "14px" }}>
          {text || "-"}
        </span>
      ),
    },
  ];

  const filteredColumns = allColumns.filter((col) =>
    col.key === "index"
      ? visibleColumns.includes("STT")
      : visibleColumns.includes(col.dataIndex)
  );

  const columnOptions = [
    { label: "STT", value: "STT" },
    ...allColumns.slice(1).map((col) => ({
      label: col.title,
      value: col.dataIndex,
    })),
  ];

  const handleColumnChange = (checkedValues) => {
    setVisibleColumns(checkedValues);
  };

  const handleApproveSelected = () => {
    setApproveModalVisible(true);
  };

  const handleSubmitApproval = async () => {
    if (!approveStatus || selectedRows.length === 0) return;

    setLoading(true);

    const ids = selectedRows
      .map((row) => row.id)
      .filter((id) => /^[0-9a-fA-F-]{36}$/.test(id));

    try {
      for (const id of ids) {
        await updateStatusApprovals(id, approveStatus, approveNote || "");
      }

      setApproveModalVisible(false);
      setSelectedRows([]);
      fetchData(pagination.current, pagination.pageSize);
    } catch (err) {
      console.error("Lỗi khi duyệt từng phiếu:", err);
    } finally {
      setLoading(false);
    }
  };

  // Search form component
  const SearchForm = () => (
    <div style={{ padding: isMobile ? "8px 0" : "0" }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <div style={{ marginBottom: 8 }}>
            <label
              style={{
                display: "block",
                marginBottom: 4,
                fontSize: isMobile ? "13px" : "14px",
                fontWeight: "500",
              }}
            >
              Mã phiếu
            </label>
            <Input
              placeholder="Tìm theo mã phiếu"
              value={search.voucherNo}
              onChange={(e) =>
                setSearch({ ...search, voucherNo: e.target.value })
              }
              size={isMobile ? "middle" : "middle"}
            />
          </div>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <div style={{ marginBottom: 8 }}>
            <label
              style={{
                display: "block",
                marginBottom: 4,
                fontSize: isMobile ? "13px" : "14px",
                fontWeight: "500",
              }}
            >
              Loại phiếu
            </label>
            <Input
              placeholder="Loại phiếu"
              value={search.refType}
              onChange={(e) =>
                setSearch({ ...search, refType: e.target.value })
              }
              size={isMobile ? "middle" : "middle"}
            />
          </div>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <div style={{ marginBottom: 8 }}>
            <label
              style={{
                display: "block",
                marginBottom: 4,
                fontSize: isMobile ? "13px" : "14px",
                fontWeight: "500",
              }}
            >
              Trạng thái
            </label>
            <Select
              placeholder="Trạng thái"
              value={search.status}
              onChange={(value) => setSearch({ ...search, status: value })}
              style={{ width: "100%" }}
              allowClear
              size={isMobile ? "middle" : "middle"}
            >
              <Option value="pending">Chờ duyệt</Option>
              <Option value="approved">Đã duyệt</Option>
              <Option value="rejected">Từ chối</Option>
            </Select>
          </div>
        </Col>
      </Row>
      <Row justify="end" style={{ marginTop: 16 }}>
        <Space size={isMobile ? "small" : "middle"}>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => {
              fetchData(1, pagination.pageSize);
              if (isMobile) setSearchDrawerVisible(false);
            }}
            size={isMobile ? "middle" : "middle"}
          >
            Lọc
          </Button>
          <Button
            onClick={() => {
              setSearch({
                voucherNo: "",
                refType: "",
                status: "",
              });
              fetchData(1, pagination.pageSize);
              if (isMobile) setSearchDrawerVisible(false);
            }}
            size={isMobile ? "middle" : "middle"}
          >
            Hủy
          </Button>
        </Space>
      </Row>
    </div>
  );

  return (
    <div
      style={{
        padding: isMobile ? "8px" : "16px",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          marginBottom: 16,
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? "12px" : "0",
        }}
      >
        <Title
          level={isMobile ? 4 : 3}
          style={{
            margin: 0,
            fontSize: isMobile ? "18px" : "24px",
          }}
        >
          Xét duyệt
        </Title>

        <Space
          size={isMobile ? "small" : "middle"}
          wrap={isMobile}
          style={{ width: isMobile ? "100%" : "auto" }}
        >
          <Button
            icon={
              isMobile ? (
                <FilterOutlined />
              ) : searchVisible ? (
                <CloseCircleOutlined />
              ) : (
                <SearchOutlined />
              )
            }
            onClick={toggleSearch}
            size={isMobile ? "middle" : "middle"}
            block={isMobile}
          >
            {isMobile ? "Tìm kiếm" : ""}
          </Button>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            disabled={selectedRows.length === 0}
            onClick={handleApproveSelected}
            size={isMobile ? "middle" : "middle"}
            block={isMobile}
          >
            Duyệt hàng loạt ({selectedRows.length})
          </Button>
        </Space>
      </div>

      {/* Desktop Search Form */}
      {!isMobile && searchVisible && (
        <Card style={{ marginBottom: 16 }}>
          <SearchForm />
        </Card>
      )}

      {/* Mobile Search Drawer */}
      {isMobile && (
        <Drawer
          title="Tìm kiếm"
          placement="right"
          onClose={() => setSearchDrawerVisible(false)}
          open={searchDrawerVisible}
          width="100%"
        >
          <SearchForm />
        </Drawer>
      )}

      {/* Table */}
      <div
        style={{
          overflowX: "auto",
          backgroundColor: "white",
          borderRadius: "6px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <Table
          rowSelection={{
            onChange: (_, rows) => setSelectedRows(rows),
            columnWidth: isMobile ? 40 : 60,
          }}
          columns={filteredColumns}
          dataSource={dataSource}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: !isMobile,
            showQuickJumper: !isMobile,
            showTotal: (total, range) =>
              isMobile
                ? `${range[0]}-${range[1]} / ${total}`
                : `${range[0]}-${range[1]} trên ${total} mục`,
            pageSizeOptions: isMobile
              ? ["10", "20"]
              : ["10", "20", "50", "100"],
            size: isMobile ? "small" : "default",
            responsive: true,
          }}
          onChange={(pagination) => {
            fetchData(pagination.current, pagination.pageSize);
          }}
          bordered={!isMobile}
          size={isMobile ? "small" : "middle"}
          scroll={{
            x: isMobile ? 400 : "100%",
            scrollToFirstRowOnChange: true,
          }}
          style={{
            fontSize: isMobile ? "12px" : "14px",
          }}
          components={{
            header: {
              cell: (props) => (
                <th
                  {...props}
                  style={{
                    backgroundColor: "#e6f4fb",
                    color: "#0700ad",
                    fontWeight: "600",
                    fontSize: isMobile ? 12 : 14,
                  }}
                />
              ),
            },
          }}
        />
      </div>

      {/* Approval Modal */}
      <Modal
        title="Xét duyệt hàng loạt"
        open={approveModalVisible}
        onCancel={() => setApproveModalVisible(false)}
        onOk={handleSubmitApproval}
        okText="Duyệt"
        cancelText="Hủy"
        width={isMobile ? "90%" : 520}
        centered={isMobile}
      >
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              marginBottom: 8,
              fontWeight: "500",
            }}
          >
            Trạng thái *
          </label>
          <Select
            value={approveStatus}
            onChange={setApproveStatus}
            style={{ width: "100%" }}
            placeholder="Chọn trạng thái"
            size="middle"
          >
            <Option value="approved">Đã duyệt</Option>
            <Option value="rejected">Từ chối</Option>
          </Select>
        </div>
        <div>
          <label
            style={{
              display: "block",
              marginBottom: 8,
              fontWeight: "500",
            }}
          >
            Ghi chú
          </label>
          <Input.TextArea
            rows={4}
            placeholder="Nhập ý kiến duyệt"
            value={approveNote}
            onChange={(e) => setApproveNote(e.target.value)}
            maxLength={500}
            showCount={!isMobile}
          />
        </div>

        {selectedRows.length > 0 && (
          <div
            style={{
              marginTop: 12,
              padding: 8,
              backgroundColor: "#f6ffed",
              borderRadius: 4,
              border: "1px solid #b7eb8f",
            }}
          >
            <small style={{ color: "#389e0d" }}>
              Sẽ áp dụng cho {selectedRows.length} phiếu đã chọn
            </small>
          </div>
        )}
      </Modal>

      {/* Mobile floating action button for batch approval */}
      {isMobile && selectedRows.length > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: 1000,
          }}
        >
          <Button
            type="primary"
            shape="round"
            icon={<CheckCircleOutlined />}
            onClick={handleApproveSelected}
            size="large"
            style={{
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            Duyệt ({selectedRows.length})
          </Button>
        </div>
      )}
    </div>
  );
};

export default Review;
