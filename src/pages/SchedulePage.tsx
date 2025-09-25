import React, { useState } from 'react';
import {
  Tabs, Table, Modal, Form, Input, Select, Card, Button, Popconfirm, Row, Col, Typography, Space,
  Tooltip, DatePicker,
} from 'antd';
import {
  CalendarOutlined, ClockCircleOutlined, CheckCircleOutlined, EditOutlined, DeleteOutlined,
} from '@ant-design/icons';
import { useClasses } from '../hooks/useClasses';
import { useSchedules } from '../hooks/useSchedules';
import { usePatterns } from '../hooks/usePatterns';
import { useLocations } from '../hooks/useLocations';
import { useUsers } from '../hooks/useUsers';
import type { ClassSchedulePattern, ClassSchedulePatternCreateDTO } from '../types/Pattern';
import type { ClassScheduleSession } from '../types/Schedule';
import type { Location, User } from '../types';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

const dayOfWeekOptions = [
  { label: 'Thứ Hai', value: 'MONDAY' },
  { label: 'Thứ Ba', value: 'TUESDAY' },
  { label: 'Thứ Tư', value: 'WEDNESDAY' },
  { label: 'Thứ Năm', value: 'THURSDAY' },
  { label: 'Thứ Sáu', value: 'FRIDAY' },
  { label: 'Thứ Bảy', value: 'SATURDAY' },
  { label: 'Chủ Nhật', value: 'SUNDAY' },
];

const periodTimes: Record<number, string> = {
  1: "07:00", 2: "08:00", 3: "09:00", 4: "10:00", 5: "11:00",
  6: "13:00", 7: "14:00", 8: "15:00", 9: "16:00", 10: "17:00",
};

