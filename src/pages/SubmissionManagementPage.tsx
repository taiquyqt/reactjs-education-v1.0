import React, { useState, useMemo } from 'react';
import {
  Card, Table, Typography, Button, Space, Tag, Dropdown, message,
  Input, Select, Row, Col, Modal, Popconfirm
} from 'antd';
import {
   MoreOutlined, EyeOutlined, DeleteOutlined,
  DownloadOutlined, SearchOutlined, FileTextOutlined,
  UploadOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useSubmissions } from '../hooks/useSubmissions';
import { useAssignments } from '../hooks/useAssignments';
import apiClient from '../api/apiClient';
import type { Submission } from '../types/Submissions';

const { Title, Text } = Typography;
const { Option } = Select;

const getStatusTag = (status: Submission['status']) => {
  switch (status) {
    case 'SUBMITTED': return <Tag color="blue">Đã nộp</Tag>;
    case 'GRADED': return <Tag color="green">Đã chấm</Tag>;
    default: return <Tag>{status}</Tag>;
  }
};

const SubmissionManagementPage: React.FC = () => {
  const { data: submissions = [], isLoading, isError, deleteSubmission } = useSubmissions();
  const { assignments = [] } = useAssignments();

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'SUBMITTED' | 'GRADED'>('all');
  const [assignmentFilter, setAssignmentFilter] = useState<number | 'all'>('all');
  const [detail, setDetail] = useState<Submission | null>(null);

  if (isError) message.error('Lỗi khi lấy dữ liệu nộp bài');

  const assignmentMap = useMemo(() => {
    const map: Record<number, string> = {};
    assignments.forEach(a => { map[a.id] = a.title; });
    return map;
  }, [assignments]);

  const handleView = (record: Submission) => setDetail(record);

  const handleDownload = async (id: number) => {
    const hide = message.loading('Đang tải file...', 0);
    try {
      const res = await apiClient.get(`/submissions/${id}/download`, { responseType: 'blob' });
      const blob = new Blob([res.data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `submission_${id}.zip`;
      link.click();
      hide();
      message.success('Tải file thành công');
    } catch {
      hide();
      message.error('Lỗi khi tải file');
    }
  };

  const handleDownloadMultiple = async () => {
    if (!selectedRowKeys.length) { message.warning('Chọn ít nhất 1 bài nộp để tải xuống'); return; }
    try {
      const res = await apiClient.post('/submissions/download', { ids: selectedRowKeys.map(Number) }, { responseType: 'blob' });
      const blob = new Blob([res.data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `submissions_${Date.now()}.zip`;
      link.click();
      message.success('Tải nhiều file thành công');
    } catch {
      message.error('Lỗi khi tải nhiều file');
    }
  };

  const filteredData = useMemo(() =>
    submissions.filter(s => {
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchesSearch = searchText === '' ||
        s.student.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
        (assignmentMap[s.assignmentId]?.toLowerCase().includes(searchText.toLowerCase()) ?? false);
      const matchesAssignment = assignmentFilter === 'all' || s.assignmentId === assignmentFilter;
      return matchesStatus && matchesSearch && matchesAssignment;
    }), [submissions, searchText, statusFilter, assignmentFilter, assignmentMap]);

  const total = submissions.length;
  const submitted = submissions.filter(s => s.status === 'SUBMITTED').length;
  const graded = submissions.filter(s => s.status === 'GRADED').length;

  const columns = [
    { title: 'Tên Bài tập', dataIndex: 'assignmentId', key: 'assignmentId', render: (id: number) => assignmentMap[id] || 'Không rõ' },
    { title: 'Student Name', dataIndex: ['student', 'fullName'], key: 'fullName' },
    { title: 'Submitted At', dataIndex: 'submittedAt', key: 'submittedAt', render: (d: string) => dayjs(d).format('DD/MM/YYYY HH:mm:ss') },
    { title: 'Status', dataIndex: 'status', key: 'status', render: getStatusTag },
    {
      title: 'Actions', key: 'actions',
      render: (_: unknown, record: Submission) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', icon: <EyeOutlined />, label: <span onClick={() => handleView(record)}>View Details</span> },
              { key: 'download', icon: <DownloadOutlined />, label: <span onClick={() => handleDownload(Number(record.id))}>Download</span> },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                danger: true,
                label: (
                  <Popconfirm
                    title="Are you sure you want to delete this submission?"
                    okText="Delete"
                    cancelText="Cancel"
                    okType='danger'
                    onConfirm={() => deleteSubmission(Number(record.id))}
                  >
                    <span>Xóa</span>
                  </Popconfirm>
                )
              }
            ]
          }}
          trigger={['click']}
        >
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={{ marginBottom: 24 }}>Submission Management</Title>

      {/* Cards responsive */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <FileTextOutlined style={{ fontSize: 32, color: '#db0be2' }} /> <Text strong>Total Submissions</Text>
            <Title level={4} style={{ display: 'inline-block', marginLeft: 8 }}>{total}</Title>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <UploadOutlined style={{ fontSize: 32, color: '#1677ff' }} /> <Text strong>Submitted</Text>
            <Title level={4} style={{ display: 'inline-block', marginLeft: 8 }}>{submitted}</Title>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <CheckCircleOutlined style={{ fontSize: 32, color: '#52c41a' }} /> <Text strong>Graded</Text>
            <Title level={4} style={{ display: 'inline-block', marginLeft: 8 }}>{graded}</Title>
          </Card>
        </Col>
      </Row>

      <Card>
        {/* Filters responsive */}
        <Row gutter={[12, 12]} justify="space-between" style={{ marginBottom: 16 }}>
          <Col xs={24} md="auto">
            <Space wrap>
              <Input
                prefix={<SearchOutlined />}
                placeholder="Tìm theo tên bài tập hoặc học sinh"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                allowClear
                style={{ width: 220 }}
              />
              <Select value={assignmentFilter} onChange={v => setAssignmentFilter(v)} style={{ width: 180 }}>
                <Option value="all">All Assignments</Option>
                {assignments.map(a => <Option key={a.id} value={a.id}>{a.title}</Option>)}
              </Select>
              <Select value={statusFilter} onChange={v => setStatusFilter(v)} style={{ width: 150 }}>
                <Option value="all">All Status</Option>
                <Option value="SUBMITTED">Submitted</Option>
                <Option value="GRADED">Graded</Option>
              </Select>
            </Space>
          </Col>
          <Col xs={24} md="auto">
            <Space wrap>
              <Button type="default" icon={<DownloadOutlined />} onClick={handleDownloadMultiple}>Download Multiple</Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey={r => r.id.toString()}
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Modal title="Submission Details" open={!!detail} onCancel={() => setDetail(null)} footer={null}>
        {detail && (
          <div>
            <p><b>Assignment:</b> {assignmentMap[detail.assignmentId]}</p>
            <p><b>Student:</b> {detail.student.fullName}</p>
            <p><b>Email:</b> {detail.student.email}</p>
            <p><b>Submitted At:</b> {dayjs(detail.submittedAt).format('DD/MM/YYYY HH:mm')}</p>
            <p><b>Status:</b> {getStatusTag(detail.status)}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SubmissionManagementPage;
