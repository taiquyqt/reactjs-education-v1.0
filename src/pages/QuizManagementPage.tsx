import React, { useState } from "react";
import {
  Card, Table, Typography, Button, Modal, Spin, Dropdown, Col, Row, Space,
} from "antd";
import {
  CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined,
  MoreOutlined, TeamOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";

import { useQuizzes } from "../hooks/useQuizzes";
import { useQuizSubmissions } from "../hooks/useQuizSubmissions";
import type { Quiz } from "../types";

const { Title, Text } = Typography;

const QuizManagementPage: React.FC = () => {
  const { data: quizzes = [], isLoading, error } = useQuizzes();
  const now = dayjs();

  const totalQuizzes = quizzes.length;
  const totalStudents = quizzes.reduce(
    (sum, q) => sum + (q.totalStudents || 0),
    0
  );
  const ongoing = quizzes.filter(
    (q) => dayjs(q.startDate).isBefore(now) && dayjs(q.endDate).isAfter(now)
  ).length;
  const finished = quizzes.filter((q) => dayjs(q.endDate).isBefore(now)).length;

  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [modalType, setModalType] = useState<"submissions" | null>(null);

  const selectedQuiz = quizzes.find((q) => q.id === selectedQuizId);

  const {
    data: submissions = [],
    isLoading: isLoadingSubmissions,
  } = useQuizSubmissions(
    modalType === "submissions" ? selectedQuizId || 0 : undefined
  );

  const handleOpenModal = (quizId: number) => {
    setSelectedQuizId(quizId);
    setModalType("submissions");
  };

  const handleCloseModal = () => {
    setSelectedQuizId(null);
    setModalType(null);
  };

  const columns: ColumnsType<Quiz> = [
    { title: "Quiz Title", dataIndex: "title", key: "title" },
    { title: "Time (minutes)", dataIndex: "timeLimit", key: "timeLimit" },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
      responsive: ["sm"],
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
      responsive: ["sm"],
    },
    {
      title: "Subject",
      key: "subject",
      render: (_, record: Quiz) => {
        if (!record.subject) return "-";
        if (typeof record.subject === "object") {
          return record.subject.subjectName || "-";
        }
        return record.subject;
      },
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record: Quiz) => (
        <Dropdown
          trigger={["click"]}
          menu={{
            items: [
              {
                key: "submissions",
                label: "View Submissions",
                onClick: () => handleOpenModal(record.id),
              },
            ],
          }}
        >
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  if (isLoading)
    return (
      <div style={{ textAlign: "center", margin: "50px auto" }}>
        <Spin size="large" />
        <div style={{ marginTop: 12 }}>Loading data...</div>
      </div>
    );


  if (error)
    return (
      <Text type="danger">
        Error loading data: {(error as Error).message}
      </Text>
    );

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Quiz Management</Title>

      {/* Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Space align="center">
              <FileTextOutlined style={{ fontSize: 32, color: "#1890ff" }} />
              <div>
                <Text type="secondary">Total Quizzes</Text>
                <Title level={3} style={{ margin: 0 }}>
                  {totalQuizzes}
                </Title>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Space align="center">
              <TeamOutlined style={{ fontSize: 32, color: "#722ed1" }} />
              <div>
                <Text type="secondary">Total Students</Text>
                <Title level={3} style={{ margin: 0 }}>
                  {totalStudents}
                </Title>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Space align="center">
              <ClockCircleOutlined style={{ fontSize: 32, color: "#fa8c16" }} />
              <div>
                <Text type="secondary">Ongoing</Text>
                <Title level={3} style={{ margin: 0 }}>
                  {ongoing}
                </Title>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Space align="center">
              <CheckCircleOutlined style={{ fontSize: 32, color: "#52c41a" }} />
              <div>
                <Text type="secondary">Finished</Text>
                <Title level={3} style={{ margin: 0 }}>
                  {finished}
                </Title>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Quiz Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={quizzes}
          rowKey="id"
          scroll={{ x: "max-content" }}
        />
      </Card>

      {/* Submissions Modal */}
      <Modal
        open={!!modalType}
        title={`Submissions - ${selectedQuiz?.title || ""}`}
        onCancel={handleCloseModal}
        footer={null}
        style={{ top: 20 }}
        width={600}
      >
        {isLoadingSubmissions ? (
          <Spin />
        ) : submissions.length ? (
          <Table
            columns={[
              {
                title: "Student Name",
                dataIndex: "studentName",
                key: "studentId",
                render: (val: string | number) => `${val}`,
              },
              {
                title: "Submitted At",
                dataIndex: "submittedAt",
                key: "submittedAt",
                render: (date: string) =>
                  dayjs(date).format("DD/MM/YYYY HH:mm"),
              },
              { title: "Score", dataIndex: "score", key: "score" },
            ]}
            dataSource={submissions}
            rowKey="id"
            pagination={false}
            scroll={{ x: "max-content" }}
          />
        ) : (
          <Text>No submissions yet</Text>
        )}
      </Modal>
    </div>
  );
};

export default QuizManagementPage;
