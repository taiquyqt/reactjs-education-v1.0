import React, { useState, useMemo } from 'react';
import {
  Card, Table, Typography, Button, Dropdown, Modal, Form, Input, InputNumber, Select, message, Spin, Alert, Radio, Popconfirm, Space,
  Row, Col,
} from 'antd';
import { AppstoreOutlined, BookOutlined, MoreOutlined, PlusOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Assignment, Class, ClassUser } from '../types';
import { useClasses } from '../hooks/useClasses';
import { useSubjects } from '../hooks/useSubjects';
import { useUsers } from '../hooks/useUsers';
import { useClassUsers } from '../hooks/useClassUsers';
import { useAssignments } from '../hooks/useAssignments';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const joinModeOptions = [
  { label: "Approval", value: "APPROVAL" },
  { label: "Auto", value: "AUTO" },
];

const ClassManagementPage: React.FC = () => {
  const [form] = Form.useForm();
  const {
    classes,
    isLoading,
    error,
    createClass,
    updateClass,
    deleteClass,
    isCreating,
    isUpdating,
    isDeleting,
  } = useClasses();

  const { data: subjects = [], isLoading: isSubjectsLoading } = useSubjects();
  const { data: users = [], isLoading: isUsersLoading } = useUsers();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [searchText, setSearchText] = useState('');

  // Student List modal
  const [isStudentModalVisible, setIsStudentModalVisible] = useState(false);
  const [selectedClassId] = useState<number | null>(null);

  // Assignments modal
  const [isAssignmentModalVisible, setIsAssignmentModalVisible] = useState(false);

  // Map lookup để tối ưu tìm kiếm
  const subjectMap = useMemo(() => {
    const map = new Map<number, string>();
    subjects.forEach(sub => map.set(sub.id, sub.subjectName));
    return map;
  }, [subjects]);

  const teacherMap = useMemo(() => {
    const map = new Map<number, string>();
    users.forEach(u => {
      if (Array.isArray(u.roles) && u.roles.some(r => r.name.toLowerCase() === 'teacher')) {
        map.set(u.id, u.full_name);
      }
    });
    return map;
  }, [users]);

  const normalize = (str: string) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const classesWithNames = useMemo(() => {
    if (!classes) return [];
    const search = normalize(searchText);

    return classes
      .map(cls => ({
        ...cls,
        subjectName: subjectMap.get(cls.subjectId) || "N/A",
        fullName: teacherMap.get(cls.teacherId) || "N/A",
      }))
      .filter(c => {
        const className = normalize(c.className);
        const subjectName = normalize(c.subjectName);
        const teacherName = normalize(c.fullName);

        return (
          className.includes(search) ||
          subjectName.includes(search) ||
          teacherName.includes(search)
        );
      });
  }, [classes, subjectMap, teacherMap, searchText]);

  if (isLoading || isSubjectsLoading || isUsersLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          message="Error loading data"
          description={`Could not load class list: ${(error as Error).message}`}
          type="error"
          showIcon
        />
      </div>
    );
  }

  const showModal = (record?: Class) => {
    setEditingClass(record || null);
    setIsModalVisible(true);
    if (record) {
      form.setFieldsValue({
        ...record,
        schoolYear: Number(record.schoolYear),
        semester: record.semester,
        joinMode: record.joinMode,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ schoolYear: dayjs().year(), semester: '', joinMode: "APPROVAL" });
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingClass(null);
    form.resetFields();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFinish = async (values: any) => {
    try {
      const payload = { ...values, semester: values.semester };
      if (editingClass) {
        await updateClass({ ...editingClass, ...payload });
        message.success('Class updated successfully');
      } else {
        await createClass(payload);
        message.success('Class created successfully');
      }
      handleCancel();
    } catch (err) {
      console.error('Error saving class:', err);
      message.error('An error occurred while saving the class.');
    }
  };

  const handleDelete = async (record: Class) => {
    if (record.id) {
      await deleteClass(record.id);
      message.success('Class deleted');
    } else {
      message.error('Could not find class ID to delete.');
    }
  };

  const columns: ColumnsType<Class & { subjectName: string; fullName: string }> = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Class Name', dataIndex: 'className', key: 'className' },
    { title: 'Subject', dataIndex: 'subjectName', key: 'subjectName' },
    { title: 'School Year', dataIndex: 'schoolYear', key: 'schoolYear' },
    { title: 'Semester', dataIndex: 'semester', key: 'semester' },
    { title: 'Teacher', dataIndex: 'fullName', key: 'fullName' },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 80,
      render: (_, record) => (
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              { key: 'edit', label: 'Edit', onClick: () => showModal(record) },
              {
                key: 'delete',
                label: (
                  <Popconfirm
                    title="Confirm class deletion"
                    description={`Are you sure you want to delete: ${record.className}?`}
                    okText="Delete"
                    okType="danger"
                    cancelText="Cancel"
                    onConfirm={() => handleDelete(record)}
                  >
                    <span style={{ color: 'red' }}>Delete</span>
                  </Popconfirm>
                ),
              },
            ],
          }}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  // ================= STUDENT LIST TABLE =================
  const StudentListTable: React.FC<{ classId: number }> = ({ classId }) => {
    const { classUsers, isLoading: isStudentsLoading, removeStudent } = useClassUsers(classId);

    const columns = [
      { title: 'Student ID', dataIndex: 'id', key: 'id' },
      { title: 'Name', dataIndex: 'fullName', key: 'fullName' },
      { title: 'Email', dataIndex: 'email', key: 'email' },
      { title: 'Joined At', dataIndex: 'joinedAt', key: 'joinedAt', render: (val: string) => new Date(val).toLocaleString() },
      {
        title: 'Action',
        key: 'action',
        fixed: 'right' as const,
        width: 80,
        render: (_: unknown, record: ClassUser) => (
          <Popconfirm
            title="Remove student?"
            onConfirm={async () => {
              await removeStudent(record.id);
              message.success('Removed successfully');
            }}
          >
            <a style={{ color: 'red' }}>Remove</a>
          </Popconfirm>
        ),
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={classUsers}
        rowKey="student_id"
        loading={isStudentsLoading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 'max-content' }}
      />
    );
  };

  // ================= ASSIGNMENTS LIST TABLE =================
  const AssignmentListTable: React.FC<{ classId: number }> = ({ classId }) => {
    const { assignments, isLoading, deleteAssignment } = useAssignments(classId);

    const columns = [
      { title: "ID", dataIndex: "id", key: "id" },
      { title: "Title", dataIndex: "title", key: "title" },
      { title: "Description", dataIndex: "description", key: "description" },
      { title: "Deadline", dataIndex: "dueDate", key: "dueDate", render: (d: string) => new Date(d).toLocaleString() },
      {
        title: "Action",
        key: "action",
        fixed: 'right' as const,
        width: 80,
        render: (_: unknown, record: Assignment) => (
          <Popconfirm
            title="Delete this assignment?"
            onConfirm={async () => {
              await deleteAssignment(record.id);
              message.success("Assignment deleted");
            }}
          >
            <a style={{ color: "red" }}>Delete</a>
          </Popconfirm>
        ),
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={assignments}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 'max-content' }}
      />
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={3} style={{ marginBottom: 24 }}>Class Management</Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Space>
              <AppstoreOutlined style={{ fontSize: 32, color: "#1890ff" }} />
              <div>
                <Text type="secondary">Total classes</Text>
                <Title level={3} style={{ margin: 0 }}>{classes?.length || 0}</Title>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Space>
              <TeamOutlined style={{ fontSize: 32, color: "#52c41a" }} />
              <div>
                <Text type="secondary">Total students</Text>
                <Title level={3} style={{ margin: 0 }}>
                  {users.filter(u => Array.isArray(u.roles) && u.roles.some(r => r.name.toLowerCase() === "student")).length}
                </Title>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Space>
              <UserOutlined style={{ fontSize: 32, color: "#faad14" }} />
              <div>
                <Text type="secondary">Total teachers</Text>
                <Title level={3} style={{ margin: 0 }}>
                  {users.filter(u => Array.isArray(u.roles) && u.roles.some(r => r.name.toLowerCase() === "teacher")).length}
                </Title>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Space>
              <BookOutlined style={{ fontSize: 32, color: "#eb2f96" }} />
              <div>
                <Text type="secondary">Total subjects</Text>
                <Title level={3} style={{ margin: 0 }}>{subjects.length}</Title>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Input.Search
            placeholder="Search class by name"
            style={{ width: '100%', maxWidth: 250 }}
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()} loading={isCreating}>
            Add Class
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={classesWithNames}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          loading={isLoading || isDeleting}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      {/* ADD / EDIT CLASS MODAL */}
      <Modal
        title={editingClass ? 'Edit Class' : 'Add New Class'}
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        okText={editingClass ? 'Update' : 'Create'}
        cancelText="Cancel"
        okType="primary"
        confirmLoading={isCreating || isUpdating}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleFinish}
          initialValues={{ schoolYear: dayjs().year(), semester: '', joinMode: "APPROVAL" }}
        >
          <Form.Item label="Class Name" name="className" rules={[{ required: true, message: 'Please enter class name' }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Description" name="description" rules={[{ required: true, message: 'Please enter class description' }]}>
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item label="School Year" name="schoolYear" rules={[{ required: true, message: 'Please enter school year' }]}>
            <InputNumber min={1900} max={2100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Semester" name="semester" rules={[{ required: true, message: 'Please select semester' }]}>
            <Radio.Group>
              <Radio value="Học kỳ 1">Semester 1</Radio>
              <Radio value="Học kỳ 2">Semester 2</Radio>
              <Radio value="Học kỳ hè">Summer</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="Subject" name="subjectId" rules={[{ required: true, message: 'Please select subject' }]}>
            <Select placeholder="Select subject">
              {subjects.map(sub => <Option key={sub.id} value={sub.id}>{sub.subjectName}</Option>)}
            </Select>
          </Form.Item>

          <Form.Item label="Teacher" name="teacherId" rules={[{ required: true, message: 'Please select teacher' }]}>
            <Select placeholder="Select teacher">
              {Array.from(teacherMap.entries()).map(([id, name]) => (
                <Option key={id} value={id}>{name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Join Mode" name="joinMode" rules={[{ required: true, message: 'Please select join mode' }]}>
            <Radio.Group>
              {joinModeOptions.map(option => (
                <Radio key={option.value} value={option.value}>{option.label}</Radio>
              ))}
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>

      {/* STUDENT LIST MODAL */}
      {isStudentModalVisible && selectedClassId && (
        <Modal
          title="Student List"
          open={isStudentModalVisible}
          onCancel={() => setIsStudentModalVisible(false)}
          footer={null}
          width={600}
        >
          <StudentListTable classId={selectedClassId} />
        </Modal>
      )}

      {/* ASSIGNMENTS MODAL */}
      {isAssignmentModalVisible && selectedClassId && (
        <Modal
          title="Assignments"
          open={isAssignmentModalVisible}
          onCancel={() => setIsAssignmentModalVisible(false)}
          footer={null}
          width={800}
        >
          <AssignmentListTable classId={selectedClassId} />
        </Modal>
      )}

    </div>
  );
};

export default ClassManagementPage;
