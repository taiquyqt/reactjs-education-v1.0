import React, { useState, useMemo } from "react";
import { Card, Table, Typography, Spin, Alert, Button, Popconfirm, Select, DatePicker, Row, Col,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useActivityLogs } from "../hooks/useActivityLogs";
import type { ActivityLog } from "../types";
import { PieChart, Pie, Cell, Tooltip, AreaChart, Area, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Line,
} from "recharts";

const { Title } = Typography;
const { Option } = Select;

const CRUD_ACTIONS = ["CREATE", "UPDATE", "DELETE"];
const PIE_COLORS = ["#13c2c2", "#faad14", "#f5222d"];
const AREA_COLOR = "#722ed1";
const LINE_COLOR = "#f5222d";

const ActivityLogPage: React.FC = () => {
  const { data: activityLogs = [], isLoading, error, deleteLogs } =
    useActivityLogs();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedUser, setSelectedUser] = useState<number>();
  const [selectedAction, setSelectedAction] = useState<string>();
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);

  const handleDeleteSelected = () => {
    if (!selectedRowKeys.length) return;
    deleteLogs.mutate(selectedRowKeys as number[], {
      onSuccess: () => setSelectedRowKeys([]),
    });
  };

  // Filtered logs
  const filteredData = useMemo(
    () =>
      activityLogs.filter((log) => {
        const matchUser = !selectedUser || log.userId === selectedUser;
        const matchAction = !selectedAction || log.actionType === selectedAction;
        const matchDate =
          !selectedDate || dayjs(log.createdAt).isSame(selectedDate, "day");
        return matchUser && matchAction && matchDate;
      }),
    [activityLogs, selectedUser, selectedAction, selectedDate]
  );

  // Logs by day for AreaChart
  const logsByDayData = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => {
        const day = dayjs().subtract(6 - i, "day").format("DD/MM");
        return {
          date: day,
          activities: filteredData.filter(
            (l) => dayjs(l.createdAt).format("DD/MM") === day
          ).length,
          users: new Set(
            filteredData
              .filter((l) => dayjs(l.createdAt).format("DD/MM") === day)
              .map((l) => l.userId)
          ).size,
        };
      }),
    [filteredData]
  );

  // Logs by action for PieChart
  const logsByActionData = useMemo(
    () =>
      CRUD_ACTIONS.map((action, idx) => ({
        name: action,
        value: filteredData.filter((log) => log.actionType === action).length,
        color: PIE_COLORS[idx],
      })),
    [filteredData]
  );

  const columns: ColumnsType<ActivityLog> = [
    { title: "User Name", dataIndex: "fullName", key: "fullName" },
    { title: "Action", dataIndex: "actionType", key: "actionType" },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Time",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm:ss"),
      defaultSortOrder: "descend",
      sorter: (a, b) =>
        dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    { title: "Target Table", dataIndex: "targetTable", key: "targetTable" },
  ];

  const rowSelection = { selectedRowKeys, onChange: setSelectedRowKeys };

  if (isLoading) return <Spin spinning fullscreen tip="Loading activity logs..." />;

  if (error)
    return (
      <div style={{ padding: 24 }}>
        <Alert
          message="Data Load Error"
          description={`Failed to load activity logs: ${
            (error as Error).message
          }`}
          type="error"
          showIcon
        />
      </div>
    );

  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={{ marginBottom: 16 }}>
        Activity Logs
      </Title>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Select User"
              style={{ width: "100%" }}
              value={selectedUser}
              onChange={setSelectedUser}
              allowClear
            >
              {[
                ...new Map(activityLogs.map((l) => [l.userId, l.fullName])),
              ].map(([id, name]) => (
                <Option key={id} value={id}>
                  {name}
                </Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Select Action"
              style={{ width: "100%" }}
              value={selectedAction}
              onChange={setSelectedAction}
              allowClear
            >
              {CRUD_ACTIONS.map((a) => (
                <Option key={a} value={a}>
                  {a}
                </Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <DatePicker
              placeholder="Select Date"
              style={{ width: "100%" }}
              value={selectedDate}
              onChange={setSelectedDate}
            />
          </Col>

          <Col xs={24} sm={12} md={24} lg={6}>
            {selectedRowKeys.length > 0 && (
              <Popconfirm
                title={`Delete ${selectedRowKeys.length} selected logs?`}
                onConfirm={handleDeleteSelected}
                okText="Delete"
                cancelText="Cancel"
              >
                <Button danger block>
                  Delete Selected ({selectedRowKeys.length})
                </Button>
              </Popconfirm>
            )}
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card style={{ marginBottom: 24 }}>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: "max-content" }}
        />
      </Card>

      {/* Dashboard Charts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Logs in Last 7 Days" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={logsByDayData}>
                <defs>
                  <linearGradient id="colorActivities" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={AREA_COLOR} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={AREA_COLOR} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="activities"
                  stroke={AREA_COLOR}
                  fill="url(#colorActivities)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke={LINE_COLOR}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Action Distribution" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={logsByActionData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={120}
                  label={(props) => {
                    const { name, percent, midAngle, outerRadius, cx, cy } =
                      props;
                    const radius = outerRadius! * 1.2;
                    const x =
                      cx! + radius * Math.cos((-midAngle! * Math.PI) / 180);
                    const y =
                      cy! + radius * Math.sin((-midAngle! * Math.PI) / 180);
                    return (
                      <text
                        x={x}
                        y={y}
                        textAnchor={x > cx! ? "start" : "end"}
                        dominantBaseline="central"
                        fontSize={14}
                        fill="#000"
                      >
                        {`${name}: ${(percent! * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                >
                  {logsByActionData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ActivityLogPage;
