// ✅ FULL FRONTEND CODE HOÀN CHỈNH — DDSX.jsx
import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Typography,
  Row,
  Col,
  Space,
  Modal,
  Upload,
  Card,
  Spin,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import processApi from "../../../services/processApi";
import { useSelector } from "react-redux";

const { Title } = Typography;
const generateKey = () => `temp-${Date.now()}-${Math.random()}`;

const fileToByteArray = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result;
      const byteArray = new Uint8Array(arrayBuffer);
      resolve(Array.from(byteArray));
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });

const TreeNodeForm = ({
  node,
  onChange,
  onAddChild,
  onAddSibling,
  onRemove,
  level = 0,
}) => {
  const handleFieldChange = (field, value) => {
    onChange({ ...node, [field]: value });
  };

  return (
    <Card
      size="small"
      title={`Bước ${node.name || "---"}`}
      style={{
        marginBottom: 16,
        marginLeft: level * 24,
        borderLeft: "4px solid #1890ff",
      }}
      extra={
        onRemove && (
          <Button
            danger
            size="small"
            icon={<MinusCircleOutlined />}
            onClick={() => onRemove(node.key)}
          >
            Xóa
          </Button>
        )
      }
    >
      <Row gutter={8} align="middle">
        <Col span={6}>
          <Input
            placeholder="Tên bước"
            value={node.name}
            onChange={(e) => handleFieldChange("name", e.target.value)}
          />
        </Col>
        <Col span={5}>
          <Input
            placeholder="Người tạo"
            value={node.creator}
            disabled
          />
        </Col>
        <Col span={6}>
          <Upload
            beforeUpload={(file) => {
              handleFieldChange("file", file.name);
              handleFieldChange("fileObject", file);
              return false;
            }}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>Chọn file</Button>
          </Upload>
          <div style={{ fontSize: 12 }}>
            {node.fileObject?.name || node.file}
          </div>
        </Col>
        <Col>
          <Space>
            <Button
              onClick={() => onAddChild(node.key)}
              icon={<PlusOutlined />}
            >
              Bước con
            </Button>
            <Button
              onClick={() => onAddSibling(node.key)}
              icon={<PlusOutlined />}
            >
              Cùng cấp
            </Button>
          </Space>
        </Col>
      </Row>

      {node.children?.map((child) => (
        <TreeNodeForm
          key={child.key}
          node={child}
          onChange={(updatedChild) => {
            const updatedChildren = node.children.map((c) =>
              c.key === updatedChild.key ? updatedChild : c
            );
            onChange({ ...node, children: updatedChildren });
          }}
          onAddChild={onAddChild}
          onAddSibling={onAddSibling}
          onRemove={(key) => {
            const updatedChildren = node.children.filter((c) => c.key !== key);
            onChange({ ...node, children: updatedChildren });
          }}
          level={level + 1}
        />
      ))}
    </Card>
  );
};

