import React, { useState } from 'react';
import {
  Card,
  Table,
  Typography,
  Button,
  Space,
  Tag,
  Select,
  DatePicker,
  message,
  Spin,
} from 'antd';
import { SyncOutlined, DownloadOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useSchedules } from '../hooks/useSchedules';
import { useAttendancesBySession } from '../hooks/useAttendances';
import type { Attendance } from '../types/Attendance';
import type { ClassScheduleSession } from '../types/Schedule';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useClasses } from '../hooks/useClasses';

const { Title, Text } = Typography;
const { Option } = Select;

const getStatusTag = (status: Attendance['status']) => {
  switch (status) {
    case 'PRESENT':
      return <Tag color="green">Present</Tag>;
    case 'ABSENT':
      return <Tag color="red">Absent</Tag>;
    case 'LATE':
      return <Tag color="gold">Late</Tag>;
    case 'EXCUSED':
      return <Tag color="blue">Excused</Tag>;
    default:
      return <Tag>{status}</Tag>;
  }
};

const AttendanceManagementPage: React.FC = () => {
  const [selectedClassId, setSelectedClassId] = useState<number | undefined>();
  const [selectedSession, setSelectedSession] = useState<number | undefined>();
  const [selectedDate, setSelectedDate] = useState<moment.Moment | null>(null);

  // Get class list
  const { classes, isLoading: loadingClasses } = useClasses();

  // Get sessions by class
  const { schedules, isLoading: loadingSchedules } = useSchedules(selectedClassId);

  // Get attendance by session
  const {
    data: attendances,
    isLoading: loadingAttendances,
    isError,
    refetch,
  } = useAttendancesBySession(selectedSession ?? 0);

  if (isError) message.error('Error while fetching attendance data');

  // Filter by date (if selected)
  const filteredData: Attendance[] =
    attendances?.filter((item) =>
      selectedDate
        ? moment.utc(item.markedAt).format('YYYY-MM-DD') === selectedDate.format('YYYY-MM-DD')
        : true
    ) ?? [];


  const sessionMap = new Map(
    schedules?.map((s: ClassScheduleSession) => [s.id, s.classId]) ?? []
  );

  const classMap = new Map(classes?.map((c) => [c.id, c.className]) ?? []);

  // Enrich attendance data with className
  const enrichedData: (Attendance & { className?: string })[] = filteredData.map((a) => {
    const session = sessionMap.get(a.sessionId);
    return {
      ...a,
      className: session ? classMap.get(session) ?? 'N/A' : 'N/A',
    };
  });

  // Refresh
  const handleRefresh = () => {
    refetch();
  };

  // Export Excel
  const handleExport = () => {
    if (enrichedData.length === 0) {
      message.warning('No data to export.');
      return;
    }

    const formattedData = enrichedData.map((record) => ({
      'Student Name': record.studentName,
      'Class': record.className,
      'Status': record.status,
      'Marked At': moment.utc(record.markedAt).format('DD/MM/YYYY HH:mm'),
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const className = classes?.find(c => c.id === selectedClassId)?.className ?? 'Attendance';
    saveAs(blob, `Attendance-Report-Class ${className}.xlsx`);
  };

  const columns = [
    { title: 'Student Name', dataIndex: 'studentName', key: 'studentName' },
    { title: 'Class', dataIndex: 'className', key: 'className' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: Attendance['status']) => getStatusTag(status),
    },
    {
      title: 'Marked At',
      dataIndex: 'markedAt',
      key: 'markedAt',
      render: (date: string) => moment.utc(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Note',
      dataIndex: 'note',
      key: 'note',
      render: (note: string | null) => note ?? '-',
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          Attendance Management
        </Title>
      </div>

      <Card>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            marginBottom: 16,
          }}
        >
          <div style={{ minWidth: 200, marginBottom: 8 }}>
            <Title level={4} style={{ margin: 0 }}>
              Attendance Records
            </Title>
            <Text type="secondary">View and manage student attendance records.</Text>
          </div>
          <Space style={{ flexWrap: 'wrap', marginBottom: 8 }}>
            <Button type="default" icon={<SyncOutlined />} onClick={handleRefresh}>
              Refresh
            </Button>
            <Button type="default" icon={<DownloadOutlined />} onClick={handleExport}>
              Export Excel
            </Button>
          </Space>
        </div>

        {/* Filters */}
        <div style={{ overflowX: 'auto', marginBottom: 16 }}>
          <Space style={{ flexWrap: 'wrap' }}>
            <Select
              placeholder="Select class"
              style={{ minWidth: 200 }}
              value={selectedClassId}
              onChange={setSelectedClassId}
              loading={loadingClasses}
              allowClear
            >
              {classes?.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.className}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Select session"
              style={{ minWidth: 300 }}
              value={selectedSession}
              onChange={setSelectedSession}
              loading={loadingSchedules}
              allowClear
              disabled={!selectedClassId}
            >
              {schedules?.map((s: ClassScheduleSession) => (
                <Option key={s.id} value={s.id}>
                  {`Date ${moment(s.sessionDate).format('DD/MM/YYYY')} - Period ${s.startPeriod}-${s.endPeriod} (${s.location})`}
                </Option>
              ))}
            </Select>

            <DatePicker
              placeholder="Select date"
              style={{ minWidth: 180 }}
              value={selectedDate}
              onChange={setSelectedDate}
            />
          </Space>
        </div>

        {/* Table */}
        <Spin spinning={loadingAttendances}>
          <div style={{ overflowX: 'auto' }}>
            <Table
              columns={columns}
              dataSource={enrichedData}
              rowKey="id"
              pagination={{ pageSize: 7 }}
              scroll={{ x: 'max-content' }} // cho bảng scroll ngang khi nhỏ màn hình
            />
          </div>
        </Spin>
      </Card>

    </div>
  );
};

export default AttendanceManagementPage;
