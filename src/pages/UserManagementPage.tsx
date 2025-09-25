import React, { useCallback, useMemo, useState } from "react";
import {
  App,
  Card,
  Table,
  Typography,
  Button,
  Space,
  Tag,
  Row,
  Col,
  Spin,
  Alert,
  Tabs,
  Popconfirm,
  Modal,
  Form,
  Input,
  Checkbox,
  Select,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  UserOutlined,
  TeamOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { User, Role } from "../types/User";
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from "../hooks/useUsers";

const { Title, Text } = Typography;

const allRoles: Role[] = [
  { id: 1, name: "student" },
  { id: 2, name: "teacher" },
  { id: 3, name: "admin" },
];

const availableRolesOptions = allRoles.map((role) => ({
  label: role.name,
  value: role.name,
}));

const UserManagementPage: React.FC = () => {
  const { message } = App.useApp();

  const { data: users, isLoading, error, refetch } = useUsers();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const [searchText, setSearchText] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const openModal = useCallback(
    (user?: User) => {
      setEditingUser(user || null);
      setModalVisible(true);

      if (user) {
        form.setFieldsValue({
          full_name: user.full_name,
          username: user.username,
          email: user.email,
          roles: user.roles.map((r) => r.name),
          password: "",
        });
      } else {
        form.resetFields();
      }
    },
    [form]
  );

  const closeModal = useCallback(() => setModalVisible(false), []);

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();

      const rolesWithIds = allRoles
        .filter((role) => values.roles.includes(role.name))
        .map((role) => ({ id: role.id, name: role.name }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = {
        username: values.username,
        full_name: values.full_name,
        email: values.email,
        roles: rolesWithIds.map((r) => r.id),
      };

      if (!editingUser) {
        payload.password = values.password;
      } else if (values.password) {
        payload.password = values.password;
      }

      if (editingUser && editingUser.id) {
        await updateMutation.mutateAsync({
          userId: editingUser.id,
          userData: payload,
        });
        message.success("User updated successfully");
      } else {
        await createMutation.mutateAsync(payload);
        message.success("User created successfully");
      }

      closeModal();
      refetch();
    } catch (err) {
      console.error("Error submitting user:", err);
      message.error(editingUser ? "Failed to update user" : "Failed to create user");
    }
  }, [form, editingUser, updateMutation, createMutation, refetch, message, closeModal]);

  const handleDeleteUser = useCallback(
    (userId: number) => {
      if (!userId) return;
      deleteMutation.mutate(userId, {
        onSuccess: () => {
          message.success("User deleted successfully");
          refetch();
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (err: any) => {
          if (err?.response?.data?.errors?.[0]?.includes("foreign key")) {
            message.error("Cannot delete user: still linked to a class");
          } else {
            message.error(err.message || "Failed to delete user");
          }
          console.error("Delete error:", err);
        },
      });
    },
    [deleteMutation, refetch, message]
  );

  const columns: ColumnsType<User> = useMemo(
    () => [
      { title: "ID", dataIndex: "id", key: "id", width: 80 },
      {
        title: "Full Name",
        dataIndex: "full_name",
        key: "full_name",
        render: (text: string, record: User) => text || record.username,
      },
      { title: "Email", dataIndex: "email", key: "email" },
      {
        title: "Roles",
        dataIndex: "roles",
        key: "roles",
        render: (roles: Role[]) => (
          <Space wrap>
            {roles.map((r, idx) => (
              <Tag
                key={r.id ?? idx} // ✅ fallback key nếu id undefined
                color={r.name === "teacher" ? "blue" : r.name === "admin" ? "red" : "green"}
              >
                {r.name}
              </Tag>
            ))}
          </Space>
        ),
      },
      { title: "Username", dataIndex: "username", key: "username" },
      {
        title: "Actions",
        key: "actions",
        render: (_, record) => (
          <Space>
            <Tooltip title="Edit user">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => openModal(record)}
              />
            </Tooltip>
            <Popconfirm
              title="Are you sure you want to delete this user?"
              onConfirm={() => handleDeleteUser(record.id)}
              okText="Yes"
              cancelText="No"
              okType="danger"
            >
              <Tooltip title="Delete user">
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          </Space>
        ),
        width: 120,
      },
    ],
    [handleDeleteUser, openModal]
  );

  const filteredUsers = useMemo(() => {
    return users?.filter((user) => {
      const matchSearch =
        user.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchText.toLowerCase());

      const matchRole =
        selectedRoles.length === 0 ||
        user.roles.some((r) => selectedRoles.includes(r.name));

      return matchSearch && matchRole;
    });
  }, [users, searchText, selectedRoles]);

  const totalUsers = users?.length || 0;
  const totalTeachers =
    users?.filter((u) => u.roles.some((r) => r.name === "teacher")).length || 0;
  const totalStudents =
    users?.filter((u) => u.roles.some((r) => r.name === "student")).length || 0;

  if (isLoading) {
    return (
      <Spin tip="Loading data...">
        <div style={{ height: 200 }} />
      </Spin>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error loading data"
        description={(error as Error).message}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Summary cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Space align="center">
              <UserOutlined style={{ fontSize: 32, color: "#1890ff" }} />
              <div>
                <Text type="secondary">Total Users</Text>
                <Title level={3} style={{ margin: 0 }}>
                  {totalUsers}
                </Title>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Space align="center">
              <TeamOutlined style={{ fontSize: 32, color: "#1890ff" }} />
              <div>
                <Text type="secondary">Total Teachers</Text>
                <Title level={3} style={{ margin: 0 }}>
                  {totalTeachers}
                </Title>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Space align="center">
              <TeamOutlined style={{ fontSize: 32, color: "#52c41a" }} />
              <div>
                <Text type="secondary">Total Students</Text>
                <Title level={3} style={{ margin: 0 }}>
                  {totalStudents}
                </Title>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Tabs
        defaultActiveKey="table"
        items={[
          {
            key: "table",
            label: "User Management Table",
            children: (
              <Card
                title={
                  <div>
                    <div style={{ fontWeight: "bold" }}>User List</div>
                    <div style={{ fontSize: 12, color: "gray" }}>

                      Manage all users in the system
                    </div>
                  </div>
                }
                extra={
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => openModal()}
                  >
                    Add User
                  </Button>
                }
              >
                {/* Bộ lọc responsive */}
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%", marginBottom: 16 }}
                >
                  <Space wrap style={{ width: "100%" }}>
                    <Input
                      prefix={<SearchOutlined />}
                      placeholder="Search by name, email, username"
                      allowClear
                      onChange={(e) => setSearchText(e.target.value)}
                      style={{ minWidth: 200, flex: 1 }}
                    />
                    <Select
                      mode="multiple"
                      allowClear
                      placeholder="Filter by role"
                      onChange={setSelectedRoles}
                      options={availableRolesOptions}
                      style={{ minWidth: 200, flex: 1 }}
                    />
                  </Space>
                </Space>

                {/* Bảng người dùng */}
                <Table
                  columns={columns}
                  dataSource={filteredUsers}
                  rowKey={(record) => record.id ?? record.username} // ✅ fallback key
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: "max-content" }}
                />
              </Card>
            ),
          },
        ]}
      />

      {/* Modal add/edit */}
      <Modal
        open={modalVisible}
        title={editingUser ? "Edit User" : "Add User"}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText="Save"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="full_name"
            label="Full Name"
            rules={[{ required: true, message: "This field is required" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "This field is required" }]}
          >
            <Input autoComplete="username" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "This field is required" },
              { type: "email", message: "Invalid email address" },
            ]}
          >
            <Input autoComplete="email" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={
              editingUser
                ? []
                : [
                  { required: true, message: "Password is required" },
                  {
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                    message:
                      "Password must contain at least one uppercase, one lowercase, and one digit",
                  },
                ]
            }
          >
            <Input.Password
              placeholder={
                editingUser
                  ? "Leave empty to keep current password"
                  : "Enter password"
              }
              autoComplete={editingUser ? "current-password" : "new-password"}
            />
          </Form.Item>

          <Form.Item
            name="roles"
            label="Roles"
            rules={[{ required: true, message: "This field is required" }]}
          >
            <Checkbox.Group options={availableRolesOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