const DDSX = () => {
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [treeFormData, setTreeFormData] = useState([]);
  const [editingKey, setEditingKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.auth.login?.currentUser);

  const fetchData = async () => {
    const res = await processApi.getByModule("DDSX");
    const processList = Array.isArray(res.data?.data) ? res.data.data : [];

    const steps = processList.flatMap((p) =>
      (p.steps || []).map((step) => ({
        ...step,
        key: step.id,
        processId: p.id,
        processTitle: p.title,
        isRoot: true,
        fileObject: null, // 🛠️ reset fileObject để không gây lỗi
      }))
    );
    setData(steps);
  };

  useEffect(() => {
    if(user.data?.department === "DDSX" || user.data?.department === "ADMIN" || user.data?.department === "BGD") {
      fetchData();
    }
  }, []);

  const convertNodeToDto = async (node) => {
    const dto = {
      id: node.key?.startsWith("temp-") ? null : node.key,
      name: node.name,
      creator: node.creator,
      children: [],
    };

    // 🛡️ Chỉ thêm fileContent khi có file thực
    if (node.fileObject instanceof File) {
      const byteArray = await fileToByteArray(node.fileObject);
      if (Array.isArray(byteArray) && byteArray.length > 0) {
        dto.fileContent = byteArray;
        dto.fileName = node.fileObject.name;
      }
    } else if (node.file && !node.fileObject) {
      dto.fileName = node.file;
      // Không thêm fileContent
    }

    if (Array.isArray(node.children)) {
      dto.children = await Promise.all(node.children.map(convertNodeToDto));
    }

    return dto;
  };

  const handleSave = async () => {
    setLoading(true);
    const stepDtos = await Promise.all(treeFormData.map(convertNodeToDto));
    const payload = {
      id: editingKey,
      title: editingKey ? "Cập nhật" : "Quy trình mới",
      module: "DDSX",
      steps: stepDtos,
    };

    try {
      await processApi.save(payload);
      await fetchData();
      setIsModalOpen(false);
      setTreeFormData([]);
      setEditingKey(null);
    } catch (err) {
      console.error("Lỗi lưu quy trình:", err);
      alert("Lỗi khi lưu. Vui lòng kiểm tra dữ liệu và thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setLoading(true);
    try {
      const assignKey = (node, isRoot = false) => ({
        ...node,
        key: node.id,
        file: node.fileName, // 🛠️ gán lại tên file để hiển thị
        fileObject: null,
        isRoot,
        children: node.children?.map(assignKey) || [],
      });

      const tree = assignKey(record);
      setTreeFormData([tree]);
      setEditingKey(record.processId);
      setIsModalOpen(true);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoot = () => {
    const newRoot = {
      key: generateKey(),
      name: "",
      creator: user?.data?.fullName || "",
      file: "",
      fileObject: null,
      children: [],
    };
    setTreeFormData([...treeFormData, newRoot]);
  };

  const columns = [
    {
      title: "Tên bước",
      dataIndex: "name",
      key: "name",
      render: (text, record) =>
        record.isRoot ? (
          <a onClick={() => handleEdit(record)}>{text}</a>
        ) : (
          <span>{text}</span>
        ),
    },
    {
      title: "File",
      dataIndex: "fileName",
      key: "fileName",
      render: (text, record) =>
        text ? (
          <a
            href={processApi.download(record.id)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {text}
          </a>
        ) : (
          "-"
        ),
    },
    {
      title: "Người tạo",
      dataIndex: "creator",
      key: "creator",
    },
    {
      title: "Thuộc quy trình",
      dataIndex: "processTitle",
      key: "processTitle",
    },
  ];

  return (
    <div style={{ padding: 5 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4}>Danh sách quy trình</Title>
        </Col>
        <Col>
          <Space>
            <Input
              placeholder="Tìm bước..."
              prefix={<SearchOutlined />}
              value={searchText}
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setIsModalOpen(true);
                setTreeFormData([]);
                setEditingKey(null);
              }}
            >
              Thêm
            </Button>
          </Space>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={data.filter((item) =>
          item.name?.toLowerCase().includes(searchText.toLowerCase())
        )}
        rowKey="id"
        pagination={false}
        bordered
      />

      <Modal
        title={editingKey ? "Cập nhật quy trình" : "Thêm quy trình mới"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setTreeFormData([]);
          setEditingKey(null);
        }}
        onOk={handleSave}
        width={900}
      >
        <Spin spinning={loading}>
          {treeFormData.map((node) => (
            <TreeNodeForm
              key={node.key}
              node={node}
              onChange={(updated) => {
                setTreeFormData(
                  treeFormData.map((n) => (n.key === updated.key ? updated : n))
                );
              }}
              onAddChild={(parentKey) => {
                const addChild = (nodes) =>
                  nodes.map((node) => {
                    if (node.key === parentKey) {
                      return {
                        ...node,
                        children: [
                          ...(node.children || []),
                          {
                            key: generateKey(),
                            name: "",
                            creator: user?.data?.fullName || "",
                            file: "",
                            fileObject: null,
                            children: [],
                          },
                        ],
                      };
                    } else if (node.children) {
                      return { ...node, children: addChild(node.children) };
                    }
                    return node;
                  });
                setTreeFormData(addChild(treeFormData));
              }}
              onAddSibling={(targetKey) => {
                const addSibling = (nodes, parent = null) => {
                  return nodes.flatMap((node) => {
                    if (node.key === targetKey && parent) {
                      // Thêm sibling vào mảng children của parent
                      return [
                        node,
                        {
                          key: generateKey(),
                          name: "",
                          creator: user?.data?.fullName || "",
                          file: "",
                          fileObject: null,
                          children: [],
                        },
                      ];
                    } else if (node.children && node.children.length > 0) {
                      return [
                        {
                          ...node,
                          children: addSibling(node.children, node),
                        },
                      ];
                    } else {
                      return [node];
                    }
                  });
                };
                setTreeFormData(addSibling(treeFormData));
              }}
              onRemove={(keyToRemove) => {
                const removeNode = (nodes) =>
                  nodes
                    .filter(Boolean)
                    .map((node) => {
                      if (node.key === keyToRemove) return null;
                      if (node.children) {
                        return {
                          ...node,
                          children: removeNode(node.children).filter(Boolean),
                        };
                      }
                      return node;
                    })
                    .filter(Boolean);
                setTreeFormData(removeNode(treeFormData));
              }}
            />
          ))}
        </Spin>
        <Button
          onClick={() => handleAddRoot()}
          icon={<PlusOutlined />}
          type="dashed"
          block
        >
          Thêm bước gốc
        </Button>
      </Modal>
    </div>
  );
};

export default DDSX;
