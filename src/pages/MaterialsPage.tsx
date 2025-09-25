import React, { useCallback, useMemo, useState } from "react";
import {
  Card, Table, Typography, Button, Space, Tag, Dropdown, message, Select, Image, Modal, Form, Upload, Popconfirm, Input,
  Row, Col,} from "antd";
import {
  EditOutlined, DeleteOutlined, DownloadOutlined, MoreOutlined, FilePdfOutlined, FileWordOutlined, FilePptOutlined,
  FileZipOutlined, FileOutlined, PlusOutlined,
} from "@ant-design/icons";
import { useCreateMaterial, useUpdateMaterial, useDeleteMaterial, useMaterialsByClass,
} from "../hooks/useMaterials";
import { useClasses } from "../hooks/useClasses";
import type { ClassMaterial } from "../types";
import dayjs from "dayjs";
import { materialsApi } from "../api/materialsApi";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;

// Map MIME type -> dạng ngắn gọn
const mapFileType = (mime: string): string => {
  if (!mime) return "Khác";
  if (mime.includes("pdf")) return "PDF";
  if (mime.includes("word") || mime.includes("doc")) return "DOCX";
  if (mime.includes("presentation") || mime.includes("ppt")) return "PPTX";
  if (mime.includes("zip")) return "ZIP";
  if (mime.includes("png")) return "PNG";
  if (mime.includes("jpg") || mime.includes("jpeg")) return "JPG";
  return mime.toUpperCase();
};

// Icon theo fileType
const getFileIcon = (fileType: string, filePath: string) => {
  if (fileType === "PDF")
    return <FilePdfOutlined style={{ color: "red", fontSize: 20 }} />;
  if (fileType === "DOCX")
    return <FileWordOutlined style={{ color: "blue", fontSize: 20 }} />;
  if (fileType === "PPTX")
    return <FilePptOutlined style={{ color: "orange", fontSize: 20 }} />;
  if (fileType === "ZIP")
    return <FileZipOutlined style={{ color: "cyan", fontSize: 20 }} />;
  if (fileType === "PNG" || fileType === "JPG") {
    return (
      <Image
        src={filePath}
        width={20}
        height={20}
        preview={false}
        style={{ border: "none", boxShadow: "none", objectFit: "cover" }}
      />
    );
  }
  return <FileOutlined style={{ fontSize: 20 }} />;
};

// Tag màu sắc theo loại file
const getFileTypeTag = (fileType: string) => {
  const colorMap: Record<string, string> = {
    PDF: "red",
    DOCX: "blue",
    PPTX: "orange",
    ZIP: "cyan",
    JPG: "green",
    PNG: "green",
  };
  return <Tag color={colorMap[fileType] || "default"}>{fileType}</Tag>;
};

