import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from "@clerk/clerk-react";
import api from '../services/api';
import { Table, Tag, Button, Spin, message } from 'antd';
import PropTypes from 'prop-types';

const SubmitsTable = ({ lessonId, assignments, students }) => {
    const [submits, setSubmits] = useState([]);
    const [loading, setLoading] = useState(true);
    const { getToken } = useAuth();

    // Мемоизируем функцию получения отправок
    const fetchSubmits = useCallback(async () => {
        if (!lessonId || !assignments.length || !students.length) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const token = await getToken();
            
            // Получаем все отправки для каждого студента и задания
            const submitsPromises = students.map(student => 
                assignments.map(assignment => 
                    api.get(`/assignment-submit/students/${student.student_id}/assignments/${assignment.id}/submit`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }).then(response => ({
                        ...response.data,
                        student_name: `${student.first_name} ${student.last_name}`,
                        assignment_title: assignment.title,
                        student_id: student.student_id,
                        assignment_id: assignment.id
                    })).catch(() => ({
                        student_id: student.student_id,
                        student_name: `${student.first_name} ${student.last_name}`,
                        assignment_id: assignment.id,
                        assignment_title: assignment.title,
                        is_submitted: false
                    }))
                )
            ).flat();

            const results = await Promise.all(submitsPromises);
            setSubmits(results.flat());
        } catch (error) {
            console.error('Error fetching submits:', error);
            message.error('Failed to load submissions');
        } finally {
            setLoading(false);
        }
    }, [lessonId, assignments, students, getToken]);

    // Используем useEffect только для начальной загрузки
    useEffect(() => {
        fetchSubmits();
    }, [fetchSubmits]);

    // Мемоизируем функцию обработки отправки
    const handleSubmit = useCallback(async (studentId, assignmentId, isSubmitted, submitId = null) => {
        try {
            setLoading(true);
            const token = await getToken();
            
            if (isSubmitted && submitId) {
                await api.delete(`/assignment-submit/submits/${submitId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                message.success('Submission cancelled successfully');
            } else {
                await api.post(`/assignment-submit/students/${studentId}/lessons/${lessonId}/assignments/${assignmentId}/submit`, {
                    is_submitted: true,
                    submit_date: new Date().toISOString(),
                    code: "Example code for submission"
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                message.success('Assignment submitted successfully');
            }
            
            await fetchSubmits();
        } catch (error) {
            console.error('Error handling submit:', error);
            message.error(isSubmitted ? 'Failed to cancel submission' : 'Failed to submit assignment');
        } finally {
            setLoading(false);
        }
    }, [lessonId, fetchSubmits, getToken]);

    // Мемоизируем колонки таблицы
    const columns = useMemo(() => [
        {
            title: 'Student',
            dataIndex: 'student_name',
            key: 'student_name',
            sorter: (a, b) => a.student_name.localeCompare(b.student_name)
        },
        {
            title: 'Assignment',
            dataIndex: 'assignment_title',
            key: 'assignment_title',
            sorter: (a, b) => a.assignment_title.localeCompare(b.assignment_title)
        },
        {
            title: 'Status',
            dataIndex: 'is_submitted',
            key: 'is_submitted',
            render: (isSubmitted) => (
                <Tag color={isSubmitted ? 'success' : 'error'}>
                    {isSubmitted ? 'Submitted' : 'Not Submitted'}
                </Tag>
            ),
            sorter: (a, b) => (a.is_submitted === b.is_submitted ? 0 : a.is_submitted ? 1 : -1)
        },
        {
            title: 'Submission Date',
            dataIndex: 'submit_date',
            key: 'submit_date',
            render: (date) => date ? new Date(date).toLocaleDateString() : '-',
            sorter: (a, b) => {
                if (!a.submit_date) return -1;
                if (!b.submit_date) return 1;
                return new Date(a.submit_date) - new Date(b.submit_date);
            }
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button
                    type={record.is_submitted ? 'default' : 'primary'}
                    onClick={() => handleSubmit(record.student_id, record.assignment_id, record.is_submitted, record.id)}
                >
                    {record.is_submitted ? 'Cancel Submit' : 'Submit'}
                </Button>
            )
        }
    ], [handleSubmit]);

    // Мемоизируем настройки пагинации
    const paginationConfig = useMemo(() => ({
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `Total ${total} submissions`
    }), []);

    if (!lessonId || !assignments.length || !students.length) {
        return (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No data available</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden bg-white rounded-lg">
            <Spin spinning={loading}>
                <Table
                    columns={columns}
                    dataSource={submits}
                    rowKey={(record) => `${record.student_id}-${record.assignment_id}`}
                    pagination={paginationConfig}
                />
            </Spin>
        </div>
    );
};

SubmitsTable.propTypes = {
    lessonId: PropTypes.string,
    assignments: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired
        })
    ).isRequired,
    students: PropTypes.arrayOf(
        PropTypes.shape({
            student_id: PropTypes.string.isRequired,
            first_name: PropTypes.string.isRequired,
            last_name: PropTypes.string.isRequired
        })
    ).isRequired
};

export default SubmitsTable; 