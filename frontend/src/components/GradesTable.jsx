import { useEffect, useState } from 'react';
import { Table, Button, Input, Alert, Space, Typography } from 'antd';
import PropTypes from 'prop-types';
import useGradesStore from '../stores/gradesStore';
import styled from 'styled-components';

const { Title } = Typography;

const StyledTable = styled(Table)`
  .ant-table {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }

  .ant-table-thead > tr > th {
    background: #fafafa;
    font-weight: 600;
    font-size: 14px;
    padding: 16px;
    border-bottom: 2px solid #f0f0f0;
  }

  .ant-table-tbody > tr > td {
    padding: 16px;
    transition: background 0.2s ease;
  }

  .ant-table-tbody > tr:hover > td {
    background: #f8f9ff;
  }

  .grade-block {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 48px;
    height: 32px;
    padding: 0 12px;
    background: #4096ff;
    color: white;
    border-radius: 6px;
    font-weight: 500;
    font-size: 15px;
    transition: all 0.2s ease;
    
    &:empty::before {
      content: '-';
      color: #999;
    }
  }

  .grade-actions {
    opacity: 0;
    transition: all 0.3s ease;
    margin-left: 12px;
  }

  .ant-table-row:hover .grade-actions {
    opacity: 1;
    transform: translateX(0);
  }
`;

const GradeInput = styled(Input)`
  width: 70px !important;
  height: 32px;
  text-align: center;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover, &:focus {
    border-color: #4096ff;
    box-shadow: 0 0 0 2px rgba(64, 150, 255, 0.1);
  }
`;

const QuickGradeButton = styled(Button)`
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
  margin: 0 4px;
  
  &.max-grade {
    background: #52c41a;
    border-color: #52c41a;
    &:hover {
      background: #389e0d;
      border-color: #389e0d;
      transform: translateY(-1px);
      box-shadow: 0 2px 6px rgba(56, 158, 13, 0.25);
    }
  }
  
  &.min-grade {
    background: #ff4d4f;
    border-color: #ff4d4f;
    &:hover {
      background: #cf1322;
      border-color: #cf1322;
      transform: translateY(-1px);
      box-shadow: 0 2px 6px rgba(207, 19, 34, 0.25);
    }
  }
`;

const EditButton = styled(Button)`
  &.ant-btn-link {
    color: #4096ff;
    font-weight: 500;
    padding: 4px 8px;
    border-radius: 4px;
    
    &:hover {
      color: #1677ff;
      background: rgba(64, 150, 255, 0.1);
    }
  }
`;

const GradesTable = ({ assignmentId, students, assignmentName }) => {
  const { grades, isLoading, error, fetchGradesByAssignment, createGrade, updateGrade } = useGradesStore();
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  useEffect(() => {
    if (assignmentId) {
      fetchGradesByAssignment(assignmentId);
    }
  }, [assignmentId, fetchGradesByAssignment]);

  const handleEdit = (record) => {
    setEditingId(record.student_id);
    setEditValues({
      ...editValues,
      [record.student_id]: record.grade?.toString() || ''
    });
  };

  const handleSave = async (record) => {
    try {
      const gradeValue = parseInt(editValues[record.student_id]);
      if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > 10) {
        throw new Error('Grade must be a number between 0 and 10');
      }

      const gradeData = {
        assignment_id: assignmentId,
        student_id: record.student_id,
        grade: gradeValue
      };

      // Ищем существующую оценку по student_id И assignment_id
      const existingGrade = grades.find(g => 
        g.student_id === record.student_id && 
        g.assignment_id === assignmentId
      );
      
      if (existingGrade && existingGrade._id) {
        await updateGrade(existingGrade._id, gradeData);
      } else {
        await createGrade(gradeData);
      }
      
      setEditingId(null);
      setEditValues({
        ...editValues,
        [record.student_id]: ''
      });
      
      await fetchGradesByAssignment(assignmentId);
    } catch (err) {
      console.error('Error saving grade:', err);
    }
  };

  const handleQuickGrade = async (record, grade) => {
    try {
      const gradeData = {
        assignment_id: assignmentId,
        student_id: record.student_id,
        grade: grade
      };

      // Ищем существующую оценку по student_id И assignment_id
      const existingGrade = grades.find(g => 
        g.student_id === record.student_id && 
        g.assignment_id === assignmentId
      );
      
      if (existingGrade && existingGrade._id) {
        await updateGrade(existingGrade._id, gradeData);
      } else {
        await createGrade(gradeData);
      }
      
      await fetchGradesByAssignment(assignmentId);
    } catch (err) {
      console.error('Error saving grade:', err);
    }
  };

  const columns = [
    {
      title: 'Student',
      dataIndex: 'student_name',
      key: 'student_name',
      width: '30%',
      render: (text, record) => (
        <span style={{ fontWeight: 500 }}>{`${record.first_name} ${record.last_name}`}</span>
      ),
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
      width: '50%',
      render: (text, record) => {
        if (editingId === record.student_id) {
          return (
            <GradeInput
              value={editValues[record.student_id] || ''}
              onChange={e => setEditValues({
                ...editValues,
                [record.student_id]: e.target.value
              })}
              onPressEnter={() => handleSave(record)}
              onBlur={() => handleSave(record)}
            />
          );
        }
        return (
          <Space size="middle">
            <span className="grade-block">
              {text || '-'}
            </span>
            <Space className="grade-actions">
              <EditButton
                type="link"
                size="small"
                onClick={() => handleEdit(record)}
              >
                Edit
              </EditButton>
              <QuickGradeButton
                type="primary"
                size="small"
                className="max-grade"
                onClick={() => handleQuickGrade(record, 10)}
              >
                10
              </QuickGradeButton>
              <QuickGradeButton
                type="primary"
                size="small"
                className="min-grade"
                onClick={() => handleQuickGrade(record, 3)}
              >
                3
              </QuickGradeButton>
            </Space>
          </Space>
        );
      },
    },
    {
      title: 'Total points',
      dataIndex: 'total_points',
      key: 'total_points',
      width: '20%',
      render: (text, record) => (
        <span>{record.grade ? `${record.grade}/10` : '-'}</span>
      ),
    },
  ];

  const tableData = students.map(student => {
    const studentGrade = grades.find(g => 
      g.student_id === student.student_id && 
      g.assignment_id === assignmentId
    );
    return {
      key: student.student_id,
      student_id: student.student_id,
      first_name: student.first_name,
      last_name: student.last_name,
      grade: studentGrade?.grade,
      assignment_id: assignmentId,
      _id: studentGrade?._id
    };
  });

  if (error) {
    return <Alert message={error} type="error" />;
  }

  return (
    <div style={{ padding: '24px' }}>
      {assignmentName && (
        <Title 
          level={4} 
          style={{ 
            marginBottom: '24px',
            fontSize: '20px',
            fontWeight: 600,
            color: '#1f1f1f'
          }}
        >
          {assignmentName}
        </Title>
      )}
      <StyledTable
        columns={columns}
        dataSource={tableData}
        pagination={false}
        size="middle"
        rowKey="student_id"
        loading={isLoading}
      />
    </div>
  );
};

GradesTable.propTypes = {
  assignmentId: PropTypes.string.isRequired,
  assignmentName: PropTypes.string,
  students: PropTypes.arrayOf(
    PropTypes.shape({
      student_id: PropTypes.string.isRequired,
      first_name: PropTypes.string.isRequired,
      last_name: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default GradesTable; 