const MaterialsPage: React.FC = () => {
  const { classes } = useClasses();
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  const { data: materials, isLoading, error } =
    useMaterialsByClass(selectedClassId);

  // Modal tạo mới
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm] = Form.useForm();

  // Modal chỉnh sửa
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [editingMaterial, setEditingMaterial] = useState<ClassMaterial | null>(
    null
  );

  const createMaterial = useCreateMaterial();
  const updateMaterial = useUpdateMaterial();
  const deleteMaterial = useDeleteMaterial();

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteMaterial.mutateAsync(id);
      message.success("Delete material successfully");
    } catch {
      message.error("Error deleting material");
    }
  }, [deleteMaterial]);

  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields();
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("classId", values.classId);
      formData.append("description", values.description || "");
      if (values.file && values.file[0]) {
        formData.append("file", values.file[0].originFileObj);
      }
      await createMaterial.mutateAsync(formData);
      setIsCreateModalOpen(false);
      createForm.resetFields();
    } catch {
      message.error("Error creating material");
    }
  };

  const handleEdit = async () => {
    try {
      const values = await editForm.validateFields();
      if (!editingMaterial) return;
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("classId", values.classId);
      formData.append("description", values.description || "");
      if (values.file && values.file[0]) {
        formData.append("file", values.file[0].originFileObj);
      }
      await updateMaterial.mutateAsync({
        id: editingMaterial.id,
        formData: formData,
      });
      setIsEditModalOpen(false);
      setEditingMaterial(null);
      editForm.resetFields();
    } catch {
      message.error("Error updating material");
    }
  };

  const materialsWithClass = useMemo(() => {
    if (!materials || !classes) return [];
    return materials.map((m) => {
      const cls = classes.find((c) => c.id === m.classId);
      return {
        ...m,
        className: cls ? cls.className : "Không rõ",
        fileType: mapFileType(m.fileType),
      };
    });
  }, [materials, classes]);

  const columns = useMemo<ColumnsType<ClassMaterial>>(
    () => [
      {
        title: "Material Title",
        dataIndex: "title",
        key: "title",
        render: (_: unknown, record: ClassMaterial) => (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {getFileIcon(record.fileType, record.filePath)}
            <span>{record.title}</span>
          </div>
        ),
      },
      { title: "Class", dataIndex: "className", key: "className" },
      {
        title: "File Type",
        dataIndex: "fileType",
        key: "fileType",
        render: (ft: string) => getFileTypeTag(ft),
      },
      {
        title: "Uploaded By",
        dataIndex: "createdBy",
        key: "createdBy",
        responsive: ["md"],
      },
      {
        title: "Created At",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (createdAt: string) =>
          dayjs(createdAt).format("DD/MM/YYYY HH:mm:ss"),
        responsive: ["lg"],
      },
      {
        title: "Actions",
        key: "action",
        fixed: 'right' as const,
        render: (_: unknown, record: ClassMaterial) => (
          <Dropdown
            menu={{
              items: [
                {
                  key: "edit",
                  label: (
                    <Space>
                      <EditOutlined /> Edit
                    </Space>
                  ),
                  onClick: () => {
                    setEditingMaterial(record);
                    editForm.setFieldsValue(record);
                    setIsEditModalOpen(true);
                  },
                },
                {
                  key: "delete",
                  label: (
                    <Popconfirm
                      title="Are you sure you want to delete this material?"
                      okText="Delete"
                      cancelText="Cancel"
                      okType="danger"
                      onConfirm={() => handleDelete(record.id)}
                    >
                      <Space>
                        <DeleteOutlined /> Delete
                      </Space>
                    </Popconfirm>
                  ),
                  danger: true,
                },
                {
                  key: "download",
                  label: (
                    <span
                      onClick={() => materialsApi.downloadAndSave(record.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <DownloadOutlined /> Download
                    </span>
                  ),
                },
              ],
            }}
          >
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        ),
      },
    ],
    [editForm, handleDelete]
  );

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        Error loading data: {(error as Error).message}
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Material Management</Title>

      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Select
            placeholder="Select Class"
            value={selectedClassId ?? undefined}
            onChange={setSelectedClassId}
            allowClear
            style={{ width: 200 }}
            options={classes?.map((c) => ({ label: c.className, value: c.id }))}
          />
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Add Material
          </Button>
        </Col>
      </Row>

      <Card
        title={<Text strong>Material List</Text>}
      >
        <Table
          columns={columns}
          dataSource={materialsWithClass}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      {/* Modal tạo mới */}
      <Modal
        title="Add New Material"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onOk={handleCreate}
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            name="title"
            label="Material Name"
            rules={[{ required: true, message: "Please enter material name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="classId"
            label="Select Class"
            rules={[{ required: true, message: "Please select a class" }]}
          >
            <Select
              options={classes?.map((c) => ({
                label: c.className,
                value: c.id,
              }))}
            />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="file"
            label="File"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
          >
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<PlusOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal chỉnh sửa */}
      <Modal
        title="Edit Material"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingMaterial(null);
        }}
        onOk={handleEdit}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="title"
            label="Material Name"
            rules={[{ required: true, message: "Please enter material name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="classId"
            label="Select Class"
            rules={[{ required: true, message: "Please select a class" }]}
          >
            <Select
              options={classes?.map((c) => ({
                label: c.className,
                value: c.id,
              }))}
            />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="file"
            label="File"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
          >
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<PlusOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MaterialsPage;