const WeeklyTimetableView: React.FC<{ sessions: ClassScheduleSession[] }> = ({ sessions }) => {
  const [currentWeek, setCurrentWeek] = useState(dayjs());
  const periods = Array.from({ length: 10 }, (_, i) => i + 1);

  const startOfWeek = currentWeek.startOf("week").add(1, "day"); // Monday
  const endOfWeek = startOfWeek.add(6, "day");

  const weekSessions = sessions.filter(s => {
    const date = dayjs(s.sessionDate);
    return date.isAfter(startOfWeek.subtract(1, "day")) && date.isBefore(endOfWeek.add(1, "day"));
  });

  const getDaySessions = (dayIndex: number) =>
    weekSessions.filter(s => {
      const date = dayjs(s.sessionDate);
      const weekday = date.day() === 0 ? 7 : date.day();
      return weekday === dayIndex + 1;
    });

  return (
    <Card
      title="Weekly Timetable"
      style={{ marginTop: 16 }}
      extra={
        <Space>
          <Button onClick={() => setCurrentWeek(prev => prev.subtract(1, "week"))}>⬅ Prev</Button>
          <Text strong>
            {startOfWeek.format("DD/MM")} - {endOfWeek.format("DD/MM/YYYY")}
          </Text>
          <Button onClick={() => setCurrentWeek(prev => prev.add(1, "week"))}>Next ➡</Button>
        </Space>
      }
    >
      <div style={{ overflowX: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: `100px repeat(6, minmax(120px, 1fr))`, minWidth: 800 }}>
          <div />
          {Array.from({ length: 6 }, (_, i) => {
            const d = startOfWeek.add(i, "day");
            return (
              <div key={i} style={{ textAlign: "center", fontWeight: 600 }}>
                {`Thứ ${i + 2}`} <br /> ({d.format("DD/MM")})
              </div>
            );
          })}

          {periods.map(p => (
            <React.Fragment key={p}>
              <div style={{ border: "1px solid #eee", padding: 6, fontWeight: 500, height: 60 }}>
                Tiết {p} <br />
                <span style={{ fontSize: 12, color: "#888" }}>{periodTimes[p]}</span>
              </div>

              {Array.from({ length: 6 }, (_, dIdx) => {
                const sessionsOfDay = getDaySessions(dIdx);
                const session = sessionsOfDay.find(s => s.startPeriod === p);

                if (session) {
                  const span = session.endPeriod - session.startPeriod + 1;
                  return (
                    <div key={`${dIdx}-${p}`} style={{ border: "1px solid #eee", gridRow: `span ${span}`, height: 60 * span, padding: 4 }}>
                      <Card size="small" style={{ height: "100%", backgroundColor: '#39a9d3' }}>
                        <br />{session.location}
                      </Card>
                    </div>
                  );
                }

                const occupied = sessionsOfDay.some(s => s.startPeriod < p && s.endPeriod >= p);
                if (occupied) return null;

                return <div key={`${dIdx}-${p}`} style={{ border: "1px solid #eee", height: 60 }} />;
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </Card>
  );
};

const SchedulePage: React.FC = () => {
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedPatternClassId, setSelectedPatternClassId] = useState<number | null>(null);

  const { classes } = useClasses();
  const { data: users } = useUsers();
  const { locations, createLocation, updateLocation, deleteLocation } = useLocations();
  const { patterns, createPatterns, updatePatterns, deletePattern, isCreating, isUpdating, isDeleting } = usePatterns();
  const { schedules = [] } = useSchedules(selectedClassId ?? undefined);

  const [patternModalOpen, setPatternModalOpen] = useState(false);
  const [editingPattern, setEditingPattern] = useState<ClassSchedulePattern | null>(null);
  const [patternForm] = Form.useForm();

  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [locationForm] = Form.useForm();

  const teachers: User[] = users?.filter(u => u.roles.some(r => r.name === 'teacher')) || [];

  // Dashboard
  const totalPatterns = patterns?.length || 0;
  const activePatterns = patterns?.filter(p => p.active)?.length || 0;
  const classesWithPatterns = new Set(patterns?.map(p => p.classId)).size;

  const filteredSchedules = selectedClassId ? schedules?.filter(s => s.classId === selectedClassId) : [];
  const filteredPatterns = selectedPatternClassId
    ? patterns.filter(p => p.classId === selectedPatternClassId)
    : patterns;

  const patternColumns = [
    { title: 'Class', dataIndex: 'classId', render: (id: number) => classes?.find(c => c.id === id)?.className || 'N/A' },
    { title: 'Day', dataIndex: 'dayOfWeek' },
    {
      title: 'Teacher',
      render: (_: unknown, record: ClassSchedulePattern) => {
        const cls = classes?.find(c => c.id === record.classId);
        return cls?.fullName || 'N/A';
      }
    },
    {
      title: 'Room',
      render: (_: unknown, record: ClassSchedulePattern) => record.location || 'N/A'
    },
    { title: 'Start Period', dataIndex: 'startPeriod' },
    { title: 'End Period', dataIndex: 'endPeriod' },
    {
      title: 'Action',
      render: (_: unknown, record: ClassSchedulePattern) => (
        <Space size="middle">
          <Tooltip title="Edit pattern">
            <EditOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => {
                setEditingPattern(record);
                patternForm.setFieldsValue({
                  ...record,
                  teacherId: classes?.find(c => c.id === record.classId)?.teacherId,
                  locationId: record.location,
                  startDate: dayjs(record.startDate),
                  endDate: dayjs(record.endDate),
                });
                setPatternModalOpen(true);
              }}
            />
          </Tooltip>
          <Popconfirm title="Are you sure you want to delete this pattern?" onConfirm={() => deletePattern(record.id)}>
            <Tooltip title="Delete pattern">
              <DeleteOutlined style={{ color: 'red', cursor: 'pointer' }} />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const locationColumns = [
    { title: 'Room Name', dataIndex: 'roomName' },
    { title: 'Description', dataIndex: 'description' },
    {
      title: 'Action',
      render: (_: unknown, record: Location) => (
        <Space size="middle">
          <Tooltip title="Edit room">
            <EditOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => { setEditingLocation(record); locationForm.setFieldsValue(record); setLocationModalOpen(true); }}
            />
          </Tooltip>
          <Popconfirm title="Are you sure you want to delete this room?" onConfirm={() => deleteLocation(record.id)}>
            <Tooltip title="Delete room">
              <DeleteOutlined style={{ color: 'red', cursor: 'pointer' }} />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Schedule Management</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Space align="center">
              <CalendarOutlined style={{ fontSize: 32, color: '#1890ff' }} />
              <div>
                <Text type="secondary">Total Patterns</Text>
                <Title level={3} style={{ margin: 0 }}>{totalPatterns}</Title>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Space align="center">
              <CheckCircleOutlined style={{ fontSize: 32, color: '#52c41a' }} />
              <div>
                <Text type="secondary">Active Patterns</Text>
                <Title level={3} style={{ margin: 0 }}>{activePatterns}</Title>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Space align="center">
              <ClockCircleOutlined style={{ fontSize: 32, color: '#faad14' }} />
              <div>
                <Text type="secondary">Classes with Patterns</Text>
                <Title level={3} style={{ margin: 0 }}>{classesWithPatterns}</Title>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="1">
        {/* Pattern Management */}
        <TabPane tab="Pattern Management" key="1">
          <Select
            placeholder="Filter by Class (Pattern)"
            value={selectedPatternClassId ?? undefined}
            onChange={(val) => setSelectedPatternClassId(val)}
            style={{ width: 220, marginBottom: 16 }}
            options={[
              { label: 'All', value: null },
              ...(classes?.map(c => ({ label: c.className, value: c.id })) || [])
            ]}
            allowClear
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <Button type="primary" onClick={() => { setPatternModalOpen(true); patternForm.resetFields(); }}>
              Add Pattern
            </Button>
          </div>

          <Table
            dataSource={filteredPatterns}
            columns={patternColumns}
            rowKey="id"
            loading={isCreating || isUpdating || isDeleting}
            scroll={{ x: 900 }} // responsive
          />

          <Modal
            title={editingPattern ? 'Edit Pattern' : 'Add Pattern'}
            open={patternModalOpen}
            onCancel={() => { setPatternModalOpen(false); setEditingPattern(null); patternForm.resetFields(); }}
            okText="Save"
            cancelText="Cancel"
            onOk={async () => {
              const values = await patternForm.validateFields();
              const payload: ClassSchedulePatternCreateDTO = {
                classId: values.classId,
                startDate: values.startDate.format('YYYY-MM-DD'),
                endDate: values.endDate.format('YYYY-MM-DD'),
                slots: values.slots ? values.slots : [
                  {
                    dayOfWeek: values.dayOfWeek,
                    startPeriod: values.startPeriod,
                    endPeriod: values.endPeriod,
                    locationId: values.locationId,
                  }
                ]
              };
              if (editingPattern) await updatePatterns({ ...editingPattern, ...payload });
              else await createPatterns(payload);

              setPatternModalOpen(false);
              setEditingPattern(null);
              patternForm.resetFields();
            }}
          >
            <Form form={patternForm} layout="vertical">
              <Form.Item name="classId" label="Class" rules={[{ required: true, message: 'Chọn lớp' }]}>
                <Select options={classes?.map(c => ({ label: c.className, value: c.id })) || []} />
              </Form.Item>

              <Form.Item name="teacherId" label="Teacher" rules={[{ required: true, message: 'Chọn giáo viên' }]}>
                <Select options={teachers.map(t => ({ label: t.full_name, value: t.id }))} />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="startDate" label="Start Date" rules={[{ required: true, message: 'Chọn ngày bắt đầu' }]}>
                    <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="endDate" label="End Date" rules={[{ required: true, message: 'Chọn ngày kết thúc' }]}>
                    <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="dayOfWeek" label="Day of Week" rules={[{ required: true, message: 'Chọn thứ' }]}>
                <Select options={dayOfWeekOptions} />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="startPeriod" label="Start Period" rules={[{ required: true, message: 'Nhập tiết bắt đầu' }]}>
                    <Input type="number" min={1} max={10} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="endPeriod" label="End Period" rules={[{ required: true, message: 'Nhập tiết kết thúc' }]}>
                    <Input type="number" min={1} max={10} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="locationId" label="Room" rules={[{ required: true, message: 'Chọn phòng' }]}>
                <Select options={locations?.map(l => ({ label: l.roomName, value: l.id })) || []} />
              </Form.Item>
            </Form>
          </Modal>
        </TabPane>

        {/* Schedule Management */}
        <TabPane tab="Schedule Management" key="2">
          <Select
            placeholder="Select Class to View Schedule"
            value={selectedClassId ?? undefined}
            onChange={(val) => setSelectedClassId(val)}
            style={{ width: 220, marginBottom: 16 }}
            options={classes?.map(c => ({ label: c.className, value: c.id })) || []}
            allowClear
          />
          {selectedClassId ? <WeeklyTimetableView sessions={filteredSchedules} /> : <Text type="secondary">Chọn một lớp để xem lịch học</Text>}
        </TabPane>

        {/* ClassRoom */}
        <TabPane tab="ClassRoom" key="3">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <Button type="primary" onClick={() => { setLocationModalOpen(true); locationForm.resetFields(); }}>Add Room</Button>
          </div>
          <Table dataSource={locations || []} columns={locationColumns} rowKey="id" scroll={{ x: 600 }} />

          <Modal
            title={editingLocation ? 'Edit Room' : 'Add Room'}
            open={locationModalOpen}
            onCancel={() => { setLocationModalOpen(false); setEditingLocation(null); locationForm.resetFields(); }}
            okText="Save"
            cancelText="Cancel"
            onOk={async () => {
              const values = await locationForm.validateFields();
              if (editingLocation) await updateLocation({ id: editingLocation.id, data: values });
              else await createLocation(values);
              setLocationModalOpen(false);
              setEditingLocation(null);
              locationForm.resetFields();
            }}
          >
            <Form form={locationForm} layout="vertical">
              <Form.Item name="roomName" label="Room Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="description" label="Description">
                <Input.TextArea />
              </Form.Item>
            </Form>
          </Modal>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SchedulePage;
