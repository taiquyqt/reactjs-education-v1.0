import { Card, Typography, Row, Col, Space, Skeleton } from "antd";
import {
  PieChart, Pie, Cell, Tooltip, BarChart, XAxis, YAxis, Bar, Legend, ResponsiveContainer, AreaChart, CartesianGrid, Area, Line,
} from "recharts";
import { useUsers } from "../hooks/useUsers";
import { useClasses } from "../hooks/useClasses";
import { useAssignments } from "../hooks/useAssignments";
import { useQuizzes } from "../hooks/useQuizzes";
import { useActivityLogs } from "../hooks/useActivityLogs";
import { useSubmissions } from "../hooks/useSubmissions";
import { useSubjects } from "../hooks/useSubjects";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isBetween from "dayjs/plugin/isBetween";

import { theme } from "antd";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { FileTextOutlined, ProfileOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";

dayjs.extend(relativeTime);
dayjs.extend(isBetween);

const { Title, Text } = Typography;

interface Submission {
  status: string;
}

const DashboardPage = () => {
  const usersQuery = useUsers();
  const classesQuery = useClasses();
  const assignmentsQuery = useAssignments();
  const quizzesQuery = useQuizzes();
  const logsQuery = useActivityLogs();
  const submissionsQuery = useSubmissions();
  const subjectsQuery = useSubjects();

  const { isDarkMode } = useContext(ThemeContext);
  const { token } = theme.useToken();

  const users = usersQuery.data ?? [];
  const classes = classesQuery.data ?? [];
  const assignments = assignmentsQuery.data ?? [];
  const quizzes = quizzesQuery.data ?? [];
  const activityLogs = logsQuery.data ?? [];
  const submissions: Submission[] = submissionsQuery.data ?? [];
  const subjects = subjectsQuery.data ?? [];

  const getSubjectName = (classId: number) => {
    const classObj = classes.find(c => c.id === classId);
    if (!classObj) return "N/A";
    const subjectObj = subjects.find(s => s.id === classObj.subjectId);
    return subjectObj ? subjectObj.subjectName : "N/A";
  };

  // =================== Data Calculation ===================
  const userRolesData = [
    { name: "Teacher", value: users.filter(u => u.roles?.some(r => r.name === "teacher")).length },
    { name: "Student", value: users.filter(u => u.roles?.some(r => r.name === "student")).length },
    { name: "Admin", value: users.filter(u => u.roles?.some(r => r.name === "admin")).length },
  ];

  const assignmentsByClassData = classes.map(c => ({
    name: c.className,
    count: assignments.filter(a => a.classId === c.id).length,
  }));

  // =================== Activity Trend Data (14 days) ===================
  const activityTrendData = Array.from({ length: 14 }).map((_, i) => {
    const date = dayjs().subtract(13 - i, "day").format("DD/MM");
    return {
      date,
      activities: activityLogs.filter(l => dayjs(l.createdAt).format("DD/MM") === date).length,
      users: new Set(
        activityLogs.filter(l => dayjs(l.createdAt).format("DD/MM") === date).map(l => l.userId)
      ).size,
    };
  });

  const colors = ["#722ed1", "#1890ff", "#52c41a", "#fa8c16"];

  // =================== Metrics ===================
  // Tháng calendar
  const now = dayjs();
  const startOfThisMonth = now.startOf("month");
  const startOfLastMonth = now.subtract(1, "month").startOf("month");
  const endOfLastMonth = startOfThisMonth.subtract(1, "day");

  const usersThisMonth = users.filter(u =>
    dayjs(u.createdAt).isBetween(startOfThisMonth, now, null, '[]')
  ).length;

  const usersLastMonth = users.filter(u =>
    dayjs(u.createdAt).isBetween(startOfLastMonth, endOfLastMonth, null, '[]')
  ).length;

  const usersChange = usersLastMonth > 0
    ? ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100
    : 0;

  const activeClasses = classes.filter(
    c => assignments.some(a => a.classId === c.id) || quizzes.some(q => q.classId === c.id)
  ).length;

  const newClassesThisSemester = classes.filter(c => dayjs(c.createdAt).isAfter(dayjs().subtract(6, "month"))).length;

  const submittedAssignments = submissions.filter(s => s.status === "SUBMITTED").length;
  const gradedAssignments = submissions.filter(s => s.status === "GRADED").length;
  const upcomingQuizzes = quizzes.filter(q => dayjs(q.startDate).isAfter(dayjs())).length;

  // =================== Recent Activities ===================
  const recentActivities = activityLogs
    .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf())
    .slice(0, 5)
    .map(log => ({
      id: log.id,
      action: log.actionType + (log.targetTable ? ` ${log.targetTable}` : ""),
      user: log.fullName || "Unknown",
      time: dayjs(log.createdAt).fromNow(),
      type: log.targetTable?.toLowerCase() || "other",
    }));

  // =================== Upcoming Deadlines ===================
  const upcomingDeadlines = assignments
    .filter(a => dayjs(a.dueDate).isAfter(dayjs()))
    .sort((a, b) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf())
    .slice(0, 5);

  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        System Overview
      </Title>

      {/* Metric Cards */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card title="Total Users" extra={<Link to="/users">View Details</Link>}>
            <Space>
              <UserOutlined style={{ fontSize: 36, color: "#1890ff" }} />
              <div>
                <Title level={3} style={{ margin: 0 }}>
                  {users.length}
                </Title>
                <Text type="secondary">
                  {usersChange >= 0 ? `+${usersChange.toFixed(1)}%` : `${usersChange.toFixed(1)}%`} from last month
                </Text>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card title="Active Classes" extra={<Link to="/classes">View Details</Link>}>
            <Space>
              <TeamOutlined style={{ fontSize: 36, color: "#52c41a" }} />
              <div>
                <Title level={3} style={{ margin: 0 }}>
                  {activeClasses}
                </Title>
                <Text type="secondary">+{newClassesThisSemester} new classes this semester</Text>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card title="Total Assignments" extra={<Link to="/assignments">View Details</Link>}>
            <Space>
              <FileTextOutlined style={{ fontSize: 36, color: "#fa8c16" }} />
              <div>
                <Title level={3} style={{ margin: 0 }}>
                  {assignments.length}
                </Title>
                <Text type="secondary">
                  {submittedAssignments} submitted • {gradedAssignments} graded
                </Text>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card title="Total Quizzes" extra={<Link to="/quizzes">View Details</Link>}>
            <Skeleton loading={quizzesQuery.isLoading} active>

              <Space>
                <ProfileOutlined style={{ fontSize: 36, color: "#eb2f96" }} />
                <div>
                  <Title level={3} style={{ margin: 0 }}>
                    {quizzes.length}
                  </Title>
                  <Text type="secondary">{upcomingQuizzes} upcoming</Text>
                </div>
              </Space>
            </Skeleton>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} md={8} lg={8}>
          <Card title="Role Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart key={isDarkMode ? "dark" : "light"}>
                <Pie
                  data={userRolesData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={120}
                  labelLine
                  label={({ name, percent, midAngle, cx, cy, outerRadius }) => {
                    const radius = outerRadius! * 1.2;
                    const x = cx! + radius * Math.cos((-midAngle! * Math.PI) / 180);
                    const y = cy! + radius * Math.sin((-midAngle! * Math.PI) / 180);
                    return (
                      <text
                        x={x}
                        y={y}
                        textAnchor={x > cx! ? "start" : "end"}
                        dominantBaseline="central"
                        fontSize={14}
                        fill={token.colorText}
                      >
                        {`${name}: ${(percent! * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                >
                  {userRolesData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={["#1890ff", "#52c41a", "#f5222d"][index % 3]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title="Activity Trend (14 Days)" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={activityTrendData}>
                <defs>
                  <linearGradient id="colorActivities" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors[0]} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={colors[0]} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="activities" stroke={colors[0]} fillOpacity={1} fill="url(#colorActivities)" strokeWidth={2} />
                <Line type="monotone" dataKey="users" stroke={colors[2]} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Recent Activities & Upcoming Deadlines */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12}>
          <Card title="Recent Activities">
            <div className="space-y-2">
              {recentActivities.map(activity => (
                <div key={activity.id} style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <Text strong>{activity.action}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      by {activity.user}
                    </Text>
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {activity.time}
                  </Text>
                </div>
              ))}
              {recentActivities.length === 0 && <Text type="secondary">No recent activities</Text>}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12}>
          <Card title="Upcoming Deadlines">
            <div className="space-y-3">
              {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map(assignment => (
                  <div
                    key={assignment.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: 1.5,
                      borderRadius: 6,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{`Assignment ${assignment.id}: ${assignment.title}`}</div>
                      <div style={{ color: "#555", fontSize: 12 }}>{` ${classes.find(c => c.id === assignment.classId)?.className || "N/A"} - ${getSubjectName(assignment.classId)}`}</div>
                    </div>
                    <div style={{ color: "#888", fontSize: 12 }}>
                      {dayjs(assignment.dueDate).format("DD/MM/YYYY")}
                    </div>
                  </div>
                ))
              ) : (
                <Text type="secondary">No upcoming deadlines</Text>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Assignments by Class Chart */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12}>
          <Card title="Assignments by Class">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={assignmentsByClassData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#1890ff" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
