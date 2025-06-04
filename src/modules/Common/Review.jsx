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
} from "antd";
import {
  SearchOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  SettingOutlined,
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
    setSearchVisible(!searchVisible);
  };

  const allColumns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      render: (_, __, index) => index + 1,
      width: 70,
      align: "center",
    },
    {
      title: "Mã phiếu",
      dataIndex: "voucherNo",
      key: "voucherNo",
      render: (text, record) => (
        <a href={record.linkDetail} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: "Loại",
      dataIndex: "refType",
      key: "refType",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        if (status === "approved") return "Đã duyệt";
        if (status === "rejected") return "Từ chối";
        return "Chờ duyệt";
      },
    },
    {
      title: "Ý kiến người duyệt",
      dataIndex: "note",
      key: "note",
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
      .filter((id) => /^[0-9a-fA-F-]{36}$/.test(id)); // Đảm bảo là GUID

    try {
      // Duyệt tuần tự (có thể thay bằng Promise.all nếu muốn chạy song song)
      for (const id of ids) {
        await updateStatusApprovals(id, approveStatus, approveNote || "");
      }

      // Sau khi duyệt xong:
      setApproveModalVisible(false);
      setSelectedRows([]);
      fetchData(pagination.current, pagination.pageSize);
    } catch (err) {
      console.error("Lỗi khi duyệt từng phiếu:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* === Header === */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Xét duyệt
        </Title>

        <Space>
          <Button
            icon={searchVisible ? <CloseCircleOutlined /> : <SearchOutlined />}
            onClick={toggleSearch}
          >
            {/* {searchVisible ? 'Đóng tìm kiếm' : 'Tìm kiếm'} */}
          </Button>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            disabled={selectedRows.length === 0}
            onClick={handleApproveSelected}
          >
            Duyệt hàng loạt
          </Button>
        </Space>
      </div>

      {/* === Form Tìm kiếm === */}
      {searchVisible && (
        <>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <label>Mã phiếu</label>
              <Input
                placeholder="Tìm theo mã phiếu"
                value={search.voucherNo}
                onChange={(e) =>
                  setSearch({ ...search, voucherNo: e.target.value })
                }
              />
            </Col>
            <Col span={6}>
              <label>Loại phiếu</label>
              <Input
                placeholder="Loại phiếu"
                value={search.refType}
                onChange={(e) =>
                  setSearch({ ...search, refType: e.target.value })
                }
              />
            </Col>
            <Col span={6}>
              <label>Trạng thái </label>
              <Select
                placeholder="Trạng thái"
                value={search.status}
                onChange={(value) => setSearch({ ...search, status: value })}
                style={{ width: "100%" }}
                allowClear
              >
                <Option value="pending">Chờ duyệt</Option>
                <Option value="approved">Đã duyệt</Option>
                <Option value="rejected">Từ chối</Option>
              </Select>
            </Col>
          </Row>
          <Row justify="end" style={{ marginBottom: 16 }}>
            <Space>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => {
                  fetchData(1, pagination.pageSize);
                }}
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
                }}
              >
                Hủy
              </Button>
            </Space>
          </Row>
        </>
      )}

      {/* === Bảng dữ liệu === */}
      <Table
        rowSelection={{
          onChange: (_, rows) => setSelectedRows(rows),
        }}
        columns={filteredColumns}
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

      <Modal
        title="Xét duyệt hàng loạt"
        visible={approveModalVisible}
        onCancel={() => setApproveModalVisible(false)}
        onOk={handleSubmitApproval}
        okText="Duyệt"
        cancelText="Hủy"
      >
        <div style={{ marginBottom: 16 }}>
          <label>Trạng thái</label>
          <Select
            value={approveStatus}
            onChange={setApproveStatus}
            style={{ width: "100%" }}
            placeholder="Chọn trạng thái"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn trạng thái duyệt",
              },
            ]}
          >
            <Option value="approved">Đã duyệt</Option>
            <Option value="rejected">Từ chối</Option>
          </Select>
        </div>
        <div>
          <label>Ghi chú</label>
          <Input.TextArea
            rows={4}
            placeholder="Nhập ý kiến duyệt"
            value={approveNote}
            onChange={(e) => setApproveNote(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Review;
