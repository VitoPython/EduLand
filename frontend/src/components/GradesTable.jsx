import { useEffect, useState, useCallback } from 'react';
import { Table, Button, Input, Alert, Space, Typography, Modal, Spin } from 'antd';
import PropTypes from 'prop-types';
import useGradesStore from '../stores/gradesStore';
import styled from 'styled-components';
import api from '../services/api';
import { useAuth } from "@clerk/clerk-react";
import { CodeBlock, atomOneDark } from 'react-code-blocks';

const { Title, Text } = Typography;

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

const CodeModalContent = styled.div`
  max-height: 70vh;
  overflow-y: auto;
  border-radius: 8px;
  margin-bottom: 20px;
  
  pre {
    margin: 0;
    border-radius: 8px;
  }
  
  /* Стили для CodeBlock */
  .code-container {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  }
  
  /* Переопределение стилей CodeBlock */
  .codeBlock {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  }
  
  .codeBlockLines {
    line-height: 1.6 !important;
    font-size: 14px !important;
  }
  
  .codeBlockContent {
    padding: 16px !important;
  }
  
  .linenumber {
    color: #636d83 !important;
    opacity: 0.85 !important;
    min-width: 40px !important;
    padding-right: 16px !important;
  }
`;

const CodeBlockWrapper = styled.div`
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  
  & pre {
    border-radius: 8px;
    margin: 0 !important;
  }
  
  & code {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace !important;
    font-size: 14px !important;
    line-height: 1.6 !important;
  }
`;

const LanguageTag = styled.span`
  display: inline-flex;
  align-items: center;
  background: #1f1f1f;
  color: #d4d4d4;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  margin-right: 8px;
  font-family: monaco, monospace;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &.python { background: #306998; color: white; }
  &.javascript { background: #f7df1e; color: #000; }
  &.java { background: #5382a1; color: white; }
  &.cpp { background: #00599c; color: white; }
  &.csharp { background: #9b4f96; color: white; }
  &.html { background: #e34c26; color: white; }
  &.css { background: #264de4; color: white; }
  &.json { background: #1e1e1e; color: #8bc34a; }
`;

const GradingFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
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

const ViewCodeButton = styled(Button)`
  border-radius: 6px;
  margin-right: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
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
  const [codeSubmissions, setCodeSubmissions] = useState({});
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [codeModalVisible, setCodeModalVisible] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [currentGradeValue, setCurrentGradeValue] = useState('');
  const { getToken } = useAuth();
  const [detectedLanguage, setDetectedLanguage] = useState('python');
  const codeTheme = atomOneDark;

  // Загрузка оценок
  useEffect(() => {
    if (assignmentId) {
      fetchGradesByAssignment(assignmentId);
    }
  }, [assignmentId, fetchGradesByAssignment]);

  // Загрузка кода заданий
  const fetchCodeSubmissions = useCallback(async () => {
    if (!assignmentId || !students.length) return;
    
    try {
      setLoadingSubmissions(true);
      const token = await getToken();
      
      // Используем основной эндпоинт для получения кода студентов
      const submissionsPromises = students.map(student => {
        const url = `/code-viewer/students/${student.student_id}/assignments/${assignmentId}`;
        
        return api.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
          return {
            ...response.data,
            student_id: student.student_id
          };
        })
        .catch(() => {
          return null;
        });
      });
      
      const results = await Promise.all(submissionsPromises);
      
      // Создаем объект с кодом для каждого студента
      const submissionsObject = {};
      results.forEach(submission => {
        if (submission && (submission.has_submission || submission.code)) {
          submissionsObject[submission.student_id] = submission;
        }
      });
      
      setCodeSubmissions(submissionsObject);
    } catch (error) {
      console.error('Error fetching code submissions:', error);
    } finally {
      setLoadingSubmissions(false);
    }
  }, [assignmentId, students, getToken]);

  useEffect(() => {
    fetchCodeSubmissions();
  }, [fetchCodeSubmissions]);

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

  const handleViewCode = (record) => {
    const submission = codeSubmissions[record.student_id];
    if (submission) {
      setCurrentSubmission(submission);
      setCurrentGradeValue(record.grade?.toString() || '');
      
      // Определяем язык кода
      if (submission.code) {
        const language = detectLanguage(submission.code);
        setDetectedLanguage(language);
      }
      
      setCodeModalVisible(true);
    }
  };

  const handleGradeFromModal = async () => {
    if (!currentSubmission) return;
    
    try {
      const gradeValue = parseInt(currentGradeValue);
      if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > 10) {
        throw new Error('Grade must be a number between 0 and 10');
      }

      const gradeData = {
        assignment_id: assignmentId,
        student_id: currentSubmission.student_id,
        grade: gradeValue
      };

      // Ищем существующую оценку по student_id И assignment_id
      const existingGrade = grades.find(g => 
        g.student_id === currentSubmission.student_id && 
        g.assignment_id === assignmentId
      );
      
      if (existingGrade && existingGrade._id) {
        await updateGrade(existingGrade._id, gradeData);
      } else {
        await createGrade(gradeData);
      }
      
      setCodeModalVisible(false);
      await fetchGradesByAssignment(assignmentId);
    } catch (err) {
      console.error('Error saving grade from modal:', err);
    }
  };

  // Функция определения языка программирования по коду
  const detectLanguage = (code) => {
    if (!code) return 'python';
    
    const firstLines = code.trim().split('\n').slice(0, 5).join('\n').toLowerCase();
    const firstLine = code.trim().split('\n')[0].toLowerCase();
    
    // Пытаемся определить язык по первым строкам
    
    // Python
    if (firstLine.includes('#!/usr/bin/env python') || firstLine.includes('# -*- coding:')) {
      return 'python';
    } else if (firstLines.includes('import ') && (firstLines.includes('from ') || firstLines.includes('as '))) {
      return 'python';
    } else if (firstLines.includes('def ') && firstLines.includes(':')) {
      return 'python';
    } else if (firstLines.includes('class ') && firstLines.includes(':')) {
      return 'python';
    } else if (firstLines.includes('import turtle') || firstLines.includes('from turtle import')) {
      return 'python';
    }
    
    // JavaScript/TypeScript
    if (firstLines.includes('import ') && (firstLines.includes('from \'') || firstLines.includes('from "') || firstLines.includes('react'))) {
      return 'javascript';
    } else if (firstLines.includes('function ') || firstLines.includes('=>') || 
               firstLines.includes('const ') || firstLines.includes('let ') || 
               firstLines.includes('var ')) {
      return 'javascript';
    } else if (firstLines.includes('class ') && firstLines.includes('extends ') && 
              (firstLines.includes('{') || firstLines.includes('constructor'))) {
      return 'javascript';
    }
    
    // Java
    if (firstLines.includes('public class ') || firstLines.includes('private class ') || 
        firstLines.includes('import java.') || firstLines.includes('package ')) {
      return 'java';
    } else if (firstLines.includes('public static void main')) {
      return 'java';
    }
    
    // C/C++
    if (firstLines.includes('#include <') || firstLines.includes('using namespace std')) {
      return 'cpp';
    } else if (firstLines.includes('int main(') || firstLines.includes('void main(')) {
      return 'cpp';
    }
    
    // C#
    if (firstLines.includes('using System;') || firstLines.includes('namespace ')) {
      return 'csharp';
    } else if (firstLines.includes('public class ') && firstLines.includes('static void Main')) {
      return 'csharp';
    }
    
    // HTML/XML
    if (firstLine.includes('<html') || firstLine.includes('<!doctype') || 
        firstLine.includes('<?xml')) {
      return 'html';
    } else if (firstLines.match(/<\w+>.*<\/\w+>/s) || firstLines.includes('</')) {
      return 'html';
    }
    
    // CSS
    if (firstLines.includes('{') && 
        (firstLines.includes('margin:') || firstLines.includes('padding:') || 
         firstLines.includes('color:') || firstLines.includes('background:'))) {
      return 'css';
    }
    
    // JSON
    if ((firstLine.startsWith('{') && firstLines.includes('"')) || 
        (firstLine.startsWith('[') && firstLines.includes('"'))) {
      return 'json';
    }
    
    // По умолчанию используем Python
    return 'python';
  };

  const columns = [
    {
      title: 'Student',
      dataIndex: 'student_name',
      key: 'student_name',
      width: '25%',
      render: (text, record) => (
        <span style={{ fontWeight: 500 }}>{`${record.first_name} ${record.last_name}`}</span>
      ),
    },
    {
      title: 'Submission',
      dataIndex: 'code',
      key: 'code',
      width: '25%',
      render: (text, record) => {
        const hasSubmission = !!codeSubmissions[record.student_id];
        
        return (
          <Space>
            <ViewCodeButton 
              type="primary" 
              onClick={() => handleViewCode(record)}
              disabled={!hasSubmission}
            >
              {hasSubmission ? 'View Code' : 'No Submission'}
            </ViewCodeButton>
            {codeSubmissions[record.student_id]?.submit_date && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Submitted: {new Date(codeSubmissions[record.student_id].submit_date).toLocaleString()}
              </Text>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
      width: '30%',
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
      _id: studentGrade?._id,
      has_submission: !!codeSubmissions[student.student_id]
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
        loading={isLoading || loadingSubmissions}
      />

      {/* Модальное окно для просмотра кода */}
      <Modal
        title={currentSubmission ? `Code Submission - ${students.find(s => s.student_id === currentSubmission.student_id)?.first_name} ${students.find(s => s.student_id === currentSubmission.student_id)?.last_name}` : 'Code Submission'}
        open={codeModalVisible}
        onCancel={() => setCodeModalVisible(false)}
        width={800}
        footer={null}
        styles={{ body: { padding: '16px' } }}
      >
        {currentSubmission ? (
          <>
            <CodeModalContent>
              <Space style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <LanguageTag className={detectedLanguage}>{detectedLanguage}</LanguageTag>
                  {currentSubmission.submit_date && (
                    <Text>Submitted: {new Date(currentSubmission.submit_date).toLocaleDateString()} {new Date(currentSubmission.submit_date).toLocaleTimeString()}</Text>
                  )}
                </div>
              </Space>
              
              <CodeBlockWrapper>
                <CodeBlock
                  text={currentSubmission && 'code' in currentSubmission && currentSubmission.code ? currentSubmission.code : 'No code submitted'}
                  language={detectedLanguage}
                  showLineNumbers={true}
                  theme={codeTheme}
                  wrapLongLines={false}
                  customStyle={{
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace",
                    lineHeight: 1.6,
                    paddingLeft: '8px',
                    paddingRight: '16px'
                  }}
                  codeBlockStyle={{
                    fontSize: '14px',
                    fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace"
                  }}
                />
              </CodeBlockWrapper>
            </CodeModalContent>
            <GradingFooter>
              <Space>
                <Text>Grade:</Text>
                <GradeInput
                  value={currentGradeValue}
                  onChange={e => setCurrentGradeValue(e.target.value)}
                  placeholder="0-10"
                  onPressEnter={handleGradeFromModal}
                />
                <QuickGradeButton
                  type="primary"
                  size="small"
                  className="max-grade"
                  onClick={() => {
                    setCurrentGradeValue('10');
                    handleGradeFromModal();
                  }}
                >
                  10
                </QuickGradeButton>
                <QuickGradeButton
                  type="primary"
                  size="small"
                  className="min-grade"
                  onClick={() => {
                    setCurrentGradeValue('3');
                    handleGradeFromModal();
                  }}
                >
                  3
                </QuickGradeButton>
              </Space>
              <Button type="primary" onClick={handleGradeFromModal}>
                Save Grade
              </Button>
            </GradingFooter>
          </>
        ) : (
          <Spin />
        )}
      </Modal>
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