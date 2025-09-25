import React, { useState } from "react";
import {
  Card, Table, Typography, Button, Dropdown, Row, Col,
  Input, Space, Spin, Alert, message, Modal, Tag, Form, DatePicker, Select,
  Upload, Popconfirm, type UploadFile
} from "antd";
import {
  PlusOutlined, MoreOutlined, FileTextOutlined,
  ClockCircleOutlined, EditOutlined, DeleteOutlined, EyeOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";
import { useAssignments } from "../hooks/useAssignments";
import { useClasses } from "../hooks/useClasses";
import { useSubmissions } from "../hooks/useSubmissions";
import type { Assignment } from "../types/Assignment";
import type { Submission } from "../types/Submissions";

const { Title, Text } = Typography;
const { Search } = Input;

const AssignmentManagementPage: React.FC = () => {
  const assignmentsQuery = useAssignments();
  const classesQuery = useClasses();

  const assignments = assignmentsQuery.data ?? [];
  const classes = classesQuery.data ?? [];

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  // Forms
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const submissionsQuery = useSubmissions(selectedAssignment?.id);

  const isLoading = assignmentsQuery.isLoading || classesQuery.isLoading;
  const error = assignmentsQuery.error || classesQuery.error;

  const totalAssignments = assignments.length;
  const upcomingAssignments = assignments.filter(a =>
    dayjs(a.dueDate).isAfter(dayjs())
  ).length;

  const getClassName = (classId?: number) =>
    classes.find(c => c.id === classId)?.className ?? "Unknown";

  // Create assignment
  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields();
      const formData = new FormData();
      
      formData.append("title", values.title);
      formData.append("classId", values.classId);
      formData.append("maxScore", values.maxScore);
      formData.append("description", values.description || "");
if (values.dueDate) {
  formData.append("dueDate", dayjs(values.dueDate).format("YYYY-MM-DDTHH:mm:ss"));
}
      const fileList = values.file as UploadFile[] | undefined;
      if (fileList && fileList[0]?.originFileObj) {
        formData.append("file", fileList[0].originFileObj);
      }

      await assignmentsQuery.createAssignment?.(formData);
      message.success("Assignment created successfully");
      setIsCreateOpen(false);
      createForm.resetFields();
    } catch {
      message.error("Failed to create assignment");
    }
  };

  // Edit assignment
  const handleEdit = (record: Assignment) => {
    setSelectedAssignment(record);
    editForm.setFieldsValue({
      ...record,
      dueDate: dayjs(record.dueDate),
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await editForm.validateFields();
      if (!selectedAssignment) return;

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("classId", values.classId);
      formData.append("maxScore", values.maxScore);
      formData.append("description", values.description || "");
if (values.dueDate) {
  formData.append("dueDate", dayjs(values.dueDate).format("YYYY-MM-DDTHH:mm:ss"));
}
      const fileList = values.file as UploadFile[] | undefined;
      if (fileList && fileList[0]?.originFileObj) {
        formData.append("file", fileList[0].originFileObj);
      }

      await assignmentsQuery.updateAssignment?.({
        id: selectedAssignment.id,
        data: formData,
      });

      message.success("Assignment updated successfully");
      setIsEditOpen(false);
      setSelectedAssignment(null);
      editForm.resetFields();
    } catch {
      message.error("Failed to update assignment");
    }
  };

  // Delete assignment
  const handleDelete = async (id: number, title: string) => {
    try {
      await assignmentsQuery.deleteAssignment?.(id);
      message.success(`Assignment "${title}" deleted successfully`);
    } catch {
      message.error("Failed to delete assignment");
    }
  };

  // View submissions
  const handleViewSubmissions = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsSubmissionsOpen(true);
  };

  const menuItems = (record: Assignment) => [
    {
      key: "edit",
      label: "Edit",
      icon: <EditOutlined />,
      onClick: () => handleEdit(record)
    },
    {
      key: "submissions",
      label: "View Submissions",
      icon: <EyeOutlined />,
      onClick: () => handleViewSubmissions(record)
    },
    {
      key: "delete",
      label: (
        <Popconfirm
          title="Delete Assignment"
          description={`Are you sure you want to delete "${record.title}"?`}
          onConfirm={() => handleDelete(record.id, record.title)}
          okText="Delete"
          cancelText="Cancel"
          okType="danger"
        >
          <span style={{ color: 'red' }}>Delete</span>
        </Popconfirm>
      ),
      icon: <DeleteOutlined style={{ color: 'red' }} />
    }
  ];

  // Responsive columns
  const columns: ColumnsType<Assignment> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      responsive: ["md"],
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
    },
    {
      title: "Class",
      key: "className",
      responsive: ["sm"],
      render: (_, record: Assignment) => (
        <Tag color="blue">{getClassName(record.classId)}</Tag>
      ),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date: string) => (
        <Text style={{ color: dayjs(date).isBefore(dayjs()) ? "#ff4d4f" : undefined }}>
          {dayjs(date).format("DD/MM/YYYY")}
        </Text>
      ),
    },
    {
      title: "Max Score",
      dataIndex: "maxScore",
      key: "maxScore",
      responsive: ["lg"],
    },
    {
      title: "Actions",
      key: "action",
      fixed: "right",
      render: (_, record: Assignment) => (
        <Dropdown menu={{ items: menuItems(record) }} trigger={["click"]}>
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const submissionColumns: ColumnsType<Submission> = [
    { title: "ID", dataIndex: "id", key: "id", width: 80, responsive: ["md"] },
    { title: "Student", dataIndex: ["student", "fullName"], key: "studentName" },
    {
      title: "Submitted At",
      dataIndex: "submittedAt",
      key: "submittedAt",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Score",
      dataIndex: "score",
      key: "score",
      render: (score: number) =>
        score != null ? (
          <Tag color={score >= 8 ? "green" : score >= 5 ? "blue" : "red"}>{score}</Tag>
        ) : (
          <Text type="secondary">Not graded</Text>
        ),
    },
  ];

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <Spin size="large" />
        <div style={{ marginTop: 12 }}>Loading assignments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          message="Failed to load data"
          description={`Error: ${(error as Error).message}`}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <Title level={2} style={{ margin: 0 }}>Assignment Management</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setIsCreateOpen(true)}
        >
          Add Assignment
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <Card hoverable style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <Space align="center">
              <FileTextOutlined style={{ fontSize: 32, color: '#1890ff' }} />
              <div>
                <Text type="secondary">Total Assignments</Text>
                <Title level={3} style={{ margin: 0 }}>{totalAssignments}</Title>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card hoverable style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <Space align="center">
              <ClockCircleOutlined style={{ fontSize: 32, color: '#fa8c16' }} />
              <div>
                <Text type="secondary">Upcoming Deadlines</Text>
                <Title level={3} style={{ margin: 0 }}>{upcomingAssignments}</Title>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card
        title={<Text strong>Assignment List</Text>}
        extra={<Search placeholder="Search assignments..." style={{ width: 250 }} allowClear />}
        style={{ borderRadius: 12 }}
      >
        <Table 
          columns={columns} 
          dataSource={assignments} 
          rowKey="id" 
          pagination={{ pageSize: 10 }} 
          scroll={{ x: "max-content" }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="Create New Assignment"
        open={isCreateOpen}
        onCancel={() => {
          setIsCreateOpen(false);
          createForm.resetFields();
        }}
        onOk={handleCreate}
        destroyOnClose
        width={600}
      >
        <Form form={createForm} layout="vertical">
          <Form.Item 
            label="Title" 
            name="title" 
            rules={[{ required: true, message: "Please enter assignment title" }]}
          >
            <Input placeholder="Enter assignment title" />
          </Form.Item>

          <Form.Item 
            label="Class" 
            name="classId" 
            rules={[{ required: true, message: "Please select a class" }]}
          >
            <Select 
              placeholder="Select class"
              options={classes.map(c => ({ value: c.id, label: c.className }))} 
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="Due Date" 
                name="dueDate" 
                rules={[{ required: true, message: "Please select due date" }]}
              >
                <DatePicker style={{ width: "100%" }} placeholder="Select date" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="Max Score" 
                name="maxScore" 
                rules={[{ required: true, message: "Please enter max score" }]}
              >
                <Input type="number" placeholder="10" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} placeholder="Assignment description..." />
          </Form.Item>

          <Form.Item
            label="Attachment"
            name="file"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
          >
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button>Select File</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Assignment"
        open={isEditOpen}
        onCancel={() => {
          setIsEditOpen(false);
          setSelectedAssignment(null);
          editForm.resetFields();
        }}
        onOk={handleUpdate}
        destroyOnClose
        width={600}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item 
            label="Title" 
            name="title" 
            rules={[{ required: true, message: "Please enter assignment title" }]}
          >
            <Input placeholder="Enter assignment title" />
          </Form.Item>

          <Form.Item 
            label="Class" 
            name="classId" 
            rules={[{ required: true, message: "Please select a class" }]}
          >
            <Select 
              placeholder="Select class"
              options={classes.map(c => ({ value: c.id, label: c.className }))} 
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="Due Date" 
                name="dueDate" 
                rules={[{ required: true, message: "Please select due date" }]}
              >
                <DatePicker style={{ width: "100%" }} placeholder="Select date" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="Max Score" 
                name="maxScore" 
                rules={[{ required: true, message: "Please enter max score" }]}
              >
                <Input type="number" placeholder="10" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} placeholder="Assignment description..." />
          </Form.Item>

          <Form.Item
            label="Attachment"
            name="file"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
          >
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button>Select File</Button>
            </Upload>
          </Form.Item>

          {selectedAssignment?.file_path && (
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                Current file:{" "}
                <a href={selectedAssignment.file_path} target="_blank" rel="noreferrer">
                  {selectedAssignment.title}
                </a>
              </Text>
            </div>
          )}
        </Form>
      </Modal>

      {/* Submissions Modal */}
      <Modal
        title={`Submissions - ${selectedAssignment?.title}`}
        open={isSubmissionsOpen}
        onCancel={() => setIsSubmissionsOpen(false)}
        footer={null}
        width={600}
      >
        {submissionsQuery.isLoading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin size="large" />
            <div style={{ marginTop: 12 }}>Loading submissions...</div>
          </div>
        ) : submissionsQuery.isError ? (
          <Alert type="error" message="Failed to load submissions" />
        ) : (
          <Table
            columns={submissionColumns}
            dataSource={submissionsQuery.data}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: "max-content" }}
          />
        )}
      </Modal>
    </div>
  );
};

export default AssignmentManagementPage;
