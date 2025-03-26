import React from 'react';
import { Table, Button, Space } from 'antd';
import { Link } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, LineChartOutlined } from '@ant-design/icons';

const StudentsList = ({ students, groupId, onEdit, onDelete }) => {
    const columns = [
        {
            title: 'Имя',
            dataIndex: 'first_name',
            key: 'first_name',
            sorter: (a, b) => a.first_name.localeCompare(b.first_name),
        },
        {
            title: 'Фамилия',
            dataIndex: 'last_name',
            key: 'last_name',
            sorter: (a, b) => a.last_name.localeCompare(b.last_name),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Link to={`/groups/${groupId}/students/${record.id}/grades`}>
                        <Button 
                            icon={<LineChartOutlined />}
                            type="primary"
                            ghost
                        >
                            Оценки
                        </Button>
                    </Link>
                    <Button 
                        onClick={() => onEdit(record)}
                        icon={<EditOutlined />}
                    >
                        Изменить
                    </Button>
                    <Button 
                        onClick={() => onDelete(record.id)}
                        danger
                        icon={<DeleteOutlined />}
                    >
                        Удалить
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <Table 
            columns={columns} 
            dataSource={students}
            rowKey="id"
        />
    );
};

export default StudentsList; 