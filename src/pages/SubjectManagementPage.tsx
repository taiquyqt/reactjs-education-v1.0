import React, { useState, useMemo, useCallback } from 'react';
import {  Card,
  Table, Typography, Button, Space, Row, Col, Input, Modal, Form, Popconfirm, Tooltip,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, BookOutlined } from '@ant-design/icons';
import type { Subject } from '../types';
import {  useSubjects, useCreateSubject, useUpdateSubject, useDeleteSubject,
} from '../hooks/useSubjects';
import dayjs from 'dayjs';
import { useDebounce } from 'use-debounce';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Search } = Input;

const removeVietnameseTones = (str: string) =>
  str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');

const SubjectManagementPage: React.FC = () => {
  // Hooks gọi API
  const { data: subjects = [], isLoading } = useSubjects();
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();

  // State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  // Handlers
  const handleAddSubject = useCallback(() => {
    setEditingSubject(null);
    form.resetFields();
    setIsModalVisible(true);
  }, [form]);

  const handleEditSubject = useCallback(
    (subject: Subject) => {
      setEditingSubject(subject);
      form.setFieldsValue(subject);
      setIsModalVisible(true);
    },
    [form]
  );

  const handleDeleteSubject = useCallback(
    (subjectId: number) => {
      deleteSubject.mutate(subjectId);
    },
    [deleteSubject]
  );

  const handleSave = useCallback(() => {
    form.validateFields().then((values) => {
      if (editingSubject) {
        updateSubject.mutate({ subjectId: editingSubject.id, subjectData: values });
      } else {
        createSubject.mutate(values);
      }
      setIsModalVisible(false);
      form.resetFields();
    });
  }, [editingSubject, updateSubject, createSubject, form]);

  // columns typed explicitly
  const columns: ColumnsType<Subject> = useMemo(
    () => [
      {
        title: 'Subject Name',
        dataIndex: 'subjectName',
        key: 'subjectName',
        render: (text: string) => (
          <Space>
            <BookOutlined style={{ color: '#1677ff' }} />
            <span>{text}</span>
          </Space>
        ),
        ellipsis: true,
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        ellipsis: true,
      },
      {
        title: 'Created At',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (createdAt: string) => dayjs(createdAt).format('DD/MM/YYYY HH:mm'),
        width: 180,
      },
      {
        title: 'Actions',
        key: 'action',
        align: 'center',
        width: 120,
        render: (_, record: Subject) => (
          <Space size="middle">
            <Tooltip title="Edit subject">
              <Button icon={<EditOutlined />} onClick={() => handleEditSubject(record)} size="small" />
            </Tooltip>
            <Popconfirm
              title="Are you sure you want to delete this subject?"
              onConfirm={() => handleDeleteSubject(record.id)}
              okText="Yes"
              okType="danger"
              cancelText="No"
            >
              <Tooltip title="Delete subject">
                <Button icon={<DeleteOutlined />} danger size="small" />
              </Tooltip>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [handleEditSubject, handleDeleteSubject]
  );

  // filteredSubjects typed explicitly
  const filteredSubjects: Subject[] = useMemo(() => {
    const q = removeVietnameseTones(debouncedSearchTerm).toLowerCase();
    return subjects.filter((s) =>
      removeVietnameseTones(s.subjectName).toLowerCase().includes(q)
    );
  }, [subjects, debouncedSearchTerm]);

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <Title level={2} style={{ marginBottom: 16 }}>
        <Space>
          <BookOutlined style={{ color: '#0779f4' }} />
          <span>Subject Management</span>
        </Space>
      </Title>

      {/* Thống kê */}
      <Row style={{ marginBottom: 24 }} gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Space>
              <BookOutlined style={{ fontSize: 24, color: '#0779f4' }} />
              <div>
                <Text strong style={{ fontSize: 16 }}>
                  Total Subjects
                </Text>
                <Title level={3} style={{ color: '#0779f4', margin: 0 }}>
                  {subjects.length}
                </Title>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Danh sách */}
      <Card
        title={<Text strong style={{ fontSize: 16 }}>Subject List</Text>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddSubject}>
            Add New Subject
          </Button>
        }
      >
        <Row justify="space-between" style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Search
              placeholder="Search subject..."
              style={{ width: '100%' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
        </Row>

        {/* Table with explicit generic and proper rowKey */}
        <Table<Subject>
          columns={columns}
          dataSource={filteredSubjects}
          rowKey={(record) => String(record.id)}
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      {/* Modal */}
      <Modal
        destroyOnClose
        title={editingSubject ? 'Edit Subject' : 'Add New Subject'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
        okText="Save"
        okType="primary"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical" initialValues={editingSubject || {}}>
          <Form.Item
            name="subjectName"
            label="Subject Name"
            rules={[{ required: true, message: 'Please enter subject name!' }]}
          >
            <Input prefix={<BookOutlined />} />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description!' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SubjectManagementPage